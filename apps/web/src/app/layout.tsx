/**
 * Root layout — minimal HTML shell.
 *
 * All locale-specific content (Navbar, Footer, i18n providers) lives in
 * app/src/app/[locale]/layout.tsx which renders inside {children}.
 *
 * This root layout must include <html> and <body> tags per Next.js App Router requirements; it
 * intentionally provides no locale-specific markup so that [locale]/layout.tsx can inject that
 * independently.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
