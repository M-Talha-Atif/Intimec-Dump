import { DEFAULT_LOCALE, isSupportedLocale, Locale } from "@/config/i18n";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Determine locale from cookie `locale`, with a safe fallback
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value?.toLowerCase();
  const locale: Locale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
