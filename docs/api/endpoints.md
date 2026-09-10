# API: Endpoints Catalog

Every route lives under `/api/v1/`. See `docs/api/conventions.md` §1 for the single-URL RBAC-branch convention that `Content` and `Navigation` use — it is not repeated per-row here beyond the "Auth" column.

## 1. Identity & Administration (`apps/api/src/access`)

| Method | Path | Auth | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/me` | Required | Returns current user's local database ID, identity subject, active flag, and permission list. No permission of its own — any authenticated CMS identity can see its own profile. |

## 2. Content Domain (`apps/api/src/content`)

One resource, one URL. `content.read` decides depth: a caller with it gets the full editorial item (all locale translations, event data, current draft state); anyone else gets only the currently published-and-active view for the locale requested.

| Method | Path | Auth | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/content` | Optional (`content.read` branches) | Paginated list. Privileged: filterable by `type`/`status`/`categoryId`, admin shape. Unprivileged: published-only feed for `?locale=` (default `vi`), delivery shape. |
| `POST` | `/api/v1/content` | `content.create` | Create a new content root item (e.g. `NEWS`, `EVENT`). |
| `GET` | `/api/v1/content/:id` | Optional (`content.read` branches) | Privileged: full item + all translations + event + categories/tags. Unprivileged: requires `?locale=`; returns the published snapshot for that locale, `404` if none, enriched with resolved categories/tags/event. |
| `GET` | `/api/v1/content/by-slug/:locale/:slug` | None | Always resolves the currently published item for `:locale` matching `:slug` — draft slugs are not unique, so there is no privileged variant of this lookup. |
| `PATCH` | `/api/v1/content/:id` | `content.edit` | Update root item fields (`type`, `featuredMediaId`). |
| `DELETE` | `/api/v1/content/:id` | `content.delete` | Soft-delete a content item. |
| `POST` | `/api/v1/content/:id/translations/:locale` | `content.edit` | Upsert translation draft (title, slug, path, body, SEO fields). |
| `POST` | `/api/v1/content/:id/event` | `content.edit` | Upsert event sub-resource data (dates, venue, registration) — `EVENT` type only. |
| `POST` | `/api/v1/content/:id/locales/:locale/publish` | `content.publish` | Execute the atomic publication transaction for a locale. |
| `GET` | `/api/v1/content/:id/locales/:locale/revisions` | `content.read` | List historical revisions for a locale. |
| `POST` | `/api/v1/content/:id/locales/:locale/restore/:revisionId` | `content.restore` | Restore draft state from a historical revision. |
| `POST` | `/api/v1/content/:id/categories` | `content.edit` | Assign a category to a content item. |
| `DELETE` | `/api/v1/content/:id/categories/:categoryId` | `content.edit` | Remove a category assignment. |
| `POST` | `/api/v1/content/:id/tags` | `content.edit` | Assign a tag to a content item. |
| `DELETE` | `/api/v1/content/:id/tags/:tagId` | `content.edit` | Remove a tag assignment. |

## 3. Taxonomy Domain (`apps/api/src/taxonomy`)

Admin-only — reuses `content.read`/`content.edit` (doc 07 §11). Public pages consume categories/tags already embedded in the Content Domain's public responses, not through a dedicated taxonomy route.

| Method | Path | Required Permission | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/categories` | `content.read` | List category hierarchy, flat with `parentId`. |
| `GET` | `/api/v1/categories/:id` | `content.read` | Single category with translations. |
| `POST` | `/api/v1/categories` | `content.edit` | Create category with parent reference. |
| `PATCH` | `/api/v1/categories/:id` | `content.edit` | Update `parentId`/`sortOrder`. |
| `DELETE` | `/api/v1/categories/:id` | `content.edit` | Delete a category. |
| `PUT` | `/api/v1/categories/:id/translations/:locale` | `content.edit` | Upsert category translation name and slug. |
| `GET` | `/api/v1/tags` | `content.read` | List tags with pagination. |
| `GET` | `/api/v1/tags/:id` | `content.read` | Single tag with translations. |
| `POST` | `/api/v1/tags` | `content.edit` | Create tag. |
| `PATCH` | `/api/v1/tags/:id` | `content.edit` | Update tag fields. |
| `DELETE` | `/api/v1/tags/:id` | `content.edit` | Delete a tag. |
| `PUT` | `/api/v1/tags/:id/translations/:locale` | `content.edit` | Upsert tag translation name and slug. |

## 4. Media Domain (`apps/api/src/media`)

Admin-only — no public read endpoint; delivery URLs for published content are resolved server-side and embedded in Content Domain responses.

| Method | Path | Required Permission | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/media` | `media.read` | Paginated list, optional `mimeType`/`search` filters. |
| `GET` | `/api/v1/media/:id` | `media.read` | Asset metadata, resolved delivery URL, and translations. |
| `POST` | `/api/v1/media` | `media.upload` | Multipart file upload — validates, stores in MinIO, persists metadata. |
| `PUT` | `/api/v1/media/:id/translations/:locale` | `media.update` | Upsert alt text / caption for a locale. |
| `DELETE` | `/api/v1/media/:id` | `media.delete` | Soft-delete; `409` if still referenced by published content or an active person/partner profile. |
| `POST` | `/api/v1/media/:id/restore` | `media.delete` | Undo a soft-delete. |

## 5. Navigation Domain (`apps/api/src/navigation`)

One resource, one URL, addressed by the immutable `key` (never `id` — the same identifier the old public-only route used, now shared by both views). `navigation.manage` decides depth on the single read-by-key route; every other route always requires it.

| Method | Path | Auth | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/menus` | `navigation.manage` | Paginated list of all menus, optional `isActive` filter. No public equivalent — there is no "list every menu" delivery use case. |
| `POST` | `/api/v1/menus` | `navigation.manage` | Create a menu (`key`, `isActive`). |
| `GET` | `/api/v1/menus/:key` | Optional (`navigation.manage` branches) | Privileged: menu + every item, flat with `parentId` (client builds the tree). Unprivileged: `?locale=` (default `vi`) resolved, nested, visible-items-only delivery tree with each item's `href` pre-resolved. `404` if the menu doesn't exist or (unprivileged) isn't active. |
| `PATCH` | `/api/v1/menus/:key` | `navigation.manage` | Update `isActive`. |
| `DELETE` | `/api/v1/menus/:key` | `navigation.manage` | Delete a menu — cascades to its items and translations. |
| `POST` | `/api/v1/menus/:key/items` | `navigation.manage` | Create a menu item (`linkType` + matching target field). |
| `PATCH` | `/api/v1/menus/:key/items/:itemId` | `navigation.manage` | Reparent, reorder, or hide/show — `linkType`/target are immutable. |
| `DELETE` | `/api/v1/menus/:key/items/:itemId` | `navigation.manage` | Delete an item — `409` if it still has children. |
| `PUT` | `/api/v1/menus/:key/items/:itemId/translations/:locale` | `navigation.manage` | Upsert `label`/`customPath` for a locale. |

## 6. Audit Domain (`apps/api/src/audit`)

Read-only, admin-only — `audit.read` is withheld from every seeded role but `super_admin` (`role-permissions.catalog.ts`), so there is no unprivileged or partial view.

| Method | Path | Required Permission | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/audit-logs` | `audit.read` | Paginated, newest-first audit trail. Optional filters: `actorUserId`, `action`, `entityType`, `entityId`, `occurredFrom`/`occurredTo` (ISO 8601, inclusive). Rows are written by other domains' sensitive operations (`content.publish`/`content.restore` today). |
