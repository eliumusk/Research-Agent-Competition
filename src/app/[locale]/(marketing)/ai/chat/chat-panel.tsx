'use client';

import { Response } from '@/components/ai-elements/response';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { ArrowUpIcon, HammerIcon, Loader2Icon } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type ChatPanelProps = {
  placeholder: string;
  sendLabel: string;
  thinkingLabel: string;
  newChatLabel: string;
  emptyState: {
    title: string;
    description: string;
  };
};

type TextPart = {
  type: 'text';
  text: string;
  state?: 'streaming' | 'done';
};

type ReasoningPart = {
  type: 'reasoning';
  text: string;
  state?: 'streaming' | 'done';
};

type ToolCallPart =
  | Extract<UIMessage['parts'][number], { type: `tool-${string}` }>
  | Extract<UIMessage['parts'][number], { type: 'dynamic-tool' }>;

export function ChatPanel({
  placeholder,
  sendLabel,
  thinkingLabel,
  newChatLabel,
  emptyState,
}: ChatPanelProps) {
  const { messages, sendMessage, status, setMessages } = useChat();
  const [input, setInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
  }, [messages, status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    setInput('');
    void sendMessage({ text: value });
  };

  const isBusy = status === 'submitted' || status === 'streaming';
  const canSend = input.trim().length > 0 && !isBusy;

  const handleNewChat = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const response = await fetch('/api/chat/new-session', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to create a new session');
      }
      setMessages([]);
      setInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  const renderedMessages = useMemo(() => {
    return messages.map((message) => {
      const textParts = message.parts.filter(
        (part): part is TextPart =>
          part.type === 'text' && typeof (part as TextPart).text === 'string'
      );
      const reasoningParts = message.parts.filter(
        (part): part is ReasoningPart =>
          part.type === 'reasoning' &&
          typeof (part as ReasoningPart).text === 'string'
      );

      const finishedTextParts = textParts.filter(
        (part) => part.state !== 'streaming'
      );
      const finishedReasoningParts = reasoningParts.filter(
        (part) => part.state !== 'streaming'
      );

      const stableTextParts =
        finishedTextParts.length > 0
          ? finishedTextParts
          : textParts.length > 0
            ? [textParts[textParts.length - 1]]
            : [];
      const stableReasoningParts =
        finishedReasoningParts.length > 0
          ? finishedReasoningParts
          : reasoningParts.length > 0
            ? [reasoningParts[reasoningParts.length - 1]]
            : [];

      const hasContent =
        stableTextParts.length > 0 || stableReasoningParts.length > 0;
      if (!hasContent) {
        return null;
      }

      return {
        message,
        textParts: stableTextParts,
        reasoningParts: stableReasoningParts,
      };
    });
  }, [messages]);

  const activeToolCall = useMemo(() => {
    const latestAssistant = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant');
    if (!latestAssistant) {
      return { count: 0, pending: false };
    }
    const toolCalls = latestAssistant.parts.filter(
      (part): part is ToolCallPart =>
        part.type.startsWith('tool-') || part.type === 'dynamic-tool'
    );
    if (toolCalls.length === 0) {
      return { count: 0, pending: false };
    }
    return {
      count: toolCalls.length,
      pending: toolCalls.some((call) =>
        'providerExecuted' in call ? call.providerExecuted !== true : true
      ),
    };
  }, [messages]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[28px] border border-border/60 bg-background/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,1)]">
        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleNewChat}
            disabled={isResetting}
            className="gap-2 rounded-full border border-border/60 bg-background/70 px-4"
          >
            {isResetting ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <HammerIcon className="size-3.5" />
            )}
            <span className="text-xs font-medium uppercase tracking-wide">
              {newChatLabel}
            </span>
          </Button>
        </div>
        <div
          ref={viewportRef}
          className="flex max-h-[460px] min-h-[320px] flex-col gap-4 overflow-y-auto pr-2"
        >
          {!messages.length && (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <p className="text-base font-medium text-foreground">
                {emptyState.title}
              </p>
              <p className="mt-2 max-w-sm leading-relaxed">
                {emptyState.description}
              </p>
            </div>
          )}

          {activeToolCall.pending && (
            <div className="flex w-full justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <HammerIcon className="size-3.5" />
                <span>
                  {activeToolCall.count === 1
                    ? 'Tool call in progress'
                    : `${activeToolCall.count} tool calls in progress`}
                </span>
                <Loader2Icon className="size-3 animate-spin text-primary" />
              </div>
            </div>
          )}

          {renderedMessages.map((entry) => {
            if (!entry) {
              return null;
            }

            const { message, textParts, reasoningParts } = entry;
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={cn(
                  'flex w-full',
                  isUser ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors',
                    isUser
                      ? 'border-primary/30 bg-primary text-primary-foreground'
                      : 'border-border/70 bg-muted/60 text-foreground'
                  )}
                >
                  {textParts.map((part, index) => (
                    <Response
                      key={`${message.id}-text-${index}`}
                      className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed dark:prose-invert [&:not(:first-child)]:mt-3"
                    >
                      {part.text}
                    </Response>
                  ))}
                  {reasoningParts.map((part, index) => (
                    <p
                      key={`${message.id}-reasoning-${index}`}
                      className={cn(
                        'mt-3 rounded-2xl border border-border/40 bg-background/70 px-3 py-2 text-xs text-muted-foreground',
                        isUser && 'border-primary/50 bg-primary/20'
                      )}
                    >
                      {part.text}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}

          {isBusy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              {thinkingLabel}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 rounded-full border border-border/70 bg-background/90 px-4 py-2 shadow-[0_10px_40px_-25px_rgba(15,23,42,1)] transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
      >
        <input
          className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
          placeholder={placeholder}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isBusy}
        />
        <Button
          type="submit"
          size="icon"
          className="size-11 rounded-full"
          disabled={!canSend}
        >
          <ArrowUpIcon className="size-4" />
          <span className="sr-only">{sendLabel}</span>
        </Button>
      </form>
    </div>
  );
}
