import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Footer, Navbar, type NavItem } from '@ttu/design-system';
import { isLocale, LOCALES, type Locale } from '@ttu/shared';
import { getTranslations } from 'next-intl/server';
import '../../styles/globals.css';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });

  const navItems: NavItem[] = [
    { label: t('about'), href: `/${locale}/gioi-thieu` },
    {
      label: t('admissions'),
      href: `/${locale}/tuyen-sinh`,
      children: [
        {
          label: t('items.admissions.methods'),
          href: `/${locale}/tuyen-sinh/phuong-thuc`,
        },
        {
          label: t('items.admissions.scholarships'),
          href: `/${locale}/hoc-bong`,
        },
        {
          label: t('items.admissions.info'),
          href: `/${locale}/tuyen-sinh/thong-tin`,
        },
        {
          label: t('items.admissions.counseling'),
          href: `/${locale}/tuyen-sinh/tu-van`,
        },
      ],
    },
    {
      label: t('academics'),
      href: `/${locale}/dao-tao`,
      children: [
        {
          label: t('items.academics.undergraduate'),
          href: `/${locale}/dao-tao/chinh-quy`,
        },
        {
          label: t('items.academics.postgraduate'),
          href: `/${locale}/dao-tao/sau-dai-hoc`,
        },
        {
          label: t('items.academics.secondDegree'),
          href: `/${locale}/dao-tao/van-bang-2`,
        },
        {
          label: t('items.academics.bridging'),
          href: `/${locale}/dao-tao/lien-thong`,
        },
        {
          label: t('items.academics.programs'),
          href: `/${locale}/chuong-trinh`,
        },
      ],
    },
    { label: t('research'), href: `/${locale}/nghien-cuu` },
    { label: t('news'), href: `/${locale}/tin-tuc` },
    {
      label: t('studentLife'),
      href: `/${locale}/doi-song-sinh-vien`,
      children: [
        {
          label: t('items.studentLife.clubs'),
          href: `/${locale}/doi-song-sinh-vien/clb`,
        },
        {
          label: t('items.studentLife.activities'),
          href: `/${locale}/doi-song-sinh-vien/hoat-dong`,
        },
        {
          label: t('items.studentLife.dorm'),
          href: `/${locale}/doi-song-sinh-vien/ktx`,
        },
        {
          label: t('items.studentLife.sports'),
          href: `/${locale}/doi-song-sinh-vien/the-thao`,
        },
      ],
    },
    {
      label: t('cooperation'),
      href: `/${locale}/hop-tac`,
      children: [
        {
          label: t('items.cooperation.international'),
          href: `/${locale}/hop-tac/quoc-te`,
        },
        {
          label: t('items.cooperation.industry'),
          href: `/${locale}/hop-tac/doanh-nghiep`,
        },
        {
          label: t('items.cooperation.exchange'),
          href: `/${locale}/hop-tac/trao-doi`,
        },
      ],
    },
    { label: t('contact'), href: `/${locale}/lien-he` },
  ];

  const footerColumns = [
    {
      title: 'Thông tin liên hệ',
      links: [
        { label: 'Hotline: (0272) 376 9216', href: 'tel:02723769216' },
        {
          label: 'Địa chỉ: Đại lộ Đại học Tân Tạo, Tân Đức E.City, Xã Đức Hòa, Tỉnh Long An',
          href: `/${locale}/lien-he#address`,
        },
        { label: 'Email: info@ttu.edu.vn', href: 'mailto:info@ttu.edu.vn' },
      ],
    },
    {
      title: 'Truy cập nhanh',
      links: [
        { label: 'Tin tức & sự kiện', href: `/${locale}/tin-tuc` },
        { label: 'Tuyển dụng', href: `/${locale}/tuyen-dung` },
        { label: 'Uniprep', href: `/${locale}/uniprep` },
        { label: 'Cơ sở vật chất', href: `/${locale}/co-so-vat-chat` },
        { label: 'Liên hệ', href: `/${locale}/lien-he` },
        { label: 'Thực tập Hoa Kỳ', href: `/${locale}/thuc-tap-hoa-ky` },
      ],
    },
    {
      title: 'Hệ sinh thái & Các khoa',
      links: [
        { label: 'Khoa Y', href: `/${locale}/khoa/y` },
        { label: 'Khoa Công nghệ thông tin', href: `/${locale}/khoa/cong-nghe-thong-tin` },
        { label: 'Khoa Công nghệ sinh học', href: `/${locale}/khoa/cong-nghe-sinh-hoc` },
        { label: 'Khoa Ngôn ngữ', href: `/${locale}/khoa/ngon-ngu` },
        { label: 'Khoa Kinh tế và Quản trị KD', href: `/${locale}/khoa/kinh-te` },
        { label: 'Khoa Điều dưỡng & KTXNYH', href: `/${locale}/khoa/dieu-duong` },
        { label: 'Khoa Nhân văn và GDKP', href: `/${locale}/khoa/nhan-van` },
        { label: 'Trường PTNK Tân Tạo', href: `/${locale}/he-sinh-thai/ptnk-tan-tao` },
        { label: 'Bệnh viện Đại học Y Tân Tạo', href: `/${locale}/he-sinh-thai/benh-vien` },
      ],
    },
  ];
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Navbar
        items={navItems}
        logo={
          <span className="flex items-center">
            {/* TTU shield + wordmark — exported from Figma node 185:6802. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/figma/header/ttu-logo-full.png"
              alt="Tan Tao University"
              width={285}
              height={51}
              className="h-[51px] w-auto"
            />
          </span>
        }
      />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer
        description={tFooter('description')}
        copyright={tFooter('copyright')}
        columns={footerColumns}
      />
    </NextIntlClientProvider>
  );
}
