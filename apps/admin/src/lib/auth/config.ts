import 'server-only';

/**
 * OIDC configuration for the browser-side Authorization Code + PKCE flow against `ttu-identity`'s
 * `ttu` realm, client `ttu-web` (design doc 07 §3-4). Server-only: never bundled into client JS.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

const keycloakIssuerUrl = requireEnv('KEYCLOAK_ISSUER_URL');
/**
 * E.g. `http://localhost:3011` in dev — the fixed, allowlisted origin this app is served from (doc
 * 07 §4: "Redirect URI được allowlist theo môi trường"). Deliberately not derived from the
 * request's `Host` header, which a client can spoof.
 */
const appBaseUrl = requireEnv('APP_BASE_URL').replace(/\/+$/, '');

export const authConfig = {
  issuerUrl: keycloakIssuerUrl,
  clientId: optionalEnv('KEYCLOAK_CLIENT_ID', 'ttu-web'),
  authorizationEndpoint: `${keycloakIssuerUrl}/protocol/openid-connect/auth`,
  tokenEndpoint: `${keycloakIssuerUrl}/protocol/openid-connect/token`,
  jwksUri: `${keycloakIssuerUrl}/protocol/openid-connect/certs`,
  redirectUri: `${appBaseUrl}/api/auth/callback`,
  /**
   * High-entropy random value (e.g. `openssl rand -base64 32`), never a passphrase — it is hashed
   * directly into the AES-256-GCM key that encrypts the session cookie (`lib/auth/session.ts`).
   */
  sessionSecret: requireEnv('SESSION_SECRET'),
  apiUrl: optionalEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4001/api/v1'),
} as const;
