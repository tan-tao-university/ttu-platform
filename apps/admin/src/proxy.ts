import { type NextRequest, NextResponse } from 'next/server';
import { refreshTokens } from '@/lib/auth/keycloak';
import {
  decryptSession,
  encryptSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth/session';

/**
 * Refresh a bit before actual expiry so a request never races an access token that expires
 * mid-flight against `apps/api`.
 */
const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 30;

/**
 * Gates every admin page behind a valid session (design doc 07 §4, §6). Runs before any Server
 * Component, so it is the only place that can both read _and rewrite_ the session cookie — a Server
 * Component can read `cookies()` but never set one, so the refresh-on-expiry step has to live here,
 * not in `getSession()`.
 */
export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? await decryptSession(sessionCookie) : null;
  if (!session) return redirectToLogin(request);

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (session.accessTokenExpiresAt - ACCESS_TOKEN_REFRESH_SKEW_SECONDS > nowSeconds) {
    return NextResponse.next();
  }
  if (session.refreshTokenExpiresAt <= nowSeconds) {
    return redirectToLogin(request, { clearSession: true });
  }

  try {
    const tokens = await refreshTokens(session.refreshToken);
    const refreshed = {
      ...session,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: nowSeconds + tokens.expires_in,
      refreshTokenExpiresAt: nowSeconds + tokens.refresh_expires_in,
    };
    const response = NextResponse.next();
    response.cookies.set(
      SESSION_COOKIE,
      await encryptSession(refreshed),
      sessionCookieOptions(refreshed.refreshTokenExpiresAt),
    );
    return response;
  } catch (error) {
    console.error('Session refresh failed', error);
    return redirectToLogin(request, { clearSession: true });
  }
}

function redirectToLogin(request: NextRequest, options?: { clearSession: boolean }): NextResponse {
  const loginUrl = new URL('/api/auth/login', request.url);
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(loginUrl);
  if (options?.clearSession) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  // Everything except the OIDC routes themselves, Next internals, and static assets.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
