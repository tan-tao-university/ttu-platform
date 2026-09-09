import Link from 'next/link';
import { SITE_NAME } from '@/lib/seo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200 bg-[#1f664c] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <p className="font-bold text-xl">{SITE_NAME}</p>
            <p className="text-sm text-white/80 leading-relaxed">
              Trường Đại học Tân Tạo — Đại học tư thục phi lợi nhuận theo mô hình Mỹ.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-base">Đào tạo</p>
            <ul className="flex flex-col gap-2 text-sm text-white/80">
              <li>
                <Link href="/dao-tao/chinh-quy" className="hover:text-white">
                  Hệ Chính quy
                </Link>
              </li>
              <li>
                <Link href="/dao-tao/sau-dai-hoc" className="hover:text-white">
                  Hệ Sau Đại học
                </Link>
              </li>
              <li>
                <Link href="/dao-tao/van-bang-2" className="hover:text-white">
                  Hệ Văn bằng 2
                </Link>
              </li>
              <li>
                <Link href="/dao-tao/lien-thong" className="hover:text-white">
                  Hệ Liên thông
                </Link>
              </li>
            </ul>
          </div>

          {/* Admissions */}
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-base">Tuyển sinh</p>
            <ul className="flex flex-col gap-2 text-sm text-white/80">
              <li>
                <Link
                  href="https://tuyensinh.ttu.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Đăng ký xét tuyển
                </Link>
              </li>
              <li>
                <Link href="/hoc-bong" className="hover:text-white">
                  Học bổng 2026
                </Link>
              </li>
              <li>
                <Link href="/phuong-thuc-tuyen-sinh" className="hover:text-white">
                  Phương thức xét tuyển
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-base">Liên hệ</p>
            <address className="flex flex-col gap-2 text-sm text-white/80 not-italic">
              <p>Đại lộ Đại học Tân Tạo, Tân Đức E.City, Xã Đức Hòa, Tỉnh Tây Ninh</p>
              <p>
                <a href="tel:+842723769216" className="hover:text-white">
                  (+84) 272 376 9216
                </a>
              </p>
              <p>
                <a href="mailto:info@ttu.edu.vn" className="hover:text-white">
                  info@ttu.edu.vn
                </a>
              </p>
              <p>
                <a
                  href="https://www.facebook.com/tantaouniversity"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  facebook.com/tantaouniversity
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-white/60">
            <Link href="/chinh-sach-bao-mat" className="hover:text-white">
              Chính sách bảo mật
            </Link>
            <Link href="/dieu-khoan-su-dung" className="hover:text-white">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
