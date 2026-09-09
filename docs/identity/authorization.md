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

Permissions represent fine-grained capabilities (`apps/api/src/db/permissions.catalog.ts`, design doc 07 §11):

| Permission Code     | Category   | Description                                                   |
| :------------------ | :--------- | :------------------------------------------------------------ |
| `page.read`         | Pages      | View pages and their draft state                              |
| `page.create`       | Pages      | Create new pages                                              |
| `page.edit`         | Pages      | Edit page draft content and sections                          |
| `page.delete`       | Pages      | Soft-delete pages                                             |
| `page.publish`      | Pages      | Publish a page locale, creating an immutable revision         |
| `page.restore`      | Pages      | Restore a page locale to a prior published revision           |
| `content.read`      | Content    | View content items (news, announcements, events, ...)         |
| `content.create`    | Content    | Create new content items                                      |
| `content.edit`      | Content    | Edit content item draft translations                          |
| `content.delete`    | Content    | Soft-delete content items                                     |
| `content.publish`   | Content    | Publish a content item locale, creating an immutable revision |
| `content.restore`   | Content    | Restore a content item locale to a prior published revision   |
| `media.read`        | Media      | Browse and search the media library                           |
| `media.upload`      | Media      | Upload new media assets                                       |
| `media.update`      | Media      | Edit media metadata (alt text, caption)                       |
| `media.delete`      | Media      | Delete media assets                                           |
| `navigation.manage` | Navigation | Manage menus and menu items                                   |
| `redirect.manage`   | System     | Manage URL redirects                                          |
| `settings.manage`   | System     | Manage site settings                                          |
| `user.read`         | Access     | View CMS users and their role assignments                     |
| `user.manage`       | Access     | Manage CMS user mappings and role assignments                 |
| `role.manage`       | Access     | Manage roles and their permission grants                      |
| `audit.read`        | System     | View the audit log                                            |

## 3. Role → Permission Grant Matrix

Grants are seeded by `bun run --cwd apps/api db:seed` and re-synced on every run — `apps/api/src/db/role-permissions.catalog.ts` is the source of truth, each grant list justified against design doc 07 §10 (role responsibilities) and doc 01 §4 (user personas):

| Role | Grants |
| :-- | :-- |
| `super_admin` | Every permission in the catalog (doc 07 §10: "Quản trị toàn bộ TTU Platform"). |
| `cms_admin` | Full `page.*` and `content.*` lifecycle, full `media.*`, `navigation.manage`, `redirect.manage`, `settings.manage`. No `user.*`, `role.manage`, or `audit.read` — doc 07 §10 withholds "sensitive system administration" from this role. |
| `editor` | `page.read`/`create`/`edit`, `content.read`/`create`/`edit`, `media.read`/`upload`. No delete, publish, or restore — doc 01 §4.2: no default publish right. |
| `reviewer` | `page.read`, `content.read` only. Publishing stays with `publisher` per doc 07 §14's editor → reviewer → publisher separation. |
| `publisher` | `page.read`/`publish`/`restore`, `content.read`/`publish`/`restore`. Not a content author — no create/edit/delete grants (doc 01 §4.3). |

`role.manage` has no admin UI/API yet (blocked on the same wiring order as the CMS Page Builder — see `apps/api/IMPLEMENTATION_STATUS.md`), so these 5 roles remain platform-defined (`is_system = true`) and are only ever reassigned by editing the catalog and re-seeding.

## 4. Server-Side Guard Enforcement

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

## 5. Super Admin Bootstrap

Initial system bootstrap is performed through a secure CLI script, avoiding insecure default passwords:

```sh
bun run --cwd apps/api db:create-super-admin <keycloak-user-uuid> <user-email> "Admin Name"
```
