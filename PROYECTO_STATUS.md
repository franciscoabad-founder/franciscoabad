# franciscoabad.com — Estado del Proyecto
Última actualización: 3 mayo 2026

---

## SITIO PÚBLICO — Estado: MIGRACIÓN A ASTRO EN CURSO

URL legacy: franciscoabad.vercel.app (deploy bloqueado por team plan, ver `MIGRATION_LOG.md`)
URL Astro: localhost:4321 (no deployado todavía)
Dominio franciscoabad.com: DNS configurado, sin apuntar todavía.

Páginas migradas a Astro: `/`, `/sobre-mi`, `/trabaja-conmigo`, `/contacto`, `/blog`, `/blog/[slug]`
Páginas pendientes: `/growth-lab` (quiz), `/growth-os` (producto)

### Secciones completas (Home Astro):
1. Navbar con logo `fa_stacked_tagline_ember_3x.png` (island)
2. Hero: "Diseño sistemas para que personas y organizaciones funcionen mejor" (WebP optimizada)
3. Logos institucionales (Trayectoria) en fondo Linen con 3 grupos, links activos
4. Problem Statement con emojis y pain points
5. Stats island con countup: $10B+, 32,000, 15 países, 12,000+
6. Services: Growth OS, Advisory, Speaking (CTAs "Próximamente" en productos digitales)
7. 9 Testimonios con fotos optimizadas y links a LinkedIn
8. Resources: Tu Semana de Reset (gratis), Growth OS ($47)
9. BlogPreview conectado a posts reales del content collection
10. Newsletter "The Growth Lab" (UI lista, sin backend)
11. Footer con logo ember y links sociales reales

---

## PRODUCTO DIGITAL — Estado: DEFINIDO, NO PUBLICADO

Nombre: Growth OS
Precio: $47 (Core), $67 (+ Claude Skill)
Lead magnet: "Tu Semana de Reset" (gratis)
Landing page `/growth-os`: PENDIENTE DE CONSTRUIR
Archivos del producto: terminados en otro chat
Lemon Squeezy: cuenta creada, sin productos configurados

---

## BLOG "Dentro del Sistema" — Estado: 1 ARTÍCULO PUBLICADO EN LOCAL

Primer artículo: `blog_01_iess.mdx` ("El AS400, los 102 sistemas y por qué el 78% no cuenta toda la historia") — 2,326 palabras, 3 imágenes optimizadas, listo para deploy.
Categorías activas: Systems Thinking, Founder Systems, Liderazgo
CMS: Markdown content collections en `apps/web/src/content/blog/` (reemplaza el setup Supabase + Tiptap del legacy admin)

Pendientes:
- Blog 02 (CODEIS) — Pancho dictando
- Blog 04 (Antes de IA) — Pancho dictando
- Blogs 03, 05, 06 — más adelante

---

## ADMIN DASHBOARD — Estado: APAGADO (Sprint 0)

Código preservado en `src/pages/admin/` del legacy. Rutas comentadas en `src/App.tsx`. Reconstrucción futura post-migración con SSR.

---

## SUPABASE SCHEMA — 15 TABLAS

| Tabla | Descripción |
|---|---|
| `admin_config` | Key/value para tokens y configuración |
| `ig_daily_metrics` | Métricas diarias Instagram |
| `ig_post_metrics` | Performance por post Instagram |
| `li_daily_metrics` | Métricas diarias LinkedIn |
| `li_post_metrics` | Performance por post LinkedIn |
| `yt_daily_metrics` | Métricas diarias YouTube |
| `yt_video_metrics` | Performance por video YouTube |
| `opportunities` | Pipeline con type y status de 6 etapas |
| `opportunity_payments` | Pagos vinculados a oportunidades |
| `ls_products` | Catálogo Lemon Squeezy |
| `ls_sales` | Órdenes Lemon Squeezy (webhooks) |
| `cal_bookings` | Reservas Cal.com (webhooks) |
| `blog_posts` | Posts con Tiptap JSON, status enum, RLS doble |
| `morning_briefings` | Briefings diarios generados por Claude API |
| `quiz_leads` | Leads del quiz /growth-lab (email + diagnosis + answers) |

Migración: `supabase/migrations/20260328000000_initial_schema.sql`
RLS activo en todas las tablas.

---

## SERVICIOS EXTERNOS — Estado actual

| Servicio | Estado |
|---|---|
| **Zoho Mail** | SUSCRITO (plan Mail Lite $1.25/mes). MX records en Namecheap activos. SPF: necesita valor fusionado (conflicto con SPF existente). DKIM: pendiente. En proceso de verificación. |
| **Resend** | Cuenta creada, dominio sin verificar, API key sin generar |
| **Beehiiv** | Cuenta creada "The Growth Lab", trial Max activo (14 días), dominio sin verificar, PUBLICATION_ID pendiente en GrowthLab.tsx |
| **Lemon Squeezy** | Cuenta creada, sin productos configurados |
| **Cal.com** | Cuenta creada, sin eventos configurados |
| **n8n** | Pendiente self-hosting en VPS |
| **Hetzner VPS** | Pendiente de crear |

---

## STACK TÉCNICO

| Capa | Tecnología |
|---|---|
| UI framework | React + TypeScript |
| Build tool | Vite |
| Estilos | Tailwind CSS |
| Routing | react-router-dom |
| Backend / DB | Supabase |
| SEO | react-helmet-async |
| Editor de texto | Tiptap |
| Gráficas | Recharts |
| Package manager | Bun (`bun run dev`, puerto 8080) |
| Hosting | Vercel (deploy automático desde GitHub main) |
| Automatización | n8n (pendiente) |

### Variables de entorno

| Variable | Estado |
|---|---|
| `VITE_SUPABASE_URL` | Configurada en Vercel y .env.local |
| `VITE_SUPABASE_ANON_KEY` | Configurada en Vercel y .env.local |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Configurada en Vercel y .env.local |
| `RESEND_API_KEY` | Pendiente |
| `VITE_BEEHIIV_PUBLICATION_ID` | Pendiente (hardcoded vacío en GrowthLab.tsx) |
| `VITE_IG_ACCESS_TOKEN` | Pendiente |
| `VITE_LI_ACCESS_TOKEN` | Pendiente |
| `VITE_YT_API_KEY` | Pendiente |
| `VITE_LS_WEBHOOK_SECRET` | Pendiente |
| `VITE_CAL_WEBHOOK_SECRET` | Pendiente |
| `ANTHROPIC_API_KEY` | Pendiente (usar en n8n, no en browser) |

---

## PENDIENTES CRÍTICOS (orden de prioridad)

1. Rotar service role key de Supabase (esta semana)
2. Resolver bloqueo Vercel (transferir proyecto o crear nuevo)
3. Sprint 3: Resend + Beehiiv + quiz endpoints
4. Pancho: dictar respuestas blogs 02 y 04
5. Imágenes hero para blogs 02 y 04
6. Apuntar `franciscoabad.com` al deploy nuevo
7. Bilingüismo ES/EN (sesión dedicada futura)

---

## NOTA CRÍTICA — ARCHIVOS EN WINDOWS/VERCEL

- Activar "Extensiones de nombre de archivo" en Windows Explorer para evitar dobles extensiones.
- Los archivos en `public/` son case-sensitive en Vercel (Linux). Respetar mayúsculas exactas en los paths del código (ej. `/Speaking/` con S mayúscula).
- SIEMPRE verificar con `git ls-files public/[archivo]` antes de asumir que un archivo está en el repo. Si no aparece: `git add + commit + push` antes de continuar.
