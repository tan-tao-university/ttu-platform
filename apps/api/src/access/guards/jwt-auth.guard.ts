import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../access.types';
import { IdentityService } from '../services/identity.service';
import { TokenVerificationService } from '../services/token-verification.service';
import { extractBearerToken } from './bearer-token.util';

/**
 * Verifies a Keycloak-issued access token is present and valid, then resolves — JIT-provisioning if
 * this is the caller's first request — the local CMS identity and attaches it to `request.user`.
 * `PermissionsGuard` reads that. For a route only ever reachable by an authenticated caller (doc 07
 * §6, §8); a route a single resource endpoint serves to both anonymous and authenticated callers
 * uses `OptionalJwtAuthGuard` instead.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenVerification: TokenVerificationService,
    private readonly identityService: IdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }

    const payload = await this.tokenVerification.verify(token);
    request.user = await this.identityService.resolveFromToken(payload);
    return true;
  }
}
