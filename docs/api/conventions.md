# API: Conventions & Standards

## 1. URL Namespaces & Versioning

All API routes are served under the `/api/v1/` prefix. There is **no** `/admin/*` vs `/public/*` split: each resource has exactly one URL, and RBAC — not the path — decides how much of it a caller sees (design doc 06 §5).

- `GET /api/v1/content`, `GET /api/v1/content/:id`, `GET /api/v1/content/by-slug/:locale/:slug`, and `GET /api/v1/menus/:key` accept both anonymous and authenticated requests. The handler checks the caller's permission set (`content.read` / `navigation.manage`) and returns either the full editorial resource or the published-only, delivery-shaped view of the exact same entity at the exact same URL. An authenticated caller who lacks the permission is treated as anonymous for these routes — they are not rejected.
- Every other route (create/update/delete, categories, tags, media, revisions, publish/restore) requires a specific permission via `@RequirePermission(...)` and always returns the full editorial resource; there is no public equivalent.
- `GET /api/v1/me` always requires a valid Keycloak JWT (see `docs/identity/authentication.md`).
- No `/api/v1/integrations/*` namespace exists yet; sibling-platform integrations are unscoped until a real consumer requires one.

### 1.1 Guards: `OptionalJwtAuthGuard` vs `JwtAuthGuard`

Two authentication guards exist, and the controller's routing style picks which one applies:

- `JwtAuthGuard` (mandatory): rejects with `401` before the handler runs if no valid Bearer token is present. Used by `MeController`, `MediaController`, `CategoriesController`, `TagsController` — domains with no public read view.
- `OptionalJwtAuthGuard`: verifies a Bearer token if one is present and attaches `request.user`, but never rejects a request for lacking one. Used by `ContentController` and `NavigationController`, whose read routes serve both audiences. Combined with `PermissionsGuard` and `@RequirePermission(...)` on the write routes of the same controller, so mutation routes on these controllers still 401/403 exactly like a mandatory-guard controller would.

`PermissionsGuard` distinguishes the two failure modes precisely: `401` when `request.user` is absent (never authenticated), `403` when a user is authenticated but missing the specific permission code the route requires.

## 2. Standardized Error Response Envelope

All error responses implement an RFC 7807 (ProblemDetails)-inspired envelope via `AllExceptionsFilter` and `ApiError` (`apps/api/src/common/http/api-error.ts`):

```json
{
  "type": "validation_error",
  "title": "Dữ liệu không hợp lệ",
  "status": 422,
  "detail": "Request failed validation",
  "instance": "/api/v1/content",
  "requestId": "a1872416-4a2f-4124-8168-b460b7ea5fa6",
  "errors": [
    {
      "field": "locale",
      "code": "isLength",
      "message": "locale must be longer than or equal to 2 characters"
    }
  ]
}
```

`type` is a stable machine-readable slug (`unauthorized`, `forbidden`, `not_found`, `conflict`, `validation_error`, ...); `title` is the Vietnamese-first, user-facing summary; `detail` is the English, developer-facing specifics; `errors` is present only for field-level validation failures.

## 3. HTTP Status Codes

| Code | Meaning | Typical Usage |
| :-: | :-- | :-- |
| `200` | OK | Successful fetch, update, or action |
| `201` | Created | Successful entity creation |
| `204` | No Content | Successful delete or void action |
| `400` | Bad Request | Malformed payload or unparseable query parameters |
| `401` | Unauthorized | No Keycloak JWT Bearer token present at all (`request.user` unset) |
| `403` | Forbidden | Authenticated user's token verified, but their permission set (from `ttu_main`, not Keycloak roles) lacks the required code |
| `404` | Not Found | Requested entity or route does not exist, or (for `content`/`menus` read routes) exists but is not published/active for an unprivileged caller |
| `409` | Conflict | Duplicate unique key, active slug collision, or concurrency conflict |
| `422` | Unprocessable Entity | DTO field validation failure or business invariant violation |
| `500` | Internal Server Error | Unexpected server failure; sensitive stack traces are suppressed |

## 4. Pagination & Filtering Standards

All list endpoints support standard pagination queries (`page`, `pageSize`) returning metadata:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 125,
  "totalPages": 7
}
```
