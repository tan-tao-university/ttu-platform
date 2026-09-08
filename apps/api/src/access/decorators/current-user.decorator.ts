import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AuthenticatedRequest, AuthenticatedUser } from '../access.types';

/** Usage: `@CurrentUser() user: AuthenticatedUser`. Only valid behind `JwtAuthGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    // JwtAuthGuard always populates request.user before a handler runs.
    return request.user!;
  },
);
