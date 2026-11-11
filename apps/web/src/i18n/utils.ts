import es from "./es.json";
import en from "./en.json";

const translations = { es, en } as const;

type Locale = keyof typeof translations;
type TranslationKey = keyof typeof es;

// English is the default language (served from "/"); Spanish lives under "/es/".
export function useTranslations(locale: string | undefined = "en") {
  const lang: Locale = locale === "es" ? "es" : "en";
  return function t(key: TranslationKey): string {
    return (translations[lang] as Record<string, string>)[key]
      ?? (translations["en"] as Record<string, string>)[key]
      ?? key;
  };
}

// One map of equivalent pages per language. Navbar, footer, language toggle and
// section links read from here, so a route only has to be defined once.
export const routes = {
  home:      { en: "/",             es: "/es/" },
  about:     { en: "/about",        es: "/es/sobre-mi" },
  work:      { en: "/work-with-me", es: "/es/trabaja-conmigo" },
  portfolio: { en: "/portfolio",    es: "/es/portafolio" },
  speaking:  { en: "/talks",     es: "/es/trabaja-conmigo" },
  blog:      { en: "/blog",         es: "/es/blog" },
  contact:   { en: "/contact",      es: "/es/contacto" },
  kit:       { en: "/kit",          es: "/kit" },
} as const;

export type RouteKey = keyof typeof routes;

export function route(key: RouteKey, lang: string | undefined): string {
  return routes[key][lang === "es" ? "es" : "en"];
}

const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

// Path of the same page in the other language. Pages with no equivalent
// (blog posts, kit, os) fall back to the target language home.
export function getLocalePath(pathname: string, targetLocale: "es" | "en"): string {
  const current = norm(pathname);
  for (const pair of Object.values(routes)) {
    if (norm(pair.en) === current || norm(pair.es) === current) return pair[targetLocale];
  }
  return targetLocale === "en" ? "/" : "/es/";
}

export function hasEquivalent(pathname: string): boolean {
  const current = norm(pathname);
  return Object.values(routes).some((pair) => norm(pair.en) === current || norm(pair.es) === current);
}
