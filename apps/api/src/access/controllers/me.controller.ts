import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../access.types';

/**
 * `GET /api/v1/admin/me` — every other Admin API route needs to know "who is this and what can they
 * do", so this is the first Admin route and the one every future controller's
 * `@RequirePermission(...)` decisions can be checked against by hand. No permission of its own: any
 * authenticated CMS identity — even one with an empty permission set from JIT provisioning and no
 * role yet — can see its own profile.
 */
@Controller('admin/me')
@UseGuards(JwtAuthGuard)
export class MeController {
  @Get()
  me(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.id,
      identitySubject: user.identitySubject,
      isActive: user.isActive,
      permissions: [...user.permissions].sort(),
    };
  }
}
