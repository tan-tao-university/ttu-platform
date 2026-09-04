import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trường Đại học Tân Tạo',
  description: 'Website chính thức của Trường Đại học Tân Tạo (TTU).',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
