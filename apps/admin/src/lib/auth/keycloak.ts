import 'server-only';
import { createRemoteJWKSet, jwtVerify, type RemoteJWKSet } from 'jose';
import { getAuthConfig } from './config';

/**
 * Lazily created on first use, then cached — `jose` handles its own JWKS refresh/rotation
 * internally. Deferred for the same reason `config.ts`'s values are: it must not run during `next
 * build`'s module-graph import.
 */
let jwks: RemoteJWKSet | undefined;

function getJwks(): RemoteJWKSet {
  jwks ??= createRemoteJWKSet(new URL(getAuthConfig().jwksUri));
  return jwks;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

export function buildAuthorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const config = getAuthConfig();
  const url = new URL(config.authorizationEndpoint);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', params.state);
  url.searchParams.set('nonce', params.nonce);
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  return requestToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getAuthConfig().redirectUri,
    code_verifier: codeVerifier,
  });
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken });
}

async function requestToken(fields: Record<string, string>): Promise<TokenResponse> {
  const config = getAuthConfig();
  const body = new URLSearchParams({ client_id: config.clientId, ...fields });
  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw new Error(
      `Keycloak token endpoint returned ${response.status}: ${await response.text()}`,
    );
  }
  return response.json();
}

export interface IdTokenClaims {
  sub: string;
  email?: string;
  name?: string;
  nonce?: string;
}

/**
 * Verifies signature, issuer, and expiry via the realm's JWKS, then requires `azp` to name this
 * exact client — the same strict check `apps/api`'s `JwtAuthGuard` applies to access tokens, so a
 * token minted for a different client in the same realm can never be replayed here either. Callers
 * must separately compare `nonce` against the value generated at login (`§4` — replay defense the
 * signature check alone does not provide).
 */
export async function verifyIdToken(idToken: string): Promise<IdTokenClaims> {
  const config = getAuthConfig();
  const { payload } = await jwtVerify(idToken, getJwks(), { issuer: config.issuerUrl });
  if (payload.azp !== config.clientId) {
    throw new Error('id_token was not issued for this client');
  }
  if (typeof payload.sub !== 'string') {
    throw new Error('id_token is missing "sub"');
  }
  return {
    sub: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    nonce: typeof payload.nonce === 'string' ? payload.nonce : undefined,
  };
}
