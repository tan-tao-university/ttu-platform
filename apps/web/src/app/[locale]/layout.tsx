import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Footer, Navbar, type NavItem } from "@ttu/design-system";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@ttu/shared";
import { getTranslations } from "next-intl/server";
import "../../styles/globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "nav" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  const navItems: NavItem[] = [
    { label: t("about"), href: `/${locale}/gioi-thieu` },
    {
      label: t("admissions"),
      href: `/${locale}/tuyen-sinh`,
      children: [
        {
          label: t("items.admissions.methods"),
          href: `/${locale}/tuyen-sinh/phuong-thuc`,
        },
        {
          label: t("items.admissions.scholarships"),
          href: `/${locale}/hoc-bong`,
        },
        {
          label: t("items.admissions.info"),
          href: `/${locale}/tuyen-sinh/thong-tin`,
        },
        {
          label: t("items.admissions.counseling"),
          href: `/${locale}/tuyen-sinh/tu-van`,
        },
      ],
    },
    {
      label: t("academics"),
      href: `/${locale}/dao-tao`,
      children: [
        {
          label: t("items.academics.undergraduate"),
          href: `/${locale}/dao-tao/chinh-quy`,
        },
        {
          label: t("items.academics.postgraduate"),
          href: `/${locale}/dao-tao/sau-dai-hoc`,
        },
        {
          label: t("items.academics.secondDegree"),
          href: `/${locale}/dao-tao/van-bang-2`,
        },
        {
          label: t("items.academics.bridging"),
          href: `/${locale}/dao-tao/lien-thong`,
        },
        {
          label: t("items.academics.programs"),
          href: `/${locale}/chuong-trinh`,
        },
      ],
    },
    { label: t("research"), href: `/${locale}/nghien-cuu` },
    { label: t("news"), href: `/${locale}/tin-tuc` },
    {
      label: t("studentLife"),
      href: `/${locale}/doi-song-sinh-vien`,
      children: [
        {
          label: t("items.studentLife.clubs"),
          href: `/${locale}/doi-song-sinh-vien/clb`,
        },
        {
          label: t("items.studentLife.activities"),
          href: `/${locale}/doi-song-sinh-vien/hoat-dong`,
        },
        {
          label: t("items.studentLife.dorm"),
          href: `/${locale}/doi-song-sinh-vien/ktx`,
        },
        {
          label: t("items.studentLife.sports"),
          href: `/${locale}/doi-song-sinh-vien/the-thao`,
        },
      ],
    },
    {
      label: t("cooperation"),
      href: `/${locale}/hop-tac`,
      children: [
        {
          label: t("items.cooperation.international"),
          href: `/${locale}/hop-tac/quoc-te`,
        },
        {
          label: t("items.cooperation.industry"),
          href: `/${locale}/hop-tac/doanh-nghiep`,
        },
        {
          label: t("items.cooperation.exchange"),
          href: `/${locale}/hop-tac/trao-doi`,
        },
      ],
    },
    { label: t("contact"), href: `/${locale}/lien-he` },
  ];

  const footerColumns = [
    {
      title: tFooter("columns.about.title"),
      links: [
        {
          label: tFooter("columns.about.links.overview"),
          href: `/${locale}/gioi-thieu`,
        },
        {
          label: tFooter("columns.about.links.leadership"),
          href: `/${locale}/gioi-thieu/ban-giam-hieu`,
        },
        {
          label: tFooter("columns.about.links.history"),
          href: `/${locale}/gioi-thieu/lich-su`,
        },
        {
          label: tFooter("columns.about.links.vision"),
          href: `/${locale}/gioi-thieu/tam-nhin`,
        },
      ],
    },
    {
      title: tFooter("columns.academics.title"),
      links: [
        {
          label: tFooter("columns.academics.links.faculties"),
          href: `/${locale}/khoa`,
        },
        {
          label: tFooter("columns.academics.links.programs"),
          href: `/${locale}/chuong-trinh`,
        },
        {
          label: tFooter("columns.academics.links.admissions"),
          href: `/${locale}/tuyen-sinh`,
        },
        {
          label: tFooter("columns.academics.links.scholarships"),
          href: `/${locale}/hoc-bong`,
        },
      ],
    },
    {
      title: tFooter("columns.contact.title"),
      links: [
        {
          label: tFooter("columns.contact.links.address"),
          href: `/${locale}/lien-he#address`,
        },
        {
          label: tFooter("columns.contact.links.phone"),
          href: `/${locale}/lien-he#phone`,
        },
        {
          label: tFooter("columns.contact.links.email"),
          href: `/${locale}/lien-he#email`,
        },
      ],
    },
  ];

  const buildLocaleHref = (target: Locale) => {
    // Naive: keep same path. Real strategy depends on routing.
    if (typeof window === "undefined") {
      return `/${target}`;
    }
    const stripped = window.location.pathname.replace(/^\/(vi|en)/, "");
    return `/${target}${stripped || ""}`;
  };

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Navbar
        items={navItems}
        locale={locale}
        locales={LOCALES}
        buildLocaleHref={buildLocaleHref}
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
        description={tFooter("description")}
        copyright={tFooter("copyright")}
        columns={footerColumns}
      />
    </NextIntlClientProvider>
  );
}
