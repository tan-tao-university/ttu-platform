import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@ttu/shared";
import { HomePage } from "@/components/home/HomePage";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  return <HomePage locale={locale} />;
}
