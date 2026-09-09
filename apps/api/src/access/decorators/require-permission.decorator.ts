import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION_KEY = 'requiredPermission';

/**
 * Usage: `@RequirePermission('page.publish')`. Read by `PermissionsGuard`, which 403s unless the
 * caller's effective permission set (loaded fresh from `ttu_main` on this request, never from the
 * token) contains this code. Must run after `JwtAuthGuard` — see `AccessModule` doc comment for why
 * route decorators, not `APP_GUARD`, apply both.
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
