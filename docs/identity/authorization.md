# Identity: Authorization & RBAC

## 1. Role-Based Access Control (RBAC) Model

CMS authorization is enforced entirely within `apps/api` using permissions resolved from `ttu_main`:

```plain text
User
 └── user_role_assignments
       └── Role (e.g. editor, publisher, super_admin)
             └── role_permissions
                   └── Permission (e.g. content.edit, content.publish)
```

## 2. Granular Permissions Catalog

Permissions represent fine-grained capabilities:

| Permission Code     | Category   | Description                                       |
| :------------------ | :--------- | :------------------------------------------------ |
| `page.read`         | Pages      | View draft pages and revision history             |
| `page.edit`         | Pages      | Create and update page drafts, sections, styles   |
| `page.publish`      | Pages      | Publish and schedule page revisions               |
| `page.delete`       | Pages      | Soft-delete pages                                 |
| `content.read`      | Content    | View editorial articles, drafts, and categories   |
| `content.edit`      | Content    | Create and update news, announcements, and events |
| `content.publish`   | Content    | Publish editorial content and manage revisions    |
| `content.delete`    | Content    | Soft-delete editorial content                     |
| `media.read`        | Media      | Browse media library assets                       |
| `media.upload`      | Media      | Upload images and documents to MinIO              |
| `media.delete`      | Media      | Delete media assets                               |
| `navigation.manage` | Navigation | Edit menu trees and link items                    |
| `redirect.manage`   | System     | Create and modify 301/302 URL redirects           |
| `user.manage`       | Access     | Assign roles and manage user access               |
| `role.manage`       | Access     | Manage role permission assignments                |
| `audit.read`        | System     | Inspect administrative audit logs                 |

## 3. Server-Side Guard Enforcement

Authorization is enforced server-side using `@RequirePermission(...)` and `PermissionsGuard`:

```ts
@Controller('admin/content')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminContentController {
  @Post(':id/publish')
  @RequirePermission('content.publish')
  async publish(@Param('id') id: string) { ... }
}
```

UI button hiding is strictly an ergonomic convenience; the backend API rejects unauthorized operations with `403 Forbidden`.

## 4. Super Admin Bootstrap

Initial system bootstrap is performed through a secure CLI script, avoiding insecure default passwords:

```sh
bun run --cwd apps/api db:create-super-admin <keycloak-user-uuid> <user-email> "Admin Name"
```
