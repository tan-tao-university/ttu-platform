import type { Request } from 'express';

/**
 * The claims `JwtAuthGuard` actually reads off a Keycloak-issued access token. Keycloak's tokens
 * carry profile fields and realm/client roles too, but none of that is trusted — `sub` is the only
 * identity claim used, to resolve (or JIT-provision) the row in our own `users` table that carries
 * the CMS role assignments that actually matter here (design doc 07 §2, §6).
 */
export interface KeycloakAccessTokenPayload {
  /** Keycloak's user id — matched against `users.identity_subject`. */
  sub: string;
  /**
   * The realm base URL, e.g. `https://auth.ttu.edu.vn/realms/ttu`. Checked against
   * `keycloakAuth.issuerUrl`.
   */
  iss: string;
  /**
   * The client the token was issued for (`ttu-web`). Required, not merely checked when present — a
   * token minted for a different client in the same realm must never be replayed against this API
   * (doc 07 §6, §18).
   */
  azp?: string;
  exp: number;
  email?: string;
  name?: string;
}

/**
 * `users` row plus its effective CMS permission set (doc 07 §7, §9). `permissions` is empty for an
 * inactive account even if `user_role_assignments` still lists grants — `is_active = false` revokes
 * access without deleting the mapping or its history.
 */
export interface AuthenticatedUser {
  id: string;
  identitySubject: string;
  isActive: boolean;
  permissions: Set<string>;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
