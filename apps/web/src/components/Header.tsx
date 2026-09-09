import Link from 'next/link';
import { SITE_NAME } from '@/lib/seo';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo + name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            {/* Placeholder logo circle */}
            <div className="absolute inset-0 rounded-full bg-[#1f664c]" />
            <div className="absolute inset-[20%] rounded-full bg-[#3db97d]" />
          </div>
          <span className="font-bold text-lg text-[#1f664c]">{SITE_NAME}</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-[16px] font-medium text-[#1f664c]">
          <Link href="/" className="hover:text-[#3db97d] transition-colors">
            Trang chủ
          </Link>
          <Link href="/gioi-thieu" className="hover:text-[#3db97d] transition-colors">
            Giới thiệu
          </Link>
          <Link href="/dao-tao" className="hover:text-[#3db97d] transition-colors">
            Đào tạo
          </Link>
          <Link href="/tin-tuc" className="hover:text-[#3db97d] transition-colors">
            Tin tức
          </Link>
          <Link href="/tuyen-sinh" className="hover:text-[#3db97d] transition-colors">
            Tuyển sinh
          </Link>
          <Link href="/lien-he" className="hover:text-[#3db97d] transition-colors">
            Liên hệ
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="https://tuyensinh.ttu.edu.vn"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px]
                     bg-gradient-to-b from-[#ff794a] to-[#ff9500]
                     text-[14px] font-medium text-white
                     hover:opacity-90 transition-opacity"
        >
          Tuyển sinh
        </Link>
      </div>
    </header>
  );
}
