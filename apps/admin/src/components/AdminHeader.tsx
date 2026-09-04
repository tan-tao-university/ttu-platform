import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ttu.edu.vn';

export function AdminHeader() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Quản trị nội dung TTU
        </span>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:underline"
        >
          Xem website
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
        </a>
      </div>
    </header>
  );
}
