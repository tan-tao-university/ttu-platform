import 'server-only';

/**
 * PKCE and OIDC nonce/state helpers (design doc 07 §4). Pure Web Crypto — no `Buffer` — so this
 * works unchanged whether the caller runs in a Route Handler (Node.js runtime) or `middleware.ts`
 * (Edge runtime).
 */

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Used for both `state` and `nonce`, and — at a larger length — the PKCE `code_verifier`. */
export function generateRandomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return base64url(new Uint8Array(digest));
}
