import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { decryptSession, SESSION_COOKIE, type Session } from './session';

/**
 * Read-only session lookup for Server Components. `middleware.ts` already refreshed an
 * about-to-expire session and rejected an unrecoverable one before the request reached here — a
 * Server Component cannot set cookies itself, so it never attempts to refresh.
 *
 * Wrapped in React `cache()` so `layout.tsx` and `page.tsx` reading it in the same request share
 * one decrypt instead of paying it twice.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return decryptSession(value);
});
