import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE } from "@ttu/shared";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://tan-tao.edu.vn`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

export const metadata: MetadataRoute.Robots = {
  rules: { userAgent: "*", allow: "/" },
  sitemap: `${SITE_URL}/sitemap.xml`,
};
