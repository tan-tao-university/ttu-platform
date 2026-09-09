import { PERMISSION_CATALOG } from '@/db/permissions.catalog';
import { ROLE_PERMISSION_GRANTS } from '@/db/role-permissions.catalog';

describe('ROLE_PERMISSION_GRANTS', () => {
  const knownCodes = new Set(PERMISSION_CATALOG.map((permission) => permission.code));
  const allGrants = Object.values(ROLE_PERMISSION_GRANTS).flat();

  it('never grants a permission code outside the catalog', () => {
    for (const code of allGrants) expect(knownCodes.has(code)).toBe(true);
  });

  it('never grants a role the same permission twice', () => {
    for (const codes of Object.values(ROLE_PERMISSION_GRANTS)) {
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it('withholds sensitive system-administration permissions from every non-super_admin role (doc 07 §10)', () => {
    const sensitive = ['user.read', 'user.manage', 'role.manage', 'audit.read'];
    for (const code of allGrants) expect(sensitive).not.toContain(code);
  });

  it('gives editor drafting rights but no publish, delete, or restore (doc 01 §4.2: "Không mặc định có quyền publish")', () => {
    const editor = ROLE_PERMISSION_GRANTS.editor;
    expect(editor).toEqual(
      expect.arrayContaining(['page.create', 'page.edit', 'content.create', 'content.edit']),
    );
    for (const code of editor) {
      expect(code.endsWith('.publish')).toBe(false);
      expect(code.endsWith('.delete')).toBe(false);
      expect(code.endsWith('.restore')).toBe(false);
    }
  });

  it('keeps reviewer strictly read-only (doc 07 §14: publish belongs to publisher, not reviewer)', () => {
    for (const code of ROLE_PERMISSION_GRANTS.reviewer) expect(code.endsWith('.read')).toBe(true);
  });

  it('gives publisher publish/restore rights but no authoring rights (doc 01 §4.3)', () => {
    const publisher = ROLE_PERMISSION_GRANTS.publisher;
    expect(publisher).toEqual(
      expect.arrayContaining([
        'page.publish',
        'page.restore',
        'content.publish',
        'content.restore',
      ]),
    );
    for (const code of publisher) {
      expect(code.endsWith('.create')).toBe(false);
      expect(code.endsWith('.edit')).toBe(false);
      expect(code.endsWith('.delete')).toBe(false);
    }
  });

  it('gives cms_admin full page/content/media lifecycle plus navigation, redirect, and settings management (doc 01 §4.4)', () => {
    const cmsAdmin = new Set(ROLE_PERMISSION_GRANTS.cms_admin);
    for (const domain of ['page', 'content']) {
      for (const action of ['read', 'create', 'edit', 'delete', 'publish', 'restore']) {
        expect(cmsAdmin.has(`${domain}.${action}`)).toBe(true);
      }
    }
    for (const action of ['read', 'upload', 'update', 'delete']) {
      expect(cmsAdmin.has(`media.${action}`)).toBe(true);
    }
    expect(cmsAdmin.has('navigation.manage')).toBe(true);
    expect(cmsAdmin.has('redirect.manage')).toBe(true);
    expect(cmsAdmin.has('settings.manage')).toBe(true);
  });
});
