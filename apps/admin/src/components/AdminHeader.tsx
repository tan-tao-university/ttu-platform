import { ArrowUpRight01Icon, Logout03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { getSession } from '@/lib/auth/get-session';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ttu.edu.vn';

export async function AdminHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Quản trị nội dung TTU
        </span>
        <div className="flex items-center gap-4">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:underline"
          >
            Xem website
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
          </a>
          {session && (
            <form action="/api/auth/logout" method="post">
              <span className="mr-3 text-sm text-neutral-500">
                {session.displayName ?? session.email ?? session.sub}
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:underline"
              >
                Đăng xuất
                <HugeiconsIcon icon={Logout03Icon} size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
