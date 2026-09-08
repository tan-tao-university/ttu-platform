import { Injectable } from '@nestjs/common';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import { db } from '../../db';
import {
  type NewUser,
  type User,
  permissions,
  rolePermissions,
  userRoleAssignments,
  users,
} from '../../db/schema';

export interface IdentityProfile {
  email?: string;
  displayName?: string;
}

/** `users` row plus the flattened, still-active permission codes granted through every
 *  non-expired role assignment (design doc 07 §7, §9, §12). */
export type UserWithPermissions = User & { permissions: string[] };

/**
 * Every query behind authentication: the local identity mapping and its RBAC role grants.
 * Keycloak owns credentials and sessions — this repository never touches either, and the
 * access token itself never carries permissions. `JwtAuthGuard` calls back here on every
 * request, so a role grant or revocation takes effect on the very next request instead of
 * waiting for the token to expire.
 */
@Injectable()
export class UsersRepository {
  /**
   * JIT-provisions the local mapping on first sign-in (doc 07 §8): creates the row with no
   * role assignments if `identitySubject` is unseen, otherwise refreshes the cached profile
   * fields and `lastSeenAt`. Never grants a role — that is a separate, explicit admin
   * action, so a brand-new mapping always comes back with an empty permission set.
   */
  async findOrCreateByIdentitySubject(
    identitySubject: string,
    profile: IdentityProfile,
  ): Promise<UserWithPermissions> {
    const existing = await this.findByIdentitySubject(identitySubject);
    const now = new Date();

    if (existing) {
      const [row] = await db
        .update(users)
        .set({
          email: profile.email ?? existing.email,
          displayName: profile.displayName ?? existing.displayName,
          lastSeenAt: now,
          updatedAt: now,
        })
        .where(eq(users.id, existing.id))
        .returning();
      return { ...row, permissions: existing.permissions };
    }

    const values: NewUser = {
      identitySubject,
      email: profile.email,
      displayName: profile.displayName,
      lastSeenAt: now,
    };
    const [row] = await db.insert(users).values(values).returning();
    return { ...row, permissions: [] };
  }

  private async findByIdentitySubject(
    identitySubject: string,
  ): Promise<UserWithPermissions | undefined> {
    const [row] = await db.select().from(users).where(eq(users.identitySubject, identitySubject));
    if (!row) return undefined;

    return { ...row, permissions: await this.loadPermissionCodes(row.id) };
  }

  private async loadPermissionCodes(userId: string): Promise<string[]> {
    const now = new Date();
    const rows = await db
      .selectDistinct({ code: permissions.code })
      .from(userRoleAssignments)
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoleAssignments.roleId))
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(
        and(
          eq(userRoleAssignments.userId, userId),
          eq(permissions.isActive, true),
          or(isNull(userRoleAssignments.expiresAt), gt(userRoleAssignments.expiresAt, now)),
        ),
      );
    return rows.map((r) => r.code);
  }
}
