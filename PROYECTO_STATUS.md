# franciscoabad.com — Estado del Proyecto
Última actualización: 29 marzo 2026

---

## SITIO PÚBLICO — Estado: EN PRODUCCIÓN

URL: franciscoabad.vercel.app
Dominio propio franciscoabad.com: DNS configurado en Namecheap, apuntar a Vercel pendiente.

### Páginas activas:
- `/` (Home)
- `/sobre-mi`
- `/trabaja-conmigo`
- `/blog` ("Dentro del Sistema")
- `/contacto`
- `/growth-lab` (quiz funnel de diagnóstico)

### Secciones completas (Home):
1. Navbar con logo `fa_stacked_tagline_ember_3x.png`
2. Hero: "Diseño sistemas para que personas y organizaciones funcionen mejor"
3. Logos institucionales (Trayectoria) en fondo Linen con 3 grupos, logos en color, links activos
4. Problem Statement con emojis y pain points rediseñados
5. Stats: $10B+, 32,000, 15 países, 12,000+
6. Services: Growth OS, Advisory, Speaking
7. 9 Testimonios con fotos reales y links a LinkedIn
8. Resources: Tu Semana de Reset (gratis), Growth OS ($47)
9. BlogPreview
10. Newsletter "The Growth Lab"
11. Footer con logo ember y links sociales

---

## PRODUCTO DIGITAL — Estado: DEFINIDO, NO PUBLICADO

Nombre: Growth OS
Precio: $47 (Core), $67 (+ Claude Skill)
Lead magnet: "Tu Semana de Reset" (gratis)
Landing page `/growth-os`: PENDIENTE DE CONSTRUIR
Archivos del producto: terminados en otro chat
Lemon Squeezy: cuenta creada, sin productos configurados

---

## BLOG "Dentro del Sistema" — Estado: LISTO

Primer artículo: 14 de abril 2026
6 artículos planificados (abril-junio 2026)
Categorías: Systems Thinking, Founder Systems, Liderazgo
CMS: Supabase con editor Tiptap en `/admin`

---

## ADMIN DASHBOARD — Estado: FUNCIONAL

Ruta: `/admin` (protegida con Supabase Auth)
Secciones activas: Overview, Oportunidades (pipeline + pagos), Blog Editor (Tiptap completo)
Placeholders: Instagram, LinkedIn, YouTube, Lemon Squeezy, Cal.com

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

1. Terminar DNS de Zoho (SPF fusionado + DKIM)
2. Resend: verificar dominio + API key + conectar formulario de contacto
3. Beehiiv: verificar dominio + Publication ID + conectar newsletter del sitio
4. Landing `/growth-os` con copy completo del handoff
5. Apuntar `franciscoabad.com` a Vercel en Namecheap
6. Lemon Squeezy: configurar productos del Growth OS
7. Cal.com: 3 tipos de evento con pago requerido
8. Bilingüismo ES/EN con react-i18next

---

## NOTA CRÍTICA — ARCHIVOS EN WINDOWS/VERCEL

- Activar "Extensiones de nombre de archivo" en Windows Explorer para evitar dobles extensiones.
- Los archivos en `public/` son case-sensitive en Vercel (Linux). Respetar mayúsculas exactas en los paths del código (ej. `/Speaking/` con S mayúscula).
- SIEMPRE verificar con `git ls-files public/[archivo]` antes de asumir que un archivo está en el repo. Si no aparece: `git add + commit + push` antes de continuar.
