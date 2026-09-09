import createMiddleware from "next-intl/middleware";
import { DEFAULT_LOCALE, LOCALES } from "@ttu/shared";

export default createMiddleware({
  locales: LOCALES as unknown as string[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

export const config = {
  // Match all paths except: api, _next, _vercel, static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
