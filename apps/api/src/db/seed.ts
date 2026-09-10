import { and, eq, notInArray, sql } from 'drizzle-orm';
import { db, client } from './index';
import { PERMISSION_CATALOG } from './permissions.catalog';
import { ROLE_PERMISSION_GRANTS } from './role-permissions.catalog';
import { locales, permissions, rolePermissions, roles, siteSettings } from './schema';
import { SETTINGS_CATALOG } from '../settings/settings.catalog';

/**
 * Doc 01 §8: `vi` and `en` are the minimum supported locales. `vi` is the default — Tan Tao
 * University's primary audience.
 */
const LOCALES = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', isDefault: true, sortOrder: 0 },
  { code: 'en', name: 'English', nativeName: 'English', isDefault: false, sortOrder: 1 },
] as const;

async function seedLocales() {
  await db
    .insert(locales)
    .values([...LOCALES])
    .onConflictDoUpdate({
      target: locales.code,
      set: {
        name: sql`excluded.name`,
        nativeName: sql`excluded.native_name`,
        isDefault: sql`excluded.is_default`,
        sortOrder: sql`excluded.sort_order`,
      },
    });
  return db.select({ code: locales.code }).from(locales);
}

/**
 * The 5 roles design doc 07 §10 names. `code` is the stable, machine-readable identifier; `name` is
 * the admin-facing label. All 5 are `isSystem: true` — pre-defined by the platform, not something
 * an admin created through a future role-management UI.
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
 * Grants `super_admin` every permission in the catalog directly — doc 07 §10 gives it blanket scope
 * ("Quản trị toàn bộ TTU Platform"), unlike the other 4 roles, whose grants are the curated
 * `ROLE_PERMISSION_GRANTS` map applied by `seedRoleGrants` below.
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

/**
 * Syncs the 4 non-`super_admin` roles' grants to exactly `ROLE_PERMISSION_GRANTS` — inserts missing
 * grants and revokes anything no longer listed, so re-running the seed after the catalog changes
 * converges these `isSystem: true` roles to the documented matrix instead of only ever adding to
 * it.
 */
async function seedRoleGrants(
  roleRows: { id: string; code: string }[],
  permissionRows: { id: string; code: string }[],
) {
  const permissionIdByCode = new Map(
    permissionRows.map((permission) => [permission.code, permission.id]),
  );

  for (const [roleCode, grantedCodes] of Object.entries(ROLE_PERMISSION_GRANTS)) {
    const role = roleRows.find((r) => r.code === roleCode);
    if (!role) throw new Error(`${roleCode} role was not seeded`);

    const grantedIds = grantedCodes.map((code) => {
      const id = permissionIdByCode.get(code);
      if (!id) throw new Error(`Unknown permission code "${code}" granted to role "${roleCode}"`);
      return id;
    });

    if (grantedIds.length > 0) {
      await db
        .insert(rolePermissions)
        .values(grantedIds.map((permissionId) => ({ roleId: role.id, permissionId })))
        .onConflictDoNothing();
    }

    await db
      .delete(rolePermissions)
      .where(
        grantedIds.length > 0
          ? and(
              eq(rolePermissions.roleId, role.id),
              notInArray(rolePermissions.permissionId, grantedIds),
            )
          : eq(rolePermissions.roleId, role.id),
      );
  }
}

/**
 * Bootstrap values for the 4 `SETTINGS_CATALOG` keys, sourced by reading the live
 * `https://ttu.edu.vn/` site this platform replaces (footer contact block, header/footer social
 * icons, `og:`/`twitter:` meta tags, and the homepage's "EVENTS" widget) - not invented. Parsed
 * through each key's own Zod schema before insert so a typo here fails loudly at seed time rather
 * than silently persisting invalid data.
 */
const SITE_SETTINGS_SEED_DATA: Record<string, unknown> = {
  'site.contact': {
    phone: '(+84) 272 376 9216',
    email: 'info@ttu.edu.vn',
    workingHours: 'Thứ 2 – Thứ 6, 8:00 sáng – 4:30 chiều',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.245651167569!2d106.4397433146529!3d10.792488261848522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310ad3f703fc2821%3A0xd03984a57f051ab8!2sTan+Tao+University!5e0!3m2!1sen!2s!4v1482826842333',
    organizationNameByLocale: { vi: 'Đại học Tân Tạo', en: 'Tan Tao University' },
    addressByLocale: {
      vi: 'Đại lộ Đại học Tân Tạo, Tân Đức E.City, Xã Đức Hòa, Tỉnh Tây Ninh',
      en: 'Tan Tao University Avenue, Ecity Tan Duc, Duc Hoa Commune, Tay Ninh Province, Vietnam',
    },
  },
  'site.social_links': {
    facebook: 'https://www.facebook.com/tantaouniversity',
    instagram: 'https://www.instagram.com/tantaouniversity/',
    twitter: 'https://twitter.com/TanTaoUni',
    youtube: 'https://www.youtube.com/user/DHTANTAO',
    linkedin: null,
  },
  'seo.defaults': {
    defaultTitleByLocale: { vi: 'Đại học Tân Tạo', en: 'Tan Tao University' },
    defaultDescriptionByLocale: {
      vi: 'Khám phá thêm Tin tức TTU',
      en: 'Explore more TTU News',
    },
    defaultOgImageId: null,
  },
  'features.public': {
    showEventsWidget: true,
    maintenanceMode: false,
  },
};

/**
 * Insert-if-missing, never overwrite: unlike locales/permissions/roles, settings become admin-owned
 * mutable data the moment they're seeded - a later `db:seed` re-run must not silently discard a
 * real edit made through `PUT /api/v1/settings/:key`.
 */
async function seedSiteSettings() {
  const rows = Object.entries(SITE_SETTINGS_SEED_DATA).map(([key, value]) => ({
    key,
    value: SETTINGS_CATALOG[key].schema.parse(value),
  }));
  await db.insert(siteSettings).values(rows).onConflictDoNothing({ target: siteSettings.key });
  return rows;
}

async function seed() {
  const localeRows = await seedLocales();
  const permissionRows = await seedPermissions();
  const roleRows = await seedRoles();
  await seedSuperAdminGrants(roleRows, permissionRows);
  await seedRoleGrants(roleRows, permissionRows);
  const settingsRows = await seedSiteSettings();

  console.log(`Seeded ${localeRows.length} locales: ${localeRows.map((l) => l.code).join(', ')}.`);
  console.log(`Seeded ${permissionRows.length} permissions.`);
  console.log(`Seeded ${roleRows.length} roles: ${roleRows.map((r) => r.code).join(', ')}.`);
  console.log(`Granted "super_admin" all ${permissionRows.length} permissions.`);
  console.log(
    `Synced grants for ${Object.keys(ROLE_PERMISSION_GRANTS).length} other roles per design doc 07 §10.`,
  );
  console.log(
    `Seeded ${settingsRows.length} site settings (insert-if-missing): ${settingsRows.map((r) => r.key).join(', ')}.`,
  );
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
