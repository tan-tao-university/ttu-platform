import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { type JwtHeader, type SigningKeyCallback } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { keycloakAuth } from '../../config/auth';
import type { KeycloakAccessTokenPayload } from '../access.types';

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
 * Signature/issuer/expiry/client verification for a Keycloak-issued access token, shared by every
 * guard that needs to know "is this a real ttu-identity token" — `JwtAuthGuard` (mandatory auth)
 * and `OptionalJwtAuthGuard` (auth only when a token is actually presented) differ solely in what
 * they do when no token is present at all, not in how a present token gets checked.
 */
@Injectable()
export class TokenVerificationService {
  verify(token: string): Promise<KeycloakAccessTokenPayload> {
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
}
