import { Global, Module } from '@nestjs/common';
import { MeController } from './controllers/me.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { UsersRepository } from './repositories/users.repository';
import { IdentityService } from './services/identity.service';

/**
 * CMS authentication (Keycloak token verification) and authorization (`ttu_main` roles and
 * permissions) — design doc 07. Global so every content module added in later phases can
 * `@UseGuards(JwtAuthGuard, PermissionsGuard)` without importing this module itself.
 *
 * Guards are applied per-controller/route, not registered as `APP_GUARD`: the API also serves the
 * unauthenticated Public API namespace (doc 06 §5.1), so authentication must stay opt-in rather
 * than a default every public route has to explicitly turn back off.
 */
@Global()
@Module({
  controllers: [MeController],
  providers: [UsersRepository, IdentityService, JwtAuthGuard, PermissionsGuard],
  // `@UseGuards(JwtAuthGuard)` constructs the guard using the *consuming* module's DI
  // subtree, not AccessModule's — so `JwtAuthGuard`'s own constructor dependency
  // (`IdentityService`, which in turn needs `UsersRepository`) must be exported too, or
  // resolution fails in every module that isn't AccessModule itself.
  exports: [JwtAuthGuard, PermissionsGuard, IdentityService, UsersRepository],
})
export class AccessModule {}
