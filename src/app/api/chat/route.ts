import { randomUUID } from 'crypto';
import {
  type UIMessage,
  type UIMessageChunk,
  createUIMessageStreamResponse,
} from 'ai';
import {
  SESSION_COOKIE,
  USER_COOKIE,
  createCookieHeader,
  resolveSessionId,
  resolveUserId,
} from './cookies';

export const maxDuration = 300;

type ChatRequestPayload = {
  messages: UIMessage[];
  model?: string;
  webSearch?: boolean;
};

export async function POST(req: Request) {
  const agentBaseUrl = process.env.AGNO_AGENT_BASE_URL;
  const agentId = process.env.AGNO_AGENT_ID;

  if (!agentBaseUrl || !agentId) {
    return new Response('Agent service is not configured.', { status: 500 });
  }

  const { messages }: ChatRequestPayload = await req.json();
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user');
  const textPart = lastUserMessage?.parts.find(
    (part): part is { type: 'text'; text: string } =>
      part.type === 'text' && typeof part.text === 'string'
  );

  if (!textPart?.text?.trim()) {
    return new Response('Missing user input.', { status: 400 });
  }

  const cookieHeader = req.headers.get('cookie');
  const { value: sessionId, shouldSetCookie: shouldSetSessionCookie } =
    resolveSessionId(cookieHeader);
  const { value: userId, shouldSetCookie: shouldSetUserCookie } =
    resolveUserId(cookieHeader);

  const form = new FormData();
  form.set('message', textPart.text);
  form.set('stream', 'true');
  form.set('session_id', sessionId);
  form.set('user_id', userId);

  const response = await fetch(
    `${agentBaseUrl.replace(/\/$/, '')}/agents/${agentId}/runs`,
    {
      method: 'POST',
      body: form,
      headers: {
        Accept: 'text/event-stream',
      },
    }
  );

  if (!response.ok || !response.body) {
    const errorText = await safeReadText(response);
    return new Response(errorText || 'Agent request failed.', {
      status: response.status || 502,
    });
  }

  const stream = createChatStream(response.body);
  const headers = new Headers();

  if (shouldSetSessionCookie) {
    headers.append('Set-Cookie', createCookieHeader(SESSION_COOKIE, sessionId));
  }
  if (shouldSetUserCookie) {
    headers.append('Set-Cookie', createCookieHeader(USER_COOKIE, userId));
  }

  return createUIMessageStreamResponse({
    stream,
    headers,
  });
}

function createChatStream(source: ReadableStream<Uint8Array>) {
  const textPartId = randomUUID();
  const reasoningPartId = randomUUID();

  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const reader = source.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let textStarted = false;
      let textCompleted = false;
      let reasoningStarted = false;
      let reasoningCompleted = false;
      let hasTextContent = false;
      let hasReasoningContent = false;

      const enqueueChunk = (chunk: UIMessageChunk) => {
        controller.enqueue(chunk);
      };

      const ensureTextStart = () => {
        if (!textStarted) {
          textStarted = true;
          enqueueChunk({ type: 'text-start', id: textPartId });
        }
      };

      const ensureReasoningStart = () => {
        if (!reasoningStarted) {
          reasoningStarted = true;
          enqueueChunk({ type: 'reasoning-start', id: reasoningPartId });
        }
      };

      const completeText = () => {
        if (textStarted && !textCompleted) {
          textCompleted = true;
          enqueueChunk({ type: 'text-end', id: textPartId });
        }
      };

      const completeReasoning = () => {
        if (reasoningStarted && !reasoningCompleted) {
          reasoningCompleted = true;
          enqueueChunk({ type: 'reasoning-end', id: reasoningPartId });
        }
      };

      const closeStream = () => {
        completeText();
        completeReasoning();
        controller.close();
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            if (buffer.trim().length > 0) {
              processBufferChunk(buffer);
            }
            closeStream();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          buffer = processBufferChunk(buffer);
        }
      } catch (error) {
        controller.error(error);
      }

      function processBufferChunk(pending: string): string {
        let workingBuffer = pending;
        let separatorIndex = workingBuffer.indexOf('\n\n');

        while (separatorIndex !== -1) {
          const rawEvent = workingBuffer.slice(0, separatorIndex).trim();
          workingBuffer = workingBuffer.slice(separatorIndex + 2);
          if (rawEvent.length > 0) {
            handleEvent(rawEvent);
          }
          separatorIndex = workingBuffer.indexOf('\n\n');
        }

        return workingBuffer;
      }

      function handleEvent(serializedEvent: string) {
        const { event, data } = parseSseEvent(serializedEvent);
        if (!event) {
          return;
        }

        switch (event) {
          case 'RunContent': {
            if (typeof data?.reasoning_content === 'string') {
              ensureReasoningStart();
              hasReasoningContent = true;
              enqueueChunk({
                type: 'reasoning-delta',
                id: reasoningPartId,
                delta: data.reasoning_content,
              });
            }
            if (typeof data?.content === 'string') {
              ensureTextStart();
              hasTextContent = true;
              enqueueChunk({
                type: 'text-delta',
                id: textPartId,
                delta: data.content,
              });
            }
            break;
          }
          case 'RunContentCompleted': {
            completeReasoning();
            break;
          }
          case 'RunCompleted': {
            if (typeof data?.content === 'string' && !hasTextContent) {
              ensureTextStart();
              enqueueChunk({
                type: 'text-delta',
                id: textPartId,
                delta: data.content,
              });
              hasTextContent = true;
            }
            if (
              typeof data?.reasoning_content === 'string' &&
              !hasReasoningContent
            ) {
              ensureReasoningStart();
              enqueueChunk({
                type: 'reasoning-delta',
                id: reasoningPartId,
                delta: data.reasoning_content,
              });
              hasReasoningContent = true;
            }
            completeText();
            completeReasoning();
            break;
          }
          case 'RunError': {
            const errorText =
              (typeof data === 'string' && data) ||
              data?.content ||
              'Agent execution failed';
            enqueueChunk({ type: 'error', errorText });
            closeStream();
            reader.cancel().catch(() => undefined);
            break;
          }
          default:
            break;
        }
      }
    },
  });
}

function parseSseEvent(serialized: string): {
  event: string | null;
  data: any;
} {
  const lines = serialized.split('\n');
  let eventName: string | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  const dataPayload = dataLines.join('\n');
  if (!dataPayload) {
    return { event: eventName, data: null };
  }

  try {
    return { event: eventName, data: JSON.parse(dataPayload) };
  } catch {
    return { event: eventName, data: dataPayload };
  }
}

async function safeReadText(response: Response) {
  try {
    return await response.text();
  } catch {
    return null;
  }
}
