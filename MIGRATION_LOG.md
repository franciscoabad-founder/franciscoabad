# Migración a Astro — Bitácora

## Resumen

Migración del sitio franciscoabad.com de Vite/React (SPA, mal SEO) a Astro (HTML estático, SEO real). Trabajo iniciado el 3 de mayo de 2026. Branch `feat/astro-migration`.

## Estado actual

- Sprint 0: cleanup pre-Astro ✅
- Sprint 1 Fase 1: setup Astro base ✅
- Sprint 1 Fase 2A: secciones de Home ✅
- Sprint 1 Fase 2B: Sobre Mí + Trabaja Conmigo ✅
- Sprint 2 Fase 1A: blog content collections ✅
- Sprint 2 Fase 1B: imágenes blog 01 + optimización ✅
- Sprint 4: SEO técnico completo ✅
- Sprint 3: Resend + Beehiiv + quiz endpoints ⏸️ pendiente
- Deploy a producción ⏸️ pendiente

## Sprints ejecutados

### Sprint 0 — Pre-Astro cleanup

- Apagado el admin en main (código preservado)
- Eliminada `VITE_SUPABASE_SERVICE_ROLE_KEY` del bundle cliente
- 9 dependencias muertas removidas
- 9 archivos huérfanos borrados (~7.4 MB recuperados)
- 7 imágenes optimizadas a WebP (96% reducción promedio)
- `francisco-abad.png` 18.8 MB → `francisco-abad.webp` 73 KB
- Tabla `quiz_leads` creada en Supabase con RLS
- Bundle JS legacy: 1086 KB → 557 KB (-49%)

### Sprint 1 — Migración a Astro

Fase 1: setup base
- `apps/web/` inicializado con Astro 6 + Tailwind v4 + React + Sitemap
- BaseLayout con SEO meta tags
- Navbar como island, Footer estático

Fase 2A: secciones Home
- Hero con WebP optimizada
- LogosInstitucionales (14 logos)
- ProblemStatement, Stats (island con countup), Services
- Resources, BlogPreview, NewsletterCTA

Fase 2B: páginas restantes
- Testimonials con 9 fotos
- Sobre Mí con acordeón `<details>` nativo
- Trabaja Conmigo con CTAs "Próximamente" para productos digitales

### Sprint 2 — Blog técnico

Fase 1A: content collections
- Schema con zod (title, description, pubDate, category, slug, etc.)
- Listado `/blog` con filtro de drafts
- Post dinámico `/blog/[slug]` con prose styling
- BlogPreview en home conectado a getCollection

Fase 1B: blog 01 IESS publicado
- 3 imágenes optimizadas: hero (75 KB), fragmentos (135 KB),
  decision-pendiente (47 KB), todas con srcset multi-width
- heroImage en frontmatter usando helper `image()` de Astro
- og:image apuntando a la hero
- Card thumbnail en home y `/blog`

### Sprint 4 — SEO técnico

- sitemap.xml automático con priority y changefreq por tipo de página
- robots.txt con disallow de `/admin/`
- Meta tags Open Graph y Twitter Cards completos
- Schema.org Person en todas las páginas
- Schema.org Article en posts del blog
- RSS feed en `/rss.xml`
- og-default.jpg para páginas sin hero específica
- Lighthouse SEO target 100

## Pendientes para próximas sesiones

### Crítico para deploy a producción

1. Rotar `VITE_SUPABASE_SERVICE_ROLE_KEY` en Supabase (expuesta en bundle legacy durante meses, todavía válida)
2. Resolver bloqueo de Vercel (proyecto está en team Hobby plan que bloquea autores nuevos). Decisión: transferir a cuenta personal o crear proyecto Vercel nuevo.
3. Apuntar `franciscoabad.com` al deploy nuevo de Astro.

### Sprint 3 — Backend de formularios (próxima sesión)

1. Resend: verificar dominio + API key + endpoint `/api/contact`
2. Beehiiv: verificar dominio + Publication ID + API key + endpoint `/api/newsletter`
3. Quiz `/growth-lab`: migrar como island React con endpoint `/api/quiz-lead` que escribe a Supabase y a Beehiiv

### Contenido pendiente

1. Blog 02 (CODEIS): Pancho dictando respuestas en preguntas_6_blogs.docx
2. Blog 04 (Antes de comprar IA): mismo doc, preguntas 4.1-4.6
3. Blogs 03, 05, 06: cuando los anteriores estén publicados
4. Imágenes hero para blogs 02 y 04 (prompts en chat de Claude)

### Mejoras técnicas no críticas

1. Bilingüismo ES/EN con i18n (sesión dedicada futura)
2. `/growth-os` landing page cuando Lemon Squeezy esté configurado
3. Borrar wrappers shadcn/ui no usados y las 7 deps que sostienen (recharts, day-picker, embla-carousel, vaul, cmdk, input-otp, resizable-panels)
4. n8n self-hosting en VPS Hetzner para automatizaciones

## Bloqueadores externos resueltos vs activos

Resueltos:
- Email principal unificado a `francisco@franciscoabad.com`
- URLs sociales reales (LinkedIn, Instagram, YouTube)
- Tabla `quiz_leads` creada en Supabase

Activos:
- Service role key expuesta (rotación pendiente esta semana)
- Vercel team plan bloquea autor del commit
- Resend dominio sin verificar
- Beehiiv dominio sin verificar y Publication ID hardcoded vacío
