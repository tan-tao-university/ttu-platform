import { fetchMe } from '@/lib/api/me';
import { getSession } from '@/lib/auth/get-session';

export default async function AdminHomePage() {
  // middleware.ts already guarantees a valid session reaches this page — no unauthenticated
  // fallback branch here.
  const session = await getSession();
  if (!session) return null;

  const me = await fetchMe(session.accessToken);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold">Quản trị nội dung TTU</h1>
        <p className="mt-2 text-neutral-600">
          Đăng nhập với danh tính TTU Identity. Các màn hình quản lý nội dung sẽ được thêm khi các
          API tương ứng sẵn sàng.
        </p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-neutral-200 p-4 text-sm">
        <dt className="font-medium text-neutral-500">Tài khoản</dt>
        <dd>{session.displayName ?? session.email ?? session.sub}</dd>
        <dt className="font-medium text-neutral-500">Trạng thái</dt>
        <dd>{me.isActive ? 'Đang hoạt động' : 'Đã bị vô hiệu hóa'}</dd>
        <dt className="font-medium text-neutral-500">Quyền hạn</dt>
        <dd>
          {me.permissions.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {me.permissions.map((permission) => (
                <li
                  key={permission}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-700"
                >
                  {permission}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-neutral-500">
              Chưa được cấp quyền — liên hệ quản trị viên hệ thống.
            </span>
          )}
        </dd>
      </dl>
    </main>
  );
}
