// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://franciscoabad.com",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/admin") && !page.includes("/draft"),
      serialize(item) {
        // Home: priority 1.0
        if (item.url === "https://franciscoabad.com/") {
          return { ...item, priority: 1.0, changefreq: "weekly" };
        }
        // Blog index: priority 0.9, weekly
        if (item.url.endsWith("/blog/")) {
          return { ...item, priority: 0.9, changefreq: "weekly" };
        }
        // Posts individuales: priority 0.8, monthly
        if (item.url.includes("/blog/")) {
          return { ...item, priority: 0.8, changefreq: "monthly" };
        }
        return item;
      },
    }),
    mdx(),
  ],
});
