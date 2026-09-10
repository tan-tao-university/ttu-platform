import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AuthenticatedRequest, AuthenticatedUser } from '../access.types';

/**
 * Usage: `@OptionalCurrentUser() user: AuthenticatedUser | undefined`. For a route behind
 * `OptionalJwtAuthGuard`, where an anonymous caller is a legitimate, expected case — unlike
 * `@CurrentUser()`, this never asserts a value is present.
 */
export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
