import { type NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl } from '@/lib/auth/keycloak';
import { generateCodeChallenge, generateRandomToken } from '@/lib/auth/pkce';
import { encryptTransaction, TXN_COOKIE, txnCookieOptions } from '@/lib/auth/session';

/**
 * Starts the Authorization Code + PKCE flow (design doc 07 §4): generates `state`/`nonce`/PKCE
 * `code_verifier`, stashes them in a short-lived encrypted cookie, and redirects to Keycloak.
 */
export async function GET(request: NextRequest) {
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get('returnTo'));
  const state = generateRandomToken();
  const nonce = generateRandomToken();
  const codeVerifier = generateRandomToken(48);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const response = NextResponse.redirect(buildAuthorizationUrl({ state, nonce, codeChallenge }));
  response.cookies.set(
    TXN_COOKIE,
    await encryptTransaction({ state, nonce, codeVerifier, returnTo }),
    txnCookieOptions(),
  );
  return response;
}

/**
 * Only ever redirect back into this app — never an attacker-supplied absolute URL (open redirect
 * via a crafted `returnTo`).
 */
function sanitizeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}
