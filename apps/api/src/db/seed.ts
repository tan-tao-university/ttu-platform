import { sql } from 'drizzle-orm';
import { db, client } from './index';
import { PERMISSION_CATALOG } from './permissions.catalog';
import { permissions, rolePermissions, roles } from './schema';

/**
 * The 5 roles design doc 07 §10 names. `code` is the stable, machine-readable identifier;
 * `name` is the admin-facing label. All 5 are `isSystem: true` — pre-defined by the
 * platform, not something an admin created through a future role-management UI.
 */
const ROLES = [
  {
    code: 'super_admin',
    name: 'Super Admin',
    description: 'Full administrative access to every permission',
  },
  {
    code: 'cms_admin',
    name: 'CMS Admin',
    description: 'Manages content, pages, navigation, media, and CMS workflow',
  },
  { code: 'editor', name: 'Editor', description: 'Creates and edits page/content drafts' },
  {
    code: 'reviewer',
    name: 'Reviewer',
    description: 'Reviews draft content and participates in approval',
  },
  {
    code: 'publisher',
    name: 'Publisher',
    description: 'Publishes and restores content per granted permission',
  },
] as const;

async function seedPermissions() {
  await db
    .insert(permissions)
    .values(PERMISSION_CATALOG)
    .onConflictDoUpdate({
      target: permissions.code,
      set: { description: sql`excluded.description`, updatedAt: sql`now()` },
    });
  return db.select({ id: permissions.id, code: permissions.code }).from(permissions);
}

async function seedRoles() {
  await db
    .insert(roles)
    .values(ROLES.map((role) => ({ ...role, isSystem: true })))
    .onConflictDoUpdate({
      target: roles.code,
      set: { name: sql`excluded.name`, description: sql`excluded.description`, isSystem: true },
    });
  return db.select({ id: roles.id, code: roles.code }).from(roles);
}

/**
 * Grants `super_admin` every permission in the catalog — the only role/permission mapping
 * doc 07 specifies explicitly ("Quản trị toàn bộ TTU Platform" §10). The other 4 roles
 * (`cms_admin`, `editor`, `reviewer`, `publisher`) are seeded with zero grants: the doc
 * describes each role's area of responsibility in prose, not an exact permission-code
 * matrix, and guessing one here would silently encode unreviewed access-control policy.
 * Grant them their permissions explicitly once `role.manage` has an actual admin surface —
 * see docs/setup.md.
 */
async function seedSuperAdminGrants(
  roleRows: { id: string; code: string }[],
  permissionRows: { id: string; code: string }[],
) {
  const superAdmin = roleRows.find((role) => role.code === 'super_admin');
  if (!superAdmin) throw new Error('super_admin role was not seeded');

  await db
    .insert(rolePermissions)
    .values(
      permissionRows.map((permission) => ({ roleId: superAdmin.id, permissionId: permission.id })),
    )
    .onConflictDoNothing();
}

async function seed() {
  const permissionRows = await seedPermissions();
  const roleRows = await seedRoles();
  await seedSuperAdminGrants(roleRows, permissionRows);

  console.log(`Seeded ${permissionRows.length} permissions.`);
  console.log(`Seeded ${roleRows.length} roles: ${roleRows.map((r) => r.code).join(', ')}.`);
  console.log(`Granted "super_admin" all ${permissionRows.length} permissions.`);
  console.log('Other roles have no permission grants yet — assign them explicitly.');
}

if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => client.end());
}

export { seed };
