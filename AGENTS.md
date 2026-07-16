# AGENTS.md - Instrucciones para agentes de código (Codex y otros)

Este archivo es el equivalente a `CLAUDE.md` para agentes distintos de Claude Code.
Mantener ambos en paridad: si cambias uno, refleja el cambio en el otro.

## Quién soy

Francisco Abad (Pancho), founder ecuatoriano. Marca personal centrada en
"vuelvo alcanzable lo imposible". Sitio: franciscoabad.com

Empresas activas públicamente: BrainTech (AI-native, lidera), CODEIS (ONG, board president).
NO mencionar en material público: Kronek (disuelto), Fulcra (plegada en BrainTech).

## Cómo trabajamos

- Yo dirijo la estrategia. El agente ejecuta: implementa, no propone sin necesidad.
- Si la tarea es clara, hazla. Si hay ambigüedad grande, una sola pregunta antes de ejecutar.
- Siempre leer archivos relevantes ANTES de escribir cualquier cosa.
- Sin em dashes (`-`) en ningún copy, respuesta ni documento. Sin excepciones.
- Sin anglicismos innecesarios en español.
- Tono: práctico, directo, ejecutivo.
- Al terminar cualquier tarea: commit + push a `main` SIN Co-Authored-By (Vercel lo bloquea).

## Regla crítica de commits

NUNCA agregar `Co-Authored-By: ...` en los commits de este repo.
Vercel Hobby bloquea deploys cuando detecta autores sin acceso al proyecto.
Formato de commit: `tipo: descripción breve en inglés`
Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`

## Stack

- Legacy (raíz): React + TypeScript + Tailwind + Vite + Supabase + Vercel (no tocar)
- Nuevo (apps/web/): Astro 6 + Tailwind v4 + React islands + Content Collections + Vercel
- npm en apps/web/. Puerto local Astro: 4321 (puede escalar a 4325+ si hay conflicto).
- Supabase proyecto: `yfrrfmankgodpepbgyvu` (franciscoabad)

## Vercel — estado actual

- Repo GitHub: público (`franciscoabad-founder/franciscoabad`)
- Proyecto en Vercel bajo equipo `franciscoabad-founders-projects`
- Deploy activo y funcionando en franciscoabad.com
- Root Directory en Vercel: `apps/web` (crítico: si se pierde, el deploy da 404)
- `vercel.json` en raíz: solo contiene `{ "$schema": "..." }` — no agregar config aquí,
  el adaptador `@astrojs/vercel` maneja todo desde `astro.config.mjs`
- Output mode: `"static"` con adaptador Vercel (Astro 6 eliminó `"hybrid"`;
  `"static"` + `prerender = false` en endpoints = Vercel Functions)

## OS interno (franciscoabad.com/os)

Aplicación interna de productividad y salud/fitness de Pancho. Módulos: Hoy, Sistema,
Cerebro, Agenda, Finanzas, Salud, GFIT (entrenamiento), Hábitos, Juego (gamificación),
CRM, Redes, Journeys.

### Tema y diseño — Claymorfismo marca-claro/oscuro (Oleada 1, julio 2026)

- El OS usa claymorfismo suave con la paleta Ultramarine. Default **marca-claro**; toggle a
  oscuro en el header (mismo mecanismo del sitio público).
- Tokens `--os-*` en `apps/web/src/styles/os.css`: valores claros en `:root` +
  overrides en `[data-theme="dark"]`. No-flash script en la primera línea del `<head>`
  de `OSLayout.astro` (key localStorage `os-theme`, default siempre `light`).
- Regla de color dura: **CERO verde**. Hecho/completado/positivo = Champagne
  (`var(--os-champagne)`). Acción/acento/CTA = Ultramarine `#3B4ED9` (`var(--os-accent)`).
  Danger suave `#D4537E`. `--os-ok` está mapeado a champagne, no a verde.
- Fuente redondeada para titulares del OS: Nunito (`var(--os-font-rounded)`).

### Molde A (patrón de datos y endpoints del OS)

- Endpoints en `apps/web/src/pages/api/os/**` con `prerender = false`, autorización por
  `isOsAuthorized` (cookie de sesión o header `X-OS-Token`), helper `json()`, 502 en error,
  acceso a Supabase vía `service_role`.
- Migraciones: RLS habilitado SIN políticas + `grant all ... to service_role` +
  `notify pgrst, 'reload schema'` al final. Acceso solo vía endpoints con service_role.

### GFIT — módulo de entrenamiento (paridad Jefit)

- Unidad canónica en DB = **kg** (`KG_POR_LB = 0.45359237`); display convertible `'kg'|'lb'`
  (singular, por el check de `salud_config.unidad_peso`). Nunca mezclar unidades en el histórico.
- Catálogo `ejercicios_catalogo` (873 filas, seed desde free-exercise-db, Unlicense).
  Taxonomía `gfit_taxonomia` (135 filas: equipo, patrones, músculos con sub-músculos).
- 1RM: Epley default (promedia con Brzycki si reps ≤ 6). Progresión: doble progresión +2.5-5%.
  Muscle recovery con modelo basado en MEV (Israetel/RP). Ver `apps/web/src/lib/gfit/`.
- Logros `gfit_logros` (12, con behavioral science) → evento `logro` al ledger `xp_events`.

### Nutrición (paridad Yazio)

- Targets de macros configurables en `salud_config` (kcal/proteína/carbos/grasa objetivo).
- Alimentos con micros + porciones (`alimento_porciones`), recientes/frecuentes/favoritos.
- Recetas `recetas` (243) + `receta_ingredientes` (2450), meals `nutricion_meals`.
- Foto de comida por IA multimodal: endpoint → n8n/Hermes (contrato en
  `apps/web/docs/contrato-foto-comida.md`), editable antes de guardar, nunca auto-log.
- Ayuno SIEMPRE manual (jamás auto-cerrar). Protocolos en `salud_config.protocolo_ayuno_default`
  (`16_8`|`24h`|`36h`|`custom`) + `ayuno_objetivo_h`.
- Coach de insights: endpoint `/api/os/salud/insights` (contrato en
  `apps/web/docs/contrato-insights-coach.md`), consumido por cron n8n que avisa por Telegram.

### Onboarding (framework genérico, estilo Yazio)

- `onboarding_estado` (una fila por módulo: `paso`, `respuestas` jsonb, `completado_at`).
- Framework en `apps/web/src/os/components/onboarding/` (OSOnboardingFlow + flujos por módulo).
  Oleada 1: flujo de Salud completo. Oleada 2 pendiente: Finanzas y resto de módulos.

### Integraciones (plan)

- Plan completo en `apps/web/docs/plan-integraciones-apis.md`: Fitbit (biométricas) y redes
  sociales (Meta primero, luego YouTube/LinkedIn/TikTok/X). Credenciales viven en n8n, nunca
  en el repo ni en Vercel.

## Estado del sitio público Astro (apps/web/)

### Páginas activas

- `/` Home: Hero (DS v2), ProblemStatement, Services, Testimonials, Resources, LogosInstitucionales, NewsletterCTA, BlogPreview
- `/sobre-mi` Sobre Mí
- `/trabaja-conmigo` Trabaja Conmigo (3 áreas sin precio, 5 temas de speaking)
- `/contacto` Contacto
- `/blog` Listado de posts
- `/blog/[slug]` Post dinámico
- `/kit` Landing lead magnet Kit IA para tus finanzas (formulario conectado a /api/kit-signup)
- `/kit/gracias` Thank-you page post-formulario
- `/api/kit-signup` Endpoint POST (Vercel Function): recibe nombre+email, envía kit por Resend

### Blog — posts

- `blog_01_iess.mdx` — "El AS400 y por qué el 78% no cuenta toda la historia" (`draft: true`, no publicar aún)
- `blog_02_kit_finanzas.mdx` — "Cómo organizar tus finanzas con IA sin perder el control" (`draft: false`, publicado)
  - heroImage: `blog02-grupo-v2.jpg` (grupo taller CCQ)
  - Foto inline en cuerpo: `blog02-hero.jpg`
  - Category: "Finanzas"

### Categorías de blog válidas (content.config.ts enum)

`"Systems Thinking"` | `"Founder Systems"` | `"Liderazgo"` | `"Finanzas"`

### Producto digital activo

- **Kit IA para tus finanzas** (publicado, lanzado en redes)
- Formulario en `/kit` llama a `POST /api/kit-signup` con fetch (nombre + email)
- El endpoint envía el ZIP por Resend desde `francisco@franciscoabad.com`
- ZIP en Supabase Storage: bucket `kit-descargable-finanzas`, objeto `Kit_IA_para_tus_finanzas_v1.1.zip` (bucket público)
- URL de descarga en `KIT_DOWNLOAD_URL` (variable de entorno en Vercel y en apps/web/.env)
- `TODO`: conectar Beehiiv en el endpoint para suscribir al newsletter en el mismo paso

### Variables de entorno necesarias (en Vercel Production)

- `RESEND_API_KEY` — API key de Resend
- `KIT_DOWNLOAD_URL` — URL pública del ZIP en Supabase Storage

## Logos y brand — Ultramarine v5

Archivos en `apps/web/public/`:
- `fa_logo_whitemono.svg` — navbar dark mode y footer (siempre dark)
- `fa_logo_light.svg` — navbar light mode
- `fa_logo_dark.svg` — disponible pero no en uso activo
- `favicon.svg` + `favicon.png` — isotype accent (ultramarine)

Lógica en Navbar.astro: CSS `[data-theme="light"]` muestra `logo-light`, oculta `logo-dark`.
Footer siempre usa `fa_logo_whitemono.svg` (fondo charcoal #1A1A1A siempre oscuro).

Lee siempre _design-system/SKILL.md y _design-system/readme.md
antes de diseñar o escribir cualquier cosa para esta marca.

## Fonts Gotham

Los fonts Gotham están en `_design-system/assets/fonts/` localmente pero no están en el
repo (licencia comercial, en .gitignore). En producción el fallback es Montserrat (Google Fonts).

## Redes sociales (Footer.astro)

- LinkedIn: `https://www.linkedin.com/in/franciscoabadec/`
- Instagram: `https://www.instagram.com/franciscoabadec/`
- Email: `mailto:francisco@franciscoabad.com`
- YouTube: eliminado

## Paleta de colores — Ultramarine v5

Sistema dual dark/light mode. Primitivos en `:root`, semánticos en `[data-theme]`.

| Token | Hex | Uso |
|---|---|---|
| Ink | `#0E1738` | Fondo dark primario |
| Royal | `#1A2B6B` | Cards dark, texto sobre claro |
| Ultramarine | `#3B4ED9` | Acento principal, CTAs, links |
| Ultra-light | `#6B7AE8` | Hover/visibilidad sobre fondos dark |
| Champagne | `#B5985A` | SOLO métricas, KPIs, credenciales, y "hecho/completado" en el OS |
| Bronze | `#8A6F3D` | Hover de Champagne |
| Linen | `#FAFAF7` | Fondo light mode |
| Slate-light | `#E8EAF0` | Bordes y divisores claros |
| Slate-mid | `#6B7280` | Texto secundario, captions |
| Slate-dark | `#2D3748` | Texto primario sobre fondos claros |
| Charcoal | `#1A1A1A` | Footer oscuro |

Aliases: `--ember` = `--ultramarine`, `--sienna` = `--royal`.
`bg-bg-elevated`: dark `#131F4A`, light `#FFFFFF`.

Regla champagne: EXCLUSIVO para métricas numéricas, KPIs, credenciales académicas y estados
"hecho/completado" en el OS. NO usar en CTAs ni como acento general (eso es `--ember`).

Eyebrows y labels sobre fondos dark: usar `text-ultra-light` (#6B7AE8), NO `text-ember`.

## Decisiones editoriales del blog

- Voz: ejecutiva, directa, sin guru, sin académico. Primera persona activa.
- Sin em dashes en ningún copy
- Sin nombres específicos en blogs sobre el IESS (no mencionar Lama, Cordovez, Gellibert, Healthbird)
- Sin atacar al gobierno actual
- Bio estándar de cierre: "Francisco Abad fue Director General del IESS de junio a
  diciembre de 2025. Hoy lidera BrainTech, firma AI-native de transformación de negocios,
  y preside el directorio de CODEIS. Escribe sobre lo que se ve cuando diriges
  instituciones desde adentro."

## Regla de oro de archivos

Antes de referenciar cualquier archivo de `public/` o de `content/blog/`, verificar:

```bash
git ls-files apps/web/public/[nombre]
git ls-files apps/web/src/content/blog/[nombre]
```

Si no aparece: `git add + commit + push` antes de continuar.

Para imágenes en content collections (MDX heroImage): usar siempre nombre de archivo
nuevo cuando se reemplaza una imagen. Astro cachea por hash; mismo nombre = cache stale.

## Nota de desarrollo local (dev server)

En `npm run dev` puede aparecer "Invalid hook call" en las islas React (chunks de Vite
mezclados / copias duplicadas de React). Es artefacto de dev, NO de producción (el build de
Vercel hidrata bien). Si bloquea, borrar `apps/web/node_modules/.vite` y `apps/web/.astro`
y reiniciar el server.

## VPS Automations - pancho-automations-01

Servidor dedicado separado del sitio web. NO tiene relación con Vercel ni con franciscoabad.com.

- IP: `178.105.163.120`
- OS: Ubuntu 26.04 LTS, 2 vCPU, 3.7 GB RAM, 2 GB swap en `/swapfile`
- Acceso: SSH con llave a `root@178.105.163.120`

### Servicios corriendo

| Servicio | Contenedor / proceso | Acceso interno | Acceso público |
|---|---|---|---|
| n8n | `n8n-n8n-1` (Docker) | puerto 5678 | `https://n8n.franciscoabad.com` |
| Caddy | `n8n-caddy-1` (Docker) | puertos 80/443 | proxy para n8n y gbrain |
| gbrain MCP server | systemd `gbrain.service` | `172.18.0.1:3131` | `https://brain.franciscoabad.com` |
| Postgres + pgvector | `gbrain-postgres` (Docker) | `127.0.0.1:5432` | cerrado al exterior |
| Evolution API (WhatsApp) | `evolution_api` + `evolution_postgres` + `evolution_redis` (Docker) | `127.0.0.1:8080` | cerrado al exterior |
| Hermes gateway | systemd `hermes-gateway.service` | local | no expuesto |
| Hermes approval | systemd `hermes-approval.service` | local | no expuesto |
| Cortex bridge (OS-Hermes) | systemd `cortex-bridge.service`, código en `/root/cortex/` | local | no expuesto |

### Archivos de config clave en el VPS

- Caddyfile: `/opt/n8n/Caddyfile` (NO tocar bloques de n8n)
- gbrain env: `/root/gbrain.env` (ZEROENTROPY_API_KEY, GBRAIN_ADMIN_TOKEN)
- Postgres env: `/opt/gbrain-db/.env` (POSTGRES_PASSWORD)
- Postgres data: `/opt/gbrain-db/data/`
- gbrain systemd: `/etc/systemd/system/gbrain.service`

### gbrain - estado

- Versión: `0.42.52.0`, instalado en el host vía Bun (`/root/.bun/bin/gbrain`)
- Backend: Postgres local con pgvector, schema v119, todas las migraciones completas
- Search mode: `conservative`. Embeddings: ZeroEntropy (`zembed-1`, 1280 dims)
- MCP endpoint: `https://brain.franciscoabad.com/mcp`
- Admin dashboard: `https://brain.franciscoabad.com/admin`
- Admin token guardado en `/root/gbrain.env` como `GBRAIN_ADMIN_TOKEN`

### Red Docker

- Red: `n8n_n8n_net`. Gateway (IP del host desde contenedores): `172.18.0.1`
- gbrain bindeado a `172.18.0.1:3131` (no en interfaz pública)
- UFW permite `172.18.0.0/16 → 3131/tcp` para que Caddy alcance gbrain
- Puerto 3131 cerrado al exterior

### Regla de seguridad VPS

NUNCA exponer puertos de Postgres (5432) ni gbrain (3131) en la interfaz pública.
NUNCA tocar `/opt/n8n/Caddyfile` sin verificar primero que n8n sigue respondiendo.
Antes de cualquier cambio en Caddy: `docker exec n8n-caddy-1 caddy validate --config /etc/caddy/Caddyfile`

## Rutas del proyecto

Repo: `C:\DEV\franciscoabad`

- `/` (raíz) - código legacy Vite/React (no tocar)
- `/apps/web/` - sitio Astro, target de producción
- `/apps/web/src/content/blog/` - posts MDX + imágenes colocadas
- `/apps/web/src/content.config.ts` - schema de content collections
- `/apps/web/public/` - assets estáticos
- `/apps/web/src/i18n/` - traducciones es.json + en.json
- `/apps/web/src/pages/api/` - endpoints serverless (Vercel Functions)
- `/apps/web/src/pages/api/os/` - endpoints del OS interno (Molde A)
- `/apps/web/src/os/` - componentes e islas del OS
- `/apps/web/src/lib/gfit/` - lógica pura de GFIT (unidades, 1RM, recovery, progresión, logros)
- `/apps/web/docs/` - contratos y planes (foto-comida, insights-coach, integraciones)
- `/_design-system/` - design system Ultramarine v5 (no deployar, solo referencia local)
- `/supabase/migrations/` - migraciones SQL
