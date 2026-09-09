# Frontend: Admin Dashboard (`@ttu/admin`)

## 1. Application Architecture

The Content Admin Dashboard is an editorial web application located in `apps/admin`:

- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **Port**: `3011` (local development), mapped to `admin.ttu.edu.vn` in production.
- **Target Audience**: University editorial staff, communications officers, faculty contributors, and system administrators.

## 2. Authentication & Session Flow

The dashboard interfaces with **TTU Identity (Keycloak 26)** using client `ttu-web`:

1. Unauthenticated users are redirected to `https://auth.ttu.edu.vn/realms/ttu/protocol/openid-connect/auth` with PKCE challenge parameters.
2. Upon callback, the application exchanges the authorization code for an ID token and access token.
3. On application boot, the dashboard fetches `GET /api/v1/admin/me` to hydrate local user details, role assignments, and permission catalog (`permissions[]`).
4. Protected routes and sidebar items are conditionally rendered based on granted permissions (e.g. `content.read`, `media.upload`).

## 3. Editorial Views & Page Inspector

- **Content Management**: Lists articles and events with status badges (`DRAFT`, `PUBLISHED`, `ARCHIVED`), locale tabs (`vi`/`en`), and one-click action modals for publishing, scheduling, and revision rollback.
- **Taxonomy Manager**: Hierarchical category tree view and tag management interface.
- **Page Builder (Future)**: Controlled component palette, drag-and-drop section ordering, and Inspector tab controls (Content, Data/Config, Safe Styles) powered by `@ttu/cms-registry`.
