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
| 2 | **Authentication & Session** | 🟡 Next | Keycloak (`ttu-web`), `GET /api/v1/admin/me` | Browser-side OIDC login redirect, token storage, user profile hydration |
| 3 | **Admin Shell & Navigation** | 🟡 Next | `GET /api/v1/admin/me` (permissions) | Responsive sidebar, header, breadcrumbs, permission-gated nav links |
| 4 | **Content Management UI** | ⚪ Not started | `/api/v1/admin/content/*` | Editorial list, draft editor, multi-locale translation tabs, publish/rollback modals |
| 5 | **Taxonomy Management UI** | ⚪ Not started | `/api/v1/admin/categories`, `/api/v1/admin/tags` | Category hierarchy tree editor, tag management table |
| 6 | **Media Asset Library** | ⚪ Not started | `/api/v1/admin/media/*` | Media browser, drag-and-drop upload modal; blocked on backend MinIO wiring |
| 7 | **CMS Page Builder UI** | 🔴 Blocked | `/api/v1/admin/pages/*` | Visual page sections, component palette; blocked on `@ttu/cms-registry` |
| 8 | **User & Role Administration** | ⚪ Backlog | `/api/v1/admin/users`, `/api/v1/admin/roles` | User listing, role assignment dialog, permission matrix inspector |
| 9 | **Navigation / Menu Editor** | ⚪ Backlog | `/api/v1/admin/menus/*` | Hierarchical menu builder with link picker |
| 10 | **Redirects Management** | ⚪ Backlog | `/api/v1/admin/redirects/*` | URL redirect table with status toggling and collision checking |
| 11 | **Site Settings UI** | ⚪ Backlog | `/api/v1/admin/settings/*` | University contact info, social links, tracking scripts |
| 12 | **Audit Log Viewer** | ⚪ Backlog | `/api/v1/admin/audit-logs` | Filterable operational audit trail with JSON metadata inspection |

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
1. OIDC Authentication Flow (Keycloak redirect via ttu-web client)
   ↓
2. Session Management & User Profile Hydration (GET /api/v1/admin/me)
   ↓
3. Application Shell (Sidebar, Header, Permission-gated routes)
   ↓
4. Content & Taxonomy Management Views (Connecting to existing API domain)
```

---

## 3. Detailed Domain Specifications

### 3.1 Authentication & Session Management (Priority 1)

- **Identity Provider**: Keycloak realm `ttu`, client `ttu-web`.
- **Flow**: Authorization Code Flow with PKCE in the browser.
- **Session State**: Store access token / refresh token securely; intercept API calls to append `Authorization: Bearer <token>`.
- **Profile & Authorization**: Call `GET /api/v1/admin/me` on application boot to retrieve local database identity, assigned roles, and permission list (`permissions[]`).
- **Route Guarding**: Restrict access to admin routes if the user lacks the required permission (e.g. `content.read` for `/content`, `role.manage` for `/roles`).

### 3.2 Content Management UI (Priority 2)

- **List View**: Paginated table consuming `GET /api/v1/admin/content`, filtering by `type` (NEWS, EVENT, etc.), `status` (DRAFT, PUBLISHED, ARCHIVED), and `locale`.
- **Editor**:
  - General metadata tab: title, slug, draft path, author, featured media, category & tag picker.
  - Translation tabs: parallel localized editing (`vi`/`en`).
  - Rich text body editor with structured JSON format.
  - Event sub-resource editor when `type == 'EVENT'` (start/end time, venue, registration).
- **Workflow Actions**: Publish dialog (with scheduled publishing option), Archive dialog, and Revision History with one-click Rollback transaction.

### 3.3 Blocked Domains

- **CMS Page Builder UI**: Intentionally blocked. Do not fabricate page builder components or section editors until `packages/cms-registry` defines the official component catalog and validation schemas.
- **Media Asset Library**: Blocked until `apps/api` wires MinIO object storage and exposes multipart upload endpoints (design doc 08).
