import { type NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, verifyIdToken } from '@/lib/auth/keycloak';
import {
  decryptTransaction,
  encryptSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  type Session,
  TXN_COOKIE,
} from '@/lib/auth/session';

/**
 * Completes the Authorization Code + PKCE flow (design doc 07 §4): validates `state` against the
 * transaction cookie, exchanges the code, verifies the ID token's signature/issuer/client/`nonce`,
 * then sets the encrypted session cookie. Any failure redirects to `/` rather than leaking detail
 * into a URL — `middleware.ts` finds no valid session there and restarts the login attempt.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  if (url.searchParams.get('error')) {
    console.error(`Keycloak returned an OIDC error: ${url.searchParams.get('error')}`);
    return restart(request);
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return restart(request);

  const txnCookie = request.cookies.get(TXN_COOKIE)?.value;
  const txn = txnCookie ? await decryptTransaction(txnCookie) : null;
  if (!txn || txn.state !== state) {
    console.error('OIDC callback: missing or mismatched transaction cookie');
    return restart(request);
  }

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code, txn.codeVerifier);
  } catch (error) {
    console.error('OIDC callback: token exchange failed', error);
    return restart(request);
  }

  let claims;
  try {
    claims = await verifyIdToken(tokens.id_token);
  } catch (error) {
    console.error('OIDC callback: id_token verification failed', error);
    return restart(request);
  }
  if (claims.nonce !== txn.nonce) {
    console.error('OIDC callback: nonce mismatch');
    return restart(request);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const session: Session = {
    sub: claims.sub,
    email: claims.email ?? null,
    displayName: claims.name ?? null,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessTokenExpiresAt: nowSeconds + tokens.expires_in,
    refreshTokenExpiresAt: nowSeconds + tokens.refresh_expires_in,
  };

  const response = NextResponse.redirect(new URL(txn.returnTo, request.url));
  response.cookies.set(
    SESSION_COOKIE,
    await encryptSession(session),
    sessionCookieOptions(session.refreshTokenExpiresAt),
  );
  response.cookies.delete(TXN_COOKIE);
  return response;
}

function restart(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/', request.url));
}
