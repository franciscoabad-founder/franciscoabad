// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://franciscoabad.com",
  // "static" en Astro 6 es el modo mixto: páginas pre-renderizadas por defecto.
  // Endpoints con `export const prerender = false` corren como Vercel Functions.
  output: "static",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: { prefixDefaultLocale: false },
  },
  redirects: {
    // English moved to the root; Spanish moved under /es/. Old URLs keep working.
    "/en": "/",
    "/en/about": "/about",
    "/en/sobre-mi": "/about",
    "/en/trabaja-conmigo": "/work-with-me",
    "/en/contacto": "/contact",
    "/en/kit/gracias": "/kit/gracias",
    "/en/kit": "/kit",
    "/sobre-mi": "/es/sobre-mi",
    "/trabaja-conmigo": "/es/trabaja-conmigo",
    "/portafolio": "/es/portafolio",
    "/contacto": "/es/contacto",
  },
  integrations: [
    react(),
    mdx(),
  ],
});
