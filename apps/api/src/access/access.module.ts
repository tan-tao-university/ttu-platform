import { Global, Module } from '@nestjs/common';
import { MeController } from './controllers/me.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { UsersRepository } from './repositories/users.repository';
import { IdentityService } from './services/identity.service';
import { TokenVerificationService } from './services/token-verification.service';

/**
 * CMS authentication (Keycloak token verification) and authorization (`ttu_main` roles and
 * permissions) — design doc 07. Global so every domain module can `@UseGuards(...)` without
 * importing this module itself.
 *
 * Guards are applied per-controller/route, not registered as `APP_GUARD`: a resource endpoint one
 * URL serves to both anonymous and authenticated callers (doc 06 §5 — RBAC on a single endpoint,
 * not a separate `/admin`/`/public` namespace) needs `OptionalJwtAuthGuard` instead of the
 * mandatory `JwtAuthGuard`, so authentication has to stay a per-route choice rather than a global
 * default every route has to opt back out of.
 */
@Global()
@Module({
  controllers: [MeController],
  providers: [
    UsersRepository,
    IdentityService,
    TokenVerificationService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PermissionsGuard,
  ],
  // `@UseGuards(JwtAuthGuard)` constructs the guard using the *consuming* module's DI
  // subtree, not AccessModule's — so every one of these guards' own constructor
  // dependencies must be exported too, or resolution fails in every module that isn't
  // AccessModule itself.
  exports: [
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PermissionsGuard,
    TokenVerificationService,
    IdentityService,
    UsersRepository,
  ],
})
export class AccessModule {}
