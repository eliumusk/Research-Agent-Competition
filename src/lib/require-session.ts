import 'server-only';

import { NextResponse } from 'next/server';
import { auth } from './auth';
import type { Session } from './auth-types';

/**
 * Validates session for API routes
 *
 * This helper provides consistent session validation across protected API routes.
 * It validates the session on the server using Better Auth's auth.api.getSession.
 *
 * @param request - The incoming request
 * @returns Session object if valid, null otherwise
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const session = await requireSession(request);
 *   if (!session) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // Use session.user.id, session.user.email, etc.
 * }
 * ```
 */
export async function requireSession(
  request: Request
): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return null;
  }

  return session;
}

/**
 * Creates a 401 Unauthorized response for API routes
 *
 * @param message - Optional custom error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
