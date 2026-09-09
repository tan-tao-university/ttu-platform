import 'server-only';
import { EncryptJWT, type JWTPayload, jwtDecrypt } from 'jose';
import { getAuthConfig } from './config';

/**
 * Encrypted, `HttpOnly` cookie session (design doc 07 §5: "Không lưu access token lâu dài trong
 * `localStorage`... Cookie chứa session identifier hoặc session state phải dùng `HttpOnly`,
 * `Secure` và `SameSite` phù hợp"). Tokens live only inside a JWE the browser cannot read; nothing
 * from Keycloak is ever exposed to client-side JS.
 */

export const SESSION_COOKIE = 'ttu_admin_session';
/** Short-lived — holds the in-flight login attempt's PKCE verifier, `state`, and `nonce`. */
export const TXN_COOKIE = 'ttu_admin_oidc_txn';

const TXN_TTL_SECONDS = 10 * 60;

export interface Session {
  sub: string;
  email: string | null;
  displayName: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface OidcTransaction {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
}

let cachedKey: Promise<Uint8Array> | undefined;

/**
 * `SESSION_SECRET` is assumed high-entropy already (see `config.ts`), so a direct SHA-256 digest
 * into an AES-256-GCM key is sufficient — no separate KDF needed.
 */
function getEncryptionKey(): Promise<Uint8Array> {
  cachedKey ??= crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(getAuthConfig().sessionSecret))
    .then((digest) => new Uint8Array(digest));
  return cachedKey;
}

async function encrypt(payload: JWTPayload, expiresAtEpochSeconds: number): Promise<string> {
  const key = await getEncryptionKey();
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(expiresAtEpochSeconds)
    .encrypt(key);
}

async function decrypt(token: string): Promise<JWTPayload | null> {
  try {
    const key = await getEncryptionKey();
    const { payload } = await jwtDecrypt(token, key);
    return payload;
  } catch {
    return null;
  }
}

export function encryptSession(session: Session): Promise<string> {
  return encrypt({ ...session }, session.refreshTokenExpiresAt);
}

export async function decryptSession(token: string): Promise<Session | null> {
  const payload = await decrypt(token);
  if (!payload || typeof payload.sub !== 'string' || typeof payload.accessToken !== 'string') {
    return null;
  }
  return payload as unknown as Session;
}

export function encryptTransaction(txn: OidcTransaction): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return encrypt({ ...txn }, nowSeconds + TXN_TTL_SECONDS);
}

export async function decryptTransaction(token: string): Promise<OidcTransaction | null> {
  const payload = await decrypt(token);
  if (!payload || typeof payload.state !== 'string' || typeof payload.codeVerifier !== 'string') {
    return null;
  }
  return payload as unknown as OidcTransaction;
}

export function sessionCookieOptions(expiresAtEpochSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(expiresAtEpochSeconds * 1000),
  };
}

export function txnCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TXN_TTL_SECONDS,
  };
}
