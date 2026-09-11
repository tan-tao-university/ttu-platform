import Image from 'next/image';
import Link from 'next/link';
import { cn } from '../lib/cn';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Logo or brand mark. */
  logo?: React.ReactNode;
  /** Optional brand description retained for API compatibility. */
  description?: string;
  /** Footer navigation columns. */
  columns?: FooterColumn[];
  /** Copyright statement. */
  copyright?: string;
  className?: string;
}

const SOCIAL_LINKS = [
  { label: 'Zalo', href: '#', src: '/figma/footer/zalo.svg', size: 26 },
  { label: 'YouTube', href: '#', src: '/figma/footer/youtube.svg', size: 26 },
  { label: 'TikTok', href: '#', src: '/figma/footer/tiktok.svg', size: 22 },
  { label: 'Facebook', href: '#', src: '/figma/footer/facebook.svg', size: 24 },
  { label: 'Instagram', href: '#', src: '/figma/footer/instagram.svg', size: 24 },
] as const;

/** Site footer matching Figma node 185:9764. */
export function Footer({ logo, columns = [], copyright, className }: FooterProps) {
  const defaultCopyright = copyright ?? 'Mọi quyền được bảo lưu © Đại học Tân Tạo 2026';

  return (
    <footer className={cn('relative min-h-[663px] overflow-hidden text-ttu-white', className)}>
      <Image
        src="/figma/footer/background.png"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(-46.4201deg, rgb(45, 46, 131) 22.869%, rgba(0, 141, 54, 0.9) 78.716%)',
        }}
      />

      <div className="relative mx-auto flex min-h-[663px] w-full max-w-[980px] flex-col px-6 pb-24 pt-[76px] lg:px-0">
        <div className="relative h-[55px] w-[270px]">
          {logo ?? (
            <Image
              src="/figma/header/ttu-logo-full.png"
              alt="Tan Tao University"
              fill
              className="object-contain brightness-0 invert"
              sizes="270px"
            />
          )}
        </div>

        <div className="mt-[37px] grid gap-10 sm:grid-cols-2 lg:grid-cols-[189px_189px_189px_151px] lg:gap-[73px]">
          {columns.slice(0, 3).map((column) => (
            <div key={column.title} className="w-[189px]">
              <h3 className="text-[16px] font-bold leading-normal">{column.title}</h3>
              <ul className="mt-[14px] flex flex-col gap-[14px] text-[12px] font-light leading-normal">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="transition-opacity hover:opacity-75"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <a
            href="tel:02723769216"
            className="flex h-[93px] w-[151px] items-center justify-center rounded-[8px] border border-green-deep bg-ttu-gradient-cta px-5"
          >
            <span className="text-[14px] font-normal leading-normal">
              Hotline
              <br />
              <strong>(0272) 376 9216</strong>
              <br />
              <strong>(0981) 152 153</strong>
            </span>
          </a>
        </div>

        <div className="mt-10 flex flex-col items-start lg:absolute lg:left-0 lg:top-[354px] lg:mt-0">
          <div className="flex items-start gap-[9px]">
            <Image
              src="/figma/footer/badge-commerce.png"
              alt="Đã thông báo Bộ Công Thương"
              width={120}
              height={46}
              className="h-[46px] w-[120px]"
            />
            <Image
              src="/figma/footer/badge-dmca.png"
              alt="DMCA Protected"
              width={100}
              height={50}
              className="h-[50px] w-[100px]"
            />
          </div>
          <p className="mt-[9px] text-[14px] font-normal leading-normal">Theo dõi chúng tôi:</p>
          <div className="mt-[9px] flex items-center gap-[9px]">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="relative block shrink-0 transition-opacity hover:opacity-75"
                style={{ width: social.size, height: social.size }}
              >
                <Image src={social.src} alt="" fill className="object-contain" sizes="26px" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-[55px] mx-auto flex max-w-[980px] items-center gap-7 lg:inset-x-0">
        <p className="w-[153px] shrink-0 text-[12px] font-light leading-normal">
          {defaultCopyright}
        </p>
        <div className="flex h-[3px] flex-1 items-center">
          <div className="h-full w-2/3 bg-orange" />
          <div className="h-full flex-1 bg-ttu-white" />
        </div>
      </div>
    </footer>
  );
}
