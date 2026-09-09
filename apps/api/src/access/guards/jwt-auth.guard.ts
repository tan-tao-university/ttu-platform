import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { type JwtHeader, type SigningKeyCallback } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { keycloakAuth } from '../../config/auth';
import type { AuthenticatedRequest, KeycloakAccessTokenPayload } from '../access.types';
import { IdentityService } from '../services/identity.service';

/** Shared JWKS client with internal caching (10 min TTL) and rate limiting. */
const jwks = new JwksClient({
  jwksUri: keycloakAuth.jwksUri,
  cache: true,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
});

function resolveSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
  if (!header.kid) {
    callback(new Error('Token header is missing "kid"'));
    return;
  }
  jwks.getSigningKey(header.kid, (error, key) => {
    if (error || !key) {
      callback(error ?? new Error('Unable to resolve a signing key for this token'));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

/**
 * Verifies a Keycloak-issued access token against the realm's JWKS (signature, issuer, expiry, and
 * the client it was minted for), then resolves — JIT-provisioning if this is the caller's first
 * request — the local CMS identity and attaches it to `request.user`. `PermissionsGuard` reads
 * that; a route with no `@RequirePermission(...)` only needs this guard to know who the caller is
 * (doc 07 §6, §8).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly identityService: IdentityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }

    const payload = await this.verify(token);
    request.user = await this.identityService.resolveFromToken(payload);
    return true;
  }

  private verify(token: string): Promise<KeycloakAccessTokenPayload> {
    const { promise, resolve, reject } = Promise.withResolvers<KeycloakAccessTokenPayload>();

    jwt.verify(
      token,
      resolveSigningKey,
      { algorithms: ['RS256'], issuer: keycloakAuth.issuerUrl },
      (error, decoded) => {
        // Anything the jwt library throws (expired, malformed, bad signature, wrong
        // issuer) becomes one opaque message — the difference is not the caller's
        // business.
        if (error || !decoded || typeof decoded === 'string') {
          reject(new UnauthorizedException('Invalid or expired access token'));
          return;
        }

        const payload = decoded as KeycloakAccessTokenPayload;
        // `azp` names the client the token was issued for. Requiring it — rather than
        // only checking it when present — rejects a token that omits the claim instead
        // of silently trusting it, so a token minted for a different client in the same
        // realm can never be replayed against this API.
        if (payload.azp !== keycloakAuth.clientId) {
          reject(new UnauthorizedException('Token was not issued for this client'));
          return;
        }

        resolve(payload);
      },
    );

    return promise;
  }

  private extractBearerToken(value?: string): string | undefined {
    if (!value) return undefined;
    const [type, token] = value.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
