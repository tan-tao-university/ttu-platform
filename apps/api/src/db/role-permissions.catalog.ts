/**
 * Non-`super_admin` role → permission grants (design doc 07 §10 role descriptions, doc 01 §4 user
 * personas). `super_admin` is granted every catalog permission directly by `seedSuperAdminGrants`
 * in `seed.ts` — doc 07 §10 gives it blanket scope ("Quản trị toàn bộ TTU Platform"), so it is not
 * listed here. The 4 roles below only have their area of responsibility described in prose, so each
 * grant list is justified against the docs individually rather than inferred.
 */
export const ROLE_PERMISSION_GRANTS: Record<string, string[]> = {
  /**
   * Cms_admin — doc 07 §10: "Quản lý nội dung, page, navigation, media và workflow CMS; không mặc
   * định có quyền quản trị hệ thống nhạy cảm." Doc 01 §4.4 lists page, menu, category/tag, media,
   * redirect and CMS-settings management. Category/tag (taxonomy) endpoints are guarded by
   * `content.read`/`content.edit` (see `taxonomy/controllers/`), so no separate taxonomy permission
   * code exists to grant. `user.read`, `user.manage`, `role.manage` and `audit.read` are withheld:
   * doc 07 §10 explicitly reserves "quyền quản trị hệ thống nhạy cảm" to `super_admin`, and doc 07
   * §11 lists those four codes as system/user administration.
   */
  cms_admin: [
    'page.read',
    'page.create',
    'page.edit',
    'page.delete',
    'page.publish',
    'page.restore',
    'content.read',
    'content.create',
    'content.edit',
    'content.delete',
    'content.publish',
    'content.restore',
    'media.read',
    'media.upload',
    'media.update',
    'media.delete',
    'navigation.manage',
    'redirect.manage',
    'settings.manage',
  ],
  /**
   * Editor — doc 07 §10: "Tạo và chỉnh sửa page/content draft." Doc 01 §4.2: create/edit page and
   * content drafts, upload or pick media, no default publish right ("Không mặc định có quyền
   * publish nếu workflow yêu cầu reviewer"). Excludes delete/publish/restore on both page and
   * content, and every navigation/redirect/settings/user/role/audit permission.
   */
  editor: [
    'page.read',
    'page.create',
    'page.edit',
    'content.read',
    'content.create',
    'content.edit',
    'media.read',
    'media.upload',
  ],
  /**
   * Reviewer — doc 07 §10: "Review nội dung và tham gia workflow phê duyệt." Doc 01 §4.3: reads
   * drafts and requests changes; does not publish — doc 07 §14's editor → reviewer → publisher
   * separation keeps `*.publish` on `publisher` only. Read-only.
   */
  reviewer: ['page.read', 'content.read'],
  /**
   * Publisher — doc 07 §10: "Publish/restore nội dung theo permission được cấp." Doc 01 §4.3:
   * publishes and restores/rolls back revisions. Not a content author, so no create/edit/delete
   * grants.
   */
  publisher: [
    'page.read',
    'page.publish',
    'page.restore',
    'content.read',
    'content.publish',
    'content.restore',
  ],
};
