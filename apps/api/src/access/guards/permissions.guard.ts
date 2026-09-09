import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';
import type { AuthenticatedRequest } from '../access.types';

/**
 * Enforces `@RequirePermission(...)`: the caller must hold the named permission in the flattened
 * set `JwtAuthGuard` attached to `request.user` on this same request — never from the access token,
 * so a grant or revocation takes effect immediately (doc 07 §13). CMS roles are global, not scoped
 * per faculty/department (doc 07 §9), so unlike a multi-tenant RBAC guard this only ever checks set
 * membership.
 *
 * Must run after `JwtAuthGuard`.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Not marked @RequirePermission() — nothing to enforce.
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user?.permissions.has(requiredPermission)) {
      throw new ForbiddenException(`Missing permission "${requiredPermission}"`);
    }

    return true;
  }
}
