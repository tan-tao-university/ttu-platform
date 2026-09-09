import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser, KeycloakAccessTokenPayload } from '../access.types';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Resolves a verified Keycloak token into the local CMS identity `JwtAuthGuard` attaches to
 * `request.user`. Authentication already happened by the time this runs — this only answers "which
 * `ttu_main` user is this, and what can they do" (doc 07 §2).
 */
@Injectable()
export class IdentityService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async resolveFromToken(payload: KeycloakAccessTokenPayload): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findOrCreateByIdentitySubject(payload.sub, {
      email: payload.email,
      displayName: payload.name,
    });

    return {
      id: user.id,
      identitySubject: user.identitySubject,
      isActive: user.isActive,
      // Revoked/deactivated locally without touching Keycloak (doc 07 §16) — the permission
      // set collapses to empty rather than the mapping being deleted, so history referencing
      // this user (audit, `created_by`, ...) stays intact.
      permissions: user.isActive ? new Set(user.permissions) : new Set(),
    };
  }
}
