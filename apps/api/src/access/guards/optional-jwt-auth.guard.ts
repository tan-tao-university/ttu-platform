import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from '../access.types';
import { IdentityService } from '../services/identity.service';
import { TokenVerificationService } from '../services/token-verification.service';
import { extractBearerToken } from './bearer-token.util';

/**
 * For a resource one URL serves to both anonymous and authenticated callers, RBAC deciding depth of
 * access rather than a separate namespace (design doc 06 §5 — a single `content`/`menus` endpoint,
 * not `/admin/content` + `/public/content`). No token → proceeds with `request.user` left
 * `undefined`, exactly like a never-authenticated request; `PermissionsGuard` and the controller
 * itself treat that as "anonymous". A token that _is_ present must still be genuinely valid —
 * silently downgrading a bad or expired token to "anonymous" would mask real auth bugs instead of
 * surfacing them as 401.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenVerification: TokenVerificationService,
    private readonly identityService: IdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);
    if (!token) return true;

    const payload = await this.tokenVerification.verify(token);
    request.user = await this.identityService.resolveFromToken(payload);
    return true;
  }
}
