import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/seo';

export function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-neutral-900">
          {SITE_NAME}
        </Link>
        <a
          href="https://tuyensinh.ttu.edu.vn"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#BA4811] hover:underline"
        >
          Tuyển sinh
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
        </a>
      </div>
    </header>
  );
}
