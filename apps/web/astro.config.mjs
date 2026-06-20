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
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: { prefixDefaultLocale: false },
  },
  redirects: {
    "/en/about": "/en/sobre-mi",
    "/en/kit/gracias": "/kit/gracias",
    "/en/kit": "/kit",
  },
  integrations: [
    react(),
    mdx(),
  ],
});
