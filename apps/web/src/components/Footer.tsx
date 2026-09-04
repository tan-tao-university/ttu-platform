import { Call02Icon, Facebook01Icon, Location01Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { SITE_NAME } from '@/lib/seo';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-neutral-600">
        <p className="font-semibold text-neutral-900">{SITE_NAME}</p>
        <p className="flex items-center gap-2">
          <HugeiconsIcon icon={Location01Icon} size={16} className="shrink-0" />
          Đại lộ Đại học Tân Tạo, Tân Đức E.City, Xã Đức Hòa, Tỉnh Tây Ninh
        </p>
        <a href="tel:+842723769216" className="flex items-center gap-2 hover:text-neutral-900">
          <HugeiconsIcon icon={Call02Icon} size={16} className="shrink-0" />
          (+84) 272 376 9216
        </a>
        <a href="mailto:info@ttu.edu.vn" className="flex items-center gap-2 hover:text-neutral-900">
          <HugeiconsIcon icon={Mail01Icon} size={16} className="shrink-0" />
          info@ttu.edu.vn
        </a>
        <a
          href="https://www.facebook.com/tantaouniversity"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-neutral-900"
        >
          <HugeiconsIcon icon={Facebook01Icon} size={16} className="shrink-0" />
          facebook.com/tantaouniversity
        </a>
      </div>
    </footer>
  );
}
