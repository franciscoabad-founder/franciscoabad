# CLAUDE.md — Instrucciones para Claude Code

## Quién soy

Francisco Abad (Pancho), founder ecuatoriano. Marca personal centrada en
"vuelvo alcanzable lo imposible". Sitio: franciscoabad.com

Empresas activas públicamente: BrainTech (AI-native, lidera), CODEIS (ONG, board president).
NO mencionar en material público: Kronek (disuelto), Fulcra (plegada en BrainTech).

## Cómo trabajamos

- Yo dirijo la estrategia. Claude Code ejecuta: implementa, no propone sin necesidad.
- Si la tarea es clara, hazla. Si hay ambigüedad grande, una sola pregunta antes de ejecutar.
- Siempre leer archivos relevantes ANTES de escribir cualquier cosa.
- Sin em dashes (`—`) en ningún copy, respuesta ni documento. Sin excepciones.
- Sin anglicismos innecesarios en español.
- Tono: práctico, directo, ejecutivo.
- Al terminar cualquier tarea: commit + push a `main` SIN Co-Authored-By (Vercel lo bloquea).

## Regla crítica de commits

NUNCA agregar `Co-Authored-By: Claude...` en los commits de este repo.
Vercel Hobby bloquea deploys cuando detecta autores sin acceso al proyecto.
Formato de commit: `tipo: descripción breve en inglés`
Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`

## Stack

- Legacy (raíz): React + TypeScript + Tailwind + Vite + Supabase + Vercel
- Nuevo (apps/web/): Astro 6 + Tailwind v4 + React islands + Content Collections + Vercel
- npm en apps/web/. Puerto local Astro: 4321.
- Supabase proyecto: `yfrrfmankgodpepbgyvu` (franciscoabad)

## Vercel — estado actual (junio 2026)

Proyecto `franciscoabad` en Vercel está bajo el equipo
`franciscoabad-founders-projects`. El plan Hobby bloquea deploys de repos
privados en equipos. La producción en franciscoabad.com está congelada en
el commit de mayo 3 (`b8d4ef5`).

Para desbloquear (pendiente de acción de Francisco):
- Opción A (recomendada): hacer el repo GitHub público
- Opción B: transferir el proyecto Vercel a la cuenta personal
- Opción C: upgrade a Vercel Pro ($20/mes)

## Estado del sitio Astro (apps/web/) — junio 2026

### Páginas activas

- `/` Home: Hero, Problem, Services, Testimonials, Resources, LogosInstitucionales, NewsletterCTA, BlogPreview
- `/sobre-mi` Sobre Mí
- `/trabaja-conmigo` Trabaja Conmigo (sin Growth OS, tiene Kit IA)
- `/contacto` Contacto
- `/blog` Listado de posts
- `/blog/[slug]` Post dinámico
- `/kit` Landing lead magnet Kit IA para tus finanzas
- `/kit/gracias` Thank-you page post-formulario

### Blog — posts publicados

- `blog_01_iess.mdx` — "El AS400 y por qué el 78% no cuenta toda la historia" (draft: true)
- `blog_02_kit_finanzas.mdx` — "Cómo organizar tus finanzas con IA sin perder el control" (draft: false)
  - heroImage: grupo de participantes del taller CCQ (`blog02-grupo-v2.jpg`)
  - Foto de Francisco en el medio del cuerpo (`blog02-hero.jpg`)
  - Category: "Finanzas" (agregada al enum en content.config.ts)

### Categorías de blog válidas (content.config.ts enum)

`"Systems Thinking"` | `"Founder Systems"` | `"Liderazgo"` | `"Finanzas"`

### Producto digital activo

- Kit IA para tus finanzas (único recurso público)
- Formulario en /kit usa Formspree: endpoint PENDIENTE (reemplazar `PENDIENTE` en kit.astro)
- Redirect `/kit/gracias` configurado en astro.config.mjs

### Pendiente de backend

- Formspree endpoint real en `apps/web/src/pages/kit.astro` (línea del action)
- Resend + Beehiiv para entrega automática del kit por email
- Supabase Storage bucket para ZIP del kit + URL de descarga

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

Los fonts Gotham están en `_design-system/assets/fonts/` localmente pero no están en el repo (licencia comercial, .gitignore). En producción se cargan vía `@font-face` desde los archivos locales o desde el servidor privado. El fallback en producción es Montserrat (Google Fonts).

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
| Champagne | `#B5985A` | SOLO métricas, KPIs, credenciales |
| Bronze | `#8A6F3D` | Hover de Champagne |
| Linen | `#FAFAF7` | Fondo light mode |
| Slate-light | `#E8EAF0` | Bordes y divisores claros |
| Slate-mid | `#6B7280` | Texto secundario, captions |
| Slate-dark | `#2D3748` | Texto primario sobre fondos claros |
| Charcoal | `#1A1A1A` | Footer oscuro |

Aliases: `--ember` = `--ultramarine`, `--sienna` = `--royal`.
`bg-bg-elevated`: dark `#131F4A`, light `#FFFFFF`.

Regla champagne: EXCLUSIVO para métricas numéricas, KPIs, credenciales académicas.
NO usar en CTAs ni como acento general (eso es `--ember`).

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

## Rutas del proyecto

Repo: `C:\DEV\franciscoabad`

- `/` (raíz) — código legacy Vite/React (no tocar)
- `/apps/web/` — sitio Astro, target de producción
- `/apps/web/src/content/blog/` — posts MDX + imágenes colocadas
- `/apps/web/src/content.config.ts` — schema de content collections
- `/apps/web/public/` — assets estáticos
- `/apps/web/src/i18n/` — traducciones es.json + en.json
- `/supabase/migrations/` — migraciones SQL
