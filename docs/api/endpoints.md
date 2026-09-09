# API: Endpoints Catalog

## 1. Identity & Administration

| Method | Path | Required Permission | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/admin/me` | Authenticated | Returns current user profile, local database ID, assigned roles, and permission list. |

## 2. Content Domain (`apps/api/src/content`)

### 2.1 Admin Content API

| Method | Path | Required Permission | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/admin/content` | `content.read` | Paginated editorial items filtered by type, status, and locale. |
| `POST` | `/api/v1/admin/content` | `content.edit` | Create a new content root item (e.g. `NEWS`, `EVENT`). |
| `GET` | `/api/v1/admin/content/:id` | `content.read` | Retrieve content item with current draft translations. |
| `PUT` | `/api/v1/admin/content/:id/translations/:locale` | `content.edit` | Upsert translation draft (title, slug, path, body). |
| `PUT` | `/api/v1/admin/content/:id/event` | `content.edit` | Upsert event sub-resource data (dates, venue, registration). |
| `POST` | `/api/v1/admin/content/:id/categories` | `content.edit` | Assign category to content item. |
| `DELETE` | `/api/v1/admin/content/:id/categories/:categoryId` | `content.edit` | Remove category assignment. |
| `POST` | `/api/v1/admin/content/:id/tags` | `content.edit` | Assign tag to content item. |
| `DELETE` | `/api/v1/admin/content/:id/tags/:tagId` | `content.edit` | Remove tag assignment. |
| `POST` | `/api/v1/admin/content/:id/publish` | `content.publish` | Execute atomic publication transaction for a locale. |
| `POST` | `/api/v1/admin/content/:id/restore` | `content.publish` | Restore draft state from historical revision. |

### 2.2 Public Content API

| Method | Path | Auth | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/public/content` | None | Paginated public feed reading published revision snapshots. |
| `GET` | `/api/v1/public/content/:slug` | None | Single article by slug resolving published snapshot. |

## 3. Taxonomy Domain (`apps/api/src/taxonomy`)

### 3.1 Admin Taxonomy API

| Method | Path | Required Permission | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/admin/categories` | `content.read` | List category hierarchy tree. |
| `POST` | `/api/v1/admin/categories` | `content.edit` | Create category with parent reference. |
| `PUT` | `/api/v1/admin/categories/:id/translations/:locale` | `content.edit` | Upsert category translation name and slug. |
| `GET` | `/api/v1/admin/tags` | `content.read` | List tags with pagination. |
| `POST` | `/api/v1/admin/tags` | `content.edit` | Create tag. |
| `PUT` | `/api/v1/admin/tags/:id/translations/:locale` | `content.edit` | Upsert tag translation name and slug. |

## 4. Media Domain (`apps/api/src/media`)

| Method | Path | Required Permission | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/admin/media` | `media.read` | Paginated list, optional `mimeType`/`search` filters. |
| `GET` | `/api/v1/admin/media/:id` | `media.read` | Asset metadata, resolved delivery URL, and translations. |
| `POST` | `/api/v1/admin/media` | `media.upload` | Multipart file upload — validates, stores in MinIO, persists metadata. |
| `PUT` | `/api/v1/admin/media/:id/translations/:locale` | `media.update` | Upsert alt text / caption for a locale. |
| `DELETE` | `/api/v1/admin/media/:id` | `media.delete` | Soft-delete; `409` if still referenced by published content or an active person/partner profile. |
| `POST` | `/api/v1/admin/media/:id/restore` | `media.delete` | Undo a soft-delete. |

## 5. Navigation Domain (`apps/api/src/navigation`)

### 5.1 Admin Navigation API

All gated by `navigation.manage`.

| Method | Path | Description |
| :-- | :-- | :-- |
| `GET` | `/api/v1/admin/menus` | Paginated list, optional `isActive` filter. |
| `POST` | `/api/v1/admin/menus` | Create a menu (`key`, `isActive`). |
| `GET` | `/api/v1/admin/menus/:id` | Menu plus every item, flat with `parentId` (client builds the tree). |
| `PATCH` | `/api/v1/admin/menus/:id` | Update `isActive`. |
| `DELETE` | `/api/v1/admin/menus/:id` | Delete a menu — cascades to its items and translations. |
| `POST` | `/api/v1/admin/menus/:id/items` | Create a menu item (`linkType` + matching target field). |
| `PATCH` | `/api/v1/admin/menus/:id/items/:itemId` | Reparent, reorder, or hide/show — `linkType`/target are immutable. |
| `DELETE` | `/api/v1/admin/menus/:id/items/:itemId` | Delete an item — `409` if it still has children. |
| `PUT` | `/api/v1/admin/menus/:id/items/:itemId/translations/:locale` | Upsert `label`/`customPath` for a locale. |

### 5.2 Public Navigation API

| Method | Path | Auth | Description |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/public/menus/:key` | None | Active menu's visible items as a nested tree, each item's `href` already resolved. |
