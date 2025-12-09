import { randomUUID } from 'crypto';
import {
  SESSION_COOKIE,
  USER_COOKIE,
  createCookieHeader,
  resolveUserId,
} from '../cookies';

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  const newSessionId = randomUUID();
  const { value: userId, shouldSetCookie: shouldSetUserCookie } =
    resolveUserId(cookieHeader);

  const headers = new Headers();
  headers.append('Set-Cookie', createCookieHeader(SESSION_COOKIE, newSessionId));
  if (shouldSetUserCookie) {
    headers.append('Set-Cookie', createCookieHeader(USER_COOKIE, userId));
  }

  return Response.json(
    { sessionId: newSessionId },
    {
      headers,
    },
  );
}
