import es from "./es.json";
import en from "./en.json";

const translations = { es, en } as const;

type Locale = keyof typeof translations;
type TranslationKey = keyof typeof es;

export function useTranslations(locale: string | undefined = "es") {
  const lang: Locale = locale === "en" ? "en" : "es";
  return function t(key: TranslationKey): string {
    return (translations[lang] as Record<string, string>)[key]
      ?? (translations["es"] as Record<string, string>)[key]
      ?? key;
  };
}

export function getLocalePath(pathname: string, targetLocale: "es" | "en"): string {
  const isEn = pathname.startsWith("/en");
  if (targetLocale === "en") {
    return isEn ? pathname : `/en${pathname === "/" ? "" : pathname}`;
  }
  return isEn ? pathname.replace(/^\/en/, "") || "/" : pathname;
}
