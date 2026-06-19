// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://franciscoabad.com",
  output: "static",
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
