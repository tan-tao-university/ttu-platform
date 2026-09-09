import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface NotFoundProps {
  params: Promise<{ locale: string }>;
}

export default async function NotFound({ params }: NotFoundProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-neutral-600">{t("description")}</p>
      <Link href={`/${locale}`} className="font-medium text-orange-700 hover:underline">
        {t("backHome")}
      </Link>
    </main>
  );
}
