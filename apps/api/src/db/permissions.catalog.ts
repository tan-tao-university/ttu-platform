/**
 * Canonical CMS permission catalog (design doc 07 §11). Flat, machine-readable codes —
 * `role_permissions` grants are how a role's actual capabilities are assembled; this list is only
 * the fixed vocabulary of codes that can ever be granted. Changing a code here is a breaking
 * contract change (doc 07 §11: "đổi tên phải có migration rõ ràng").
 */
export interface PermissionCatalogEntry {
  code: string;
  description: string;
}

export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  { code: 'page.read', description: 'View pages and their draft state' },
  { code: 'page.create', description: 'Create new pages' },
  { code: 'page.edit', description: 'Edit page draft content and sections' },
  { code: 'page.delete', description: 'Soft-delete pages' },
  { code: 'page.publish', description: 'Publish a page locale, creating an immutable revision' },
  { code: 'page.restore', description: 'Restore a page locale to a prior published revision' },

  { code: 'content.read', description: 'View content items (news, announcements, events, ...)' },
  { code: 'content.create', description: 'Create new content items' },
  { code: 'content.edit', description: 'Edit content item draft translations' },
  { code: 'content.delete', description: 'Soft-delete content items' },
  {
    code: 'content.publish',
    description: 'Publish a content item locale, creating an immutable revision',
  },
  {
    code: 'content.restore',
    description: 'Restore a content item locale to a prior published revision',
  },

  { code: 'media.read', description: 'Browse and search the media library' },
  { code: 'media.upload', description: 'Upload new media assets' },
  { code: 'media.update', description: 'Edit media metadata (alt text, caption)' },
  { code: 'media.delete', description: 'Delete media assets' },

  { code: 'navigation.manage', description: 'Manage menus and menu items' },
  { code: 'redirect.manage', description: 'Manage URL redirects' },
  { code: 'settings.manage', description: 'Manage site settings' },
  { code: 'user.read', description: 'View CMS users and their role assignments' },
  { code: 'user.manage', description: 'Manage CMS user mappings and role assignments' },
  { code: 'role.manage', description: 'Manage roles and their permission grants' },
  { code: 'audit.read', description: 'View the audit log' },
];
