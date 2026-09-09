# Identity: Authentication & SSO

## 1. Authentication vs Authorization

TTU Platform strictly separates **identity authentication** from **application authorization**:

- **Authentication ("Who are you?")**: Managed centrally by **TTU Identity** (Keycloak 26). TTU Platform never stores passwords, hashes, or credentials.
- **Authorization ("What are you allowed to do?")**: Managed locally by **TTU Platform** (`ttu_main.roles` and `ttu_main.permissions`).

A user who successfully logs into Keycloak is not automatically granted CMS editing or publishing permissions.

## 2. OIDC Login Flow (PKCE)

The admin frontend authenticates against Keycloak using OpenID Connect (OIDC) **Authorization Code Flow with PKCE**:

![Identity Auth Flow](../assets/identity-auth-flow.png)

## 3. JWT Verification at the API

The NestJS API guard (`JwtAuthGuard`) verifies incoming Bearer tokens using `jwks-rsa`:

- **JWKS Endpoint**: Derived dynamically from `KEYCLOAK_ISSUER_URL` (`/protocol/openid-connect/certs`).
- **In-Memory Key Caching**: Caches public signing keys for 10 minutes with rate limiting, eliminating per-request HTTP round-trips to Keycloak.
- **Claims Verified**: Validates `iss` (issuer), `azp` (client ID `ttu-web`), and `exp` (token expiration).

## 4. Just-In-Time (JIT) Provisioning

When a valid Keycloak user authenticates for the first time:

1. The API extracts the `sub` claim and queries `users.identity_subject`.
2. If absent, a new `users` record is provisioned with `displayName` and `email` cached from token claims.
3. **Security Rule**: The newly provisioned user receives **zero default roles or permissions**. CMS access must be explicitly granted by a Super Administrator.
