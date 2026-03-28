# Francisco Abad — Estado del Proyecto
Última actualización: 28 de marzo de 2026

---

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| UI framework | React | ^18.3.1 |
| Lenguaje | TypeScript | ^5.8.3 |
| Build tool | Vite | ^5.4.19 |
| Estilos | Tailwind CSS | ^3.4.17 |
| Componentes UI | shadcn/ui (Radix UI) | varios |
| Routing | react-router-dom | ^6.30.1 |
| Backend / DB | Supabase (@supabase/supabase-js) | ^2.99.3 |
| Data fetching | @tanstack/react-query | ^5.83.0 |
| Editor de texto | Tiptap (@tiptap/react + starter-kit) | ^3.21.0 |
| Gráficas | Recharts | ^2.15.4 |
| Formularios | react-hook-form + zod | ^7.61.1 / ^3.25.76 |
| Fechas | date-fns | ^3.6.0 |
| Iconos | lucide-react | ^0.462.0 |
| Hosting | Vercel | — |
| Automatizacion | n8n | pendiente de configurar |

---

## Sitio público — Estado actual

| Página | Ruta | Archivo | Estado |
|---|---|---|---|
| Home | `/` | `src/pages/Index.tsx` | Completa — hero, secciones, blog preview |
| Sobre mí | `/sobre-mi` | `src/pages/SobreMi.tsx` | Completa — 183 líneas con contenido real |
| Blog (listado) | `/blog` | `src/pages/Blog.tsx` | Completa — lee de Supabase, filtra por pillar |
| Blog (post) | `/blog/:slug` | `src/pages/BlogPost.tsx` | Completa — renderiza desde Supabase |
| Trabaja conmigo | `/trabaja-conmigo` | `src/pages/TrabajaConmigo.tsx` | Completa — 218 líneas con servicios y CTA |
| Contacto | `/contacto` | `src/pages/Contacto.tsx` | Completa — 157 líneas con formulario |
| 404 | `*` | `src/pages/NotFound.tsx` | Completa |

**Componentes del sitio público:**
- `Navbar.tsx` — navegación fija con logo SVG real, menú mobile
- `sections/Hero.tsx` — hero principal
- `sections/BlogPreview.tsx` — preview de posts recientes
- `sections/CredentialsBar.tsx` — barra de credenciales
- `sections/Footer.tsx` — footer con logo SVG real y redes sociales
- `sections/NewsletterCTA.tsx`, `ProblemStatement.tsx`, `Resources.tsx`, `Services.tsx`, `Stats.tsx`, `Testimonials.tsx`

---

## Admin Dashboard — Estado actual

| Sección | Ruta | Archivo | Estado |
|---|---|---|---|
| Login | `/admin/login` | `src/pages/admin/Login.tsx` | Completo — Supabase Auth, email/password |
| Overview | `/admin` | `src/pages/admin/Overview.tsx` | Completo — Morning Briefing + 4 stat cards |
| Oportunidades | `/admin/oportunidades` | `src/pages/admin/Oportunidades.tsx` | Completo — pipeline, tabla, slide-overs, pagos |
| Blog Editor | `/admin/blog` | `src/pages/admin/BlogEditor.tsx` | Completo — Tiptap, auto-save 30s, slug, status |
| Instagram | `/admin/instagram` | `src/pages/admin/Instagram.tsx` | Placeholder |
| LinkedIn | `/admin/linkedin` | `src/pages/admin/LinkedIn.tsx` | Placeholder |
| YouTube | `/admin/youtube` | `src/pages/admin/YouTube.tsx` | Placeholder |
| Lemon Squeezy | `/admin/ventas` | `src/pages/admin/Ventas.tsx` | Placeholder |
| Cal.com | `/admin/sesiones` | `src/pages/admin/Sesiones.tsx` | Placeholder |

**Infraestructura del dashboard:**
- `src/components/admin/ProtectedRoute.tsx` — guard con Supabase Auth, spinner de carga
- `src/components/admin/AdminLayout.tsx` — sidebar fijo, navegación con active state, logout
- `src/lib/supabase.ts` — cliente público (anon key) + cliente admin (service role)

---

## Base de datos Supabase

| Tabla | Descripción |
|---|---|
| `admin_config` | Key/value store para tokens de API y configuración general |
| `ig_daily_metrics` | Métricas diarias de Instagram por cuenta (followers, reach, impresiones) |
| `ig_post_metrics` | Performance por post: likes, saves, reach, engagement_rate |
| `li_daily_metrics` | Métricas diarias de LinkedIn (conexiones, vistas de perfil, impresiones) |
| `li_post_metrics` | Performance por post de LinkedIn: likes, comentarios, reposts, impresiones |
| `yt_daily_metrics` | Métricas diarias de YouTube (suscriptores, vistas, watch time) |
| `yt_video_metrics` | Performance por video: vistas, likes, watch time, CTR, duración promedio |
| `opportunities` | Pipeline de oportunidades con enum type (brand_deal/consulting/speaking) y status de 6 etapas |
| `opportunity_payments` | Pagos vinculados a oportunidades con status (pending/received/overdue) |
| `ls_products` | Catálogo de productos de Lemon Squeezy |
| `ls_sales` | Órdenes de Lemon Squeezy alimentadas por webhooks |
| `cal_bookings` | Reservas de Cal.com alimentadas por webhooks |
| `blog_posts` | Posts con cuerpo en Tiptap JSON y HTML, enum status (draft/published/archived), RLS doble |
| `morning_briefings` | Briefings diarios generados por Claude API, uno por fecha |

Migración: `supabase/migrations/20260328000000_initial_schema.sql`
RLS activo en todas las tablas. `blog_posts` tiene política pública que expone solo posts `published` a usuarios anónimos.

---

## Pendiente — Sitio público

<!-- completar después de revisar cada página -->

---

## Pendiente — Dashboard

- Secciones Instagram, LinkedIn, YouTube: construir UI (tablas vacías esperando datos de n8n)
- Lemon Squeezy: construir UI + configurar webhooks
- Cal.com: construir UI + configurar webhooks
- Morning Briefing: configurar workflow n8n + Claude API
- n8n workflows: Instagram Graph API, LinkedIn API, YouTube Data API, Lemon Squeezy webhook, Cal.com webhook, Morning Briefing con Claude API

---

## Prompts listos para continuar

### Para construir Instagram + LinkedIn + YouTube de una vez
<!-- pendiente -->

### Para configurar el Morning Briefing con Claude API
<!-- pendiente -->

---

## Variables de entorno necesarias

| Variable | Descripción | Estado |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Configurada |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (safe para el browser, respeta RLS) | Configurada |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (bypassa RLS, solo usar server-side o en admin autenticado) | Configurada |
| `VITE_IG_ACCESS_TOKEN` | Token de acceso a Instagram Graph API | Pendiente |
| `VITE_LI_ACCESS_TOKEN` | Token de acceso a LinkedIn API | Pendiente |
| `VITE_YT_API_KEY` | Clave de YouTube Data API v3 | Pendiente |
| `VITE_LS_WEBHOOK_SECRET` | Secret para validar webhooks de Lemon Squeezy | Pendiente |
| `VITE_CAL_WEBHOOK_SECRET` | Secret para validar webhooks de Cal.com | Pendiente |
| `ANTHROPIC_API_KEY` | API key de Anthropic para generar Morning Briefings (usar en n8n, no en el browser) | Pendiente |
