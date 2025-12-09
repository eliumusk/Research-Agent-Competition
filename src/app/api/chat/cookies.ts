import { randomUUID } from 'crypto';

export const SESSION_COOKIE = 'agno_agent_session';
export const USER_COOKIE = 'agno_agent_user';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

type CookieResolution = {
  value: string;
  shouldSetCookie: boolean;
};

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const pairs = cookieHeader.split(';').map((cookie) => cookie.trim());
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    if (!pair) continue;
    const [name, ...valueParts] = pair.split('=');
    const value = valueParts.join('=');
    if (name) {
      result[name] = value;
    }
  }
  return result;
}

export function resolveSessionId(cookieHeader: string | null): CookieResolution {
  const cookies = parseCookies(cookieHeader);
  const existing = cookies[SESSION_COOKIE];
  if (existing) {
    return { value: existing, shouldSetCookie: false };
  }
  return {
    value: randomUUID(),
    shouldSetCookie: true,
  };
}

export function resolveUserId(cookieHeader: string | null): CookieResolution {
  const cookies = parseCookies(cookieHeader);
  const existing = cookies[USER_COOKIE];
  if (existing) {
    return { value: existing, shouldSetCookie: false };
  }
  return {
    value: `anon_${randomUUID()}`,
    shouldSetCookie: true,
  };
}

export function createCookieHeader(name: string, value: string) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}
