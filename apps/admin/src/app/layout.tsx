import type { Metadata } from 'next';
import { AdminHeader } from '@/components/AdminHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quản trị nội dung — TTU',
  description: 'Bảng quản trị nội dung website chính thức của Trường Đại học Tân Tạo.',
  // Staff-only; there is nothing here to index.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col">
        <AdminHeader />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
