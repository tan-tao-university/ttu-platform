import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://tan-tao.edu.vn`;

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["vi", "en"] as const;
  const staticPages = [
    { url: "", changeFrequency: "daily" as const, priority: 1 },
    { url: "/gioi-thieu", changeFrequency: "weekly" as const, priority: 0.8 },
    { url: "/tuyen-sinh", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "/tin-tuc", changeFrequency: "daily" as const, priority: 0.7 },
    { url: "/lien-he", changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  return locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${SITE_URL}/${locale}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  );
}
