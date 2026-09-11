# TTU Platform — Admin Dashboard Implementation Status

> Living implementation tracker for the `@ttu/admin` application (`apps/admin`).

Read this file before modifying `apps/admin` to understand implemented surfaces, current priorities, and dependencies on `apps/api` endpoints and shared packages.

- [**Root Monorepo Status**](../../IMPLEMENTATION_STATUS.md)
- [**Backend API Status**](../api/IMPLEMENTATION_STATUS.md)
- [**Public Website Status**](../web/IMPLEMENTATION_STATUS.md)

---

## 1. Current Status

| # | Feature Domain | Status | API Dependency | Notes |
| --: | :-- | :-- | :-- | :-- |
| 1 | **Application Scaffold** | ✅ Complete | None | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| 2 | **Authentication & Session** | ✅ Complete | Keycloak (`ttu-web`), `GET /api/v1/me` | Browser-side OIDC Authorization Code + PKCE, encrypted `HttpOnly` session cookie, automatic refresh |
| 3 | **Admin Shell & Navigation** | 🟡 Next | `GET /api/v1/me` (permissions) | Responsive sidebar, header, breadcrumbs, permission-gated nav links |
| 4 | **Content Management UI** | ⚪ Not started | `/api/v1/content/*` | Editorial list, draft editor, multi-locale translation tabs, publish/rollback modals |
| 5 | **Taxonomy Management UI** | ⚪ Not started | `/api/v1/categories`, `/api/v1/tags` | Category hierarchy tree editor, tag management table |
| 6 | **Media Asset Library** | ⚪ Not started | `/api/v1/media/*` | Media browser, drag-and-drop upload modal — backend MinIO wiring now available (PR #16) |
| 7 | **CMS Page Builder UI** | ⚪ Not started | `/api/v1/pages/*` | Visual page sections, component palette; API is ready (`apps/api/src/cms/`), but `@ttu/cms-registry` only has `hero` registered |
| 8 | **User & Role Administration** | ⚪ Backlog | `/api/v1/users`, `/api/v1/roles` | User listing, role assignment dialog, permission matrix inspector |
| 9 | **Navigation / Menu Editor** | ⚪ Backlog | `/api/v1/menus/*` | Hierarchical menu builder with link picker |
| 10 | **Redirects Management** | ⚪ Backlog | `/api/v1/redirects/*` | URL redirect table with status toggling and collision checking |
| 11 | **Site Settings UI** | ⚪ Backlog | `/api/v1/settings/*` | University contact info, social links, tracking scripts |
| 12 | **Audit Log Viewer** | ⚪ Backlog | `/api/v1/audit-logs` | Filterable operational audit trail with JSON metadata inspection |

### Status legend

| Status         | Meaning                                       |
| :------------- | :-------------------------------------------- |
| ✅ Complete    | Implemented and verified in `main`            |
| 🟡 Next        | Immediate implementation priority             |
| ⚪ Not started | Planned feature; prerequisites exist          |
| 🔴 Blocked     | Blocked on backend endpoint or shared package |

---

## 2. Immediate Priorities

The current frontend implementation sequence for `apps/admin` is:

```text
1. ~~OIDC Authentication Flow (Keycloak redirect via ttu-web client)~~ — done
   ↓
2. ~~Session Management & User Profile Hydration (GET /api/v1/me)~~ — done
   ↓
3. Application Shell (Sidebar, Header, Permission-gated routes)
   ↓
4. Content & Taxonomy Management Views (Connecting to existing API domain)
```

---

## 3. Detailed Domain Specifications

### 3.1 Authentication & Session Management (Priority 1) — ✅ Complete

`apps/admin/src/lib/auth/`, `apps/admin/src/app/api/auth/`, `apps/admin/src/proxy.ts` implement a server-side (BFF) Authorization Code + PKCE flow against Keycloak realm `ttu`, client `ttu-web` — design doc 07 §4-6.

- **`GET /api/auth/login`**: generates `state`/`nonce`/PKCE `code_verifier`, stashes them in a short-lived encrypted transaction cookie, redirects to Keycloak's `/protocol/openid-connect/auth`.
- **`GET /api/auth/callback`**: validates `state`, exchanges the code (with `code_verifier`) at the token endpoint, verifies the ID token's signature/issuer/`azp`/`nonce` via `jose`, then sets the session — an AES-256-GCM-encrypted (`jose` `EncryptJWT`), `HttpOnly`, `SameSite=Lax` cookie. The browser never receives the access/refresh token in any form JS can read (doc 07 §5).
- **`proxy.ts`** (Next.js 16's `middleware.ts` successor): gates every page except `/api/auth/*`. No session → redirect to login with `returnTo`. Access token expiring within 30s → transparently refreshes via the token endpoint and rewrites the cookie (the only place in the request lifecycle that can — Server Components can read `cookies()` but never set one). Refresh token also expired → redirect to login.
- **`POST /api/auth/logout`**: clears the local session cookie only — doc 07 §5 explicitly scopes Admin logout to ending "TTU Platform's session"; SSO-wide logout is TTU Identity's own policy, not this app's to enforce. `POST`-only so a prefetched/embedded link can never trigger it.
- **`GET /api/v1/me`** is called server-side (`lib/api/me.ts`) with the session's access token on every page load; the home page renders identity, active status, and the full permission list.

**Verified against real infra**: a live browser drove the entire flow through the actual `ttu-identity` Keycloak dev instance (`admin.test` user) and the actual `apps/api` dev server — login redirect, form submission, callback, session cookie confirmed `HttpOnly` (`document.cookie` returns empty), `/me` permission list rendered, logout confirmed to clear the local cookie (a fresh SSO-silent re-auth cycle only happens because the old cookie was actually gone).

### 3.2 Content Management UI (Priority 2)

- **List View**: Paginated table consuming `GET /api/v1/content`, filtering by `type` (NEWS, EVENT, etc.), `status` (DRAFT, PUBLISHED, ARCHIVED), and `locale`.
- **Editor**:
  - General metadata tab: title, slug, draft path, author, featured media, category & tag picker.
  - Translation tabs: parallel localized editing (`vi`/`en`).
  - Rich text body editor with structured JSON format.
  - Event sub-resource editor when `type == 'EVENT'` (start/end time, venue, registration).
- **Workflow Actions**: Publish dialog (with scheduled publishing option), Archive dialog, and Revision History with one-click Rollback transaction.

### 3.3 Blocked Domains

- **CMS Page Builder UI**: Intentionally blocked. Do not fabricate page builder components or section editors until `packages/cms-registry` defines the official component catalog and validation schemas.
