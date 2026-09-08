import { optionalEnv, requireEnv } from './database';

// Separated from `config/database.ts` for the same reason that file is separated from a
// future `config/env.ts`: a script needing only the database (a migration helper) should
// not have to be handed Keycloak settings it never reads.

/**
 * Points at ttu-identity's Keycloak realm (see ../ttu-identity, sibling repo). Both the
 * token issuer `JwtAuthGuard` requires and the base URL it derives the JWKS endpoint from,
 * e.g. `http://localhost:8080/realms/ttu` in dev, `https://auth.ttu.edu.vn/realms/ttu` in
 * production.
 */
const keycloakIssuerUrl = requireEnv('KEYCLOAK_ISSUER_URL');

export const keycloakAuth = {
  issuerUrl: keycloakIssuerUrl,
  /** The realm client every access token must have been issued for (checked against the
   *  token's `azp` claim) — see ../ttu-identity's `ttu-web` client. */
  clientId: optionalEnv('KEYCLOAK_CLIENT_ID', 'ttu-web'),
  jwksUri: `${keycloakIssuerUrl}/protocol/openid-connect/certs`,
} as const;
