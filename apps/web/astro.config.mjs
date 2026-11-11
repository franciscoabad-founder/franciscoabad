// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://franciscoabad.com",
  // "static" en Astro 6 es el modo mixto: páginas pre-renderizadas por defecto.
  // Endpoints con `export const prerender = false` corren como Vercel Functions.
  output: "static",
  adapter: cloudflare({ imageService: "compile" }),
  vite: {
    plugins: [tailwindcss()],
    // Cloudflare Workers has no process.env at runtime. Private server variables are set as
    // build variables in the Cloudflare project and inlined into the server bundle only.
    define: Object.fromEntries(
      [
        "OS_AUTH_TOKEN", "OS_API_TOKEN", "OS_PASSWORD", "GBRAIN_TOKEN", "TASKI_TOKEN",
        "RESEND_API_KEY", "CORTEX_APP_URL", "CORTEX_ADMIN_TOKEN", "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY", "OS_SYSTEM_WEBHOOK_URL", "OFF_CONTACT_EMAIL",
        "N8N_TRANSCRIBE_URL", "N8N_FOTO_COMIDA_URL", "N8N_CONTACT_WEBHOOK_URL",
        "N8N_ASSISTANT_URL", "KIT_DOWNLOAD_URL", "CAPTURE_WEBHOOK_URL",
      ].map((k) => [`import.meta.env.${k}`, JSON.stringify(process.env[k] ?? "")]),
    ),
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
