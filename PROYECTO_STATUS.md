# Francisco Abad — Estado del Proyecto
Última actualización: 29 de marzo de 2026

---

## Completado (sesión 29 de marzo)

- 9 testimonios reales con fotos y links a LinkedIn (Julio Clavijo, Enrique Crespo, Gabriela Tulcanazo, Álvaro Maldonado, Sofía Fernández, Carlos Cárdenas, Lilyán Yepez, Brandon Peñaherrera, Jaime Guzmán)
- Sección de logos institucionales con 3 grupos (Formación, Aliados y Programas, Speaker y Docente), fondo Linen #F4EDE6, logos en color completo, links activos, alineación flex-end por base inferior, heights individuales por logo
- Timeline en Sobre Mí con 9 entradas y contexto real (IESS, YLAI, CODEIS, Georgetown, LSE, OYW, ETBU, Youth Ambassador)
- Footer con solo "ABAD" centrado, blanco, peso 900
- Newsletter renombrada a "The Growth Lab"
- CredentialsBar duplicada eliminada de Index.tsx
- Foto de Sobre Mí diferente a la del hero (francisco-abad-about.jpg)
- Banner de speaking cinematográfico en Trabaja Conmigo con overlay y filtro
- Corrección de paths con dobles extensiones en Windows (ej. speaking-banner.jpg.png)
- Sitio funcionando en franciscoabad.vercel.app
- vercel.json con rewrite SPA para routing correcto
- Supabase init defensivo (no crashea si faltan env vars)
- lovable-tagger eliminado del build de producción

---

## Pendiente inmediato (próxima sesión)

- Conectar formulario de contacto con Resend
- Configurar newsletter The Growth Lab con Beehiiv o similar
- Producto digital en Lemon Squeezy (nombre y descripción pendiente de Pancho)
- Dominio franciscoabad.com apuntar a Vercel
- Logo LSE: conseguir versión sin fondo blanco (archivo actual tiene fondo, mix-blend-mode es workaround)

---

## Pendiente Dashboard

- Secciones Instagram, LinkedIn, YouTube: UI lista como placeholder, sin datos hasta conectar n8n
- Webhooks Lemon Squeezy y Cal.com
- Morning Briefing con Claude API
- n8n self-hosted en VPS (Hetzner pendiente)

---

## Stack técnico

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
| Iconos | lucide-react | ^0.462.0 |
| Package manager | Bun | — |
| Hosting | Vercel (deploy automático desde main) | — |
| Automatización | n8n | pendiente de configurar |

**Puerto local:** 8080 (`bun run dev`)

---

## Variables de entorno

| Variable | Descripción | Estado |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Configurada en Vercel y .env.local |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (respeta RLS) | Configurada en Vercel y .env.local |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin, bypasa RLS) | Configurada en Vercel y .env.local |
| `VITE_IG_ACCESS_TOKEN` | Instagram Graph API | Pendiente |
| `VITE_LI_ACCESS_TOKEN` | LinkedIn API | Pendiente |
| `VITE_YT_API_KEY` | YouTube Data API v3 | Pendiente |
| `VITE_LS_WEBHOOK_SECRET` | Lemon Squeezy webhook | Pendiente |
| `VITE_CAL_WEBHOOK_SECRET` | Cal.com webhook | Pendiente |
| `ANTHROPIC_API_KEY` | Claude API para Morning Briefing (usar en n8n, no en browser) | Pendiente |

---

## Nota Windows

- Activar "Extensiones de nombre de archivo" en el Explorador para evitar dobles extensiones (ej. foto.jpg guardada como foto.jpg.jpeg)
- Los archivos en `public/` son case-sensitive en Vercel (Linux): respetar mayúsculas exactas en los paths del código (ej. `/Speaking/` con S mayúscula)

---

## Sitio público — Páginas

| Página | Ruta | Archivo | Estado |
|---|---|---|---|
| Home | `/` | `src/pages/Index.tsx` | Completa |
| Sobre mí | `/sobre-mi` | `src/pages/SobreMi.tsx` | Completa |
| Blog (listado) | `/blog` | `src/pages/Blog.tsx` | Completa |
| Blog (post) | `/blog/:slug` | `src/pages/BlogPost.tsx` | Completa |
| Trabaja conmigo | `/trabaja-conmigo` | `src/pages/TrabajaConmigo.tsx` | Completa |
| Contacto | `/contacto` | `src/pages/Contacto.tsx` | Completa (formulario sin backend) |
| 404 | `*` | `src/pages/NotFound.tsx` | Completa |

**Secciones del home (en orden):**
1. Navbar
2. Hero
3. LogosInstitucionales (fondo Linen)
4. ProblemStatement
5. Stats
6. Services
7. Testimonials (9 reales)
8. Resources
9. BlogPreview
10. NewsletterCTA (The Growth Lab)
11. Footer

---

## Admin Dashboard — Páginas

| Sección | Ruta | Estado |
|---|---|---|
| Login | `/admin/login` | Completo — Supabase Auth |
| Overview | `/admin` | Completo — Morning Briefing + stat cards |
| Oportunidades | `/admin/oportunidades` | Completo — pipeline, pagos |
| Blog Editor | `/admin/blog` | Completo — Tiptap, auto-save |
| Instagram | `/admin/instagram` | Placeholder |
| LinkedIn | `/admin/linkedin` | Placeholder |
| YouTube | `/admin/youtube` | Placeholder |
| Lemon Squeezy | `/admin/ventas` | Placeholder |
| Cal.com | `/admin/sesiones` | Placeholder |

---

## Base de datos Supabase

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

Migración: `supabase/migrations/20260328000000_initial_schema.sql`
RLS activo en todas las tablas.
