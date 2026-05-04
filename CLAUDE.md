# CLAUDE.md — Instrucciones para Claude Code

## Quién soy

Francisco Abad, founder ecuatoriano. Marca personal "Systems for Growth".
Sitio: franciscoabad.com

## Cómo trabajamos

- Yo dirijo la estrategia y reporto resultados.
- Claude Code ejecuta como "el carpintero": implementa, no propone sin necesidad.
- Siempre verificar con `ls` y `git status` antes de asumir que un archivo existe en el repo.
- Sin em dashes (`—`) en ningún copy ni respuesta.
- Sin anglicismos innecesarios en español.
- Tono: práctico, directo, ejecutivo.
- Al terminar cualquier tarea: commit + push a `main`.

## Stack

- Legacy (raíz): React + TypeScript + Tailwind + Vite + Supabase + Vercel
- Nuevo (apps/web/): Astro 6 + Tailwind v4 + React islands + Markdown content collections + Vercel
- Bun como gestor de paquetes en raíz, npm en apps/web (porque el sistema de Claude Code no tiene bun)
- Puerto local raíz: 8080. Puerto local Astro: 4321.

## Estado de migración a Astro

La marca personal está migrando del sitio legacy Vite/React a Astro
por SEO. El sitio Astro vive en apps/web/. El legacy sigue intacto
en raíz hasta que el deploy nuevo esté listo.

Lo que ya está migrado (apps/web/):

- Páginas: Home, Sobre Mí, Trabaja Conmigo, Contacto
- Componentes: Navbar (island), Footer, todas las secciones del Home
  incluido Testimonials con 9 fotos optimizadas
- Blog: content collections con schema, listado /blog, post dinámico
  /blog/[slug], BlogPreview en home conectado a posts reales
- SEO: sitemap, robots, RSS, Open Graph, Twitter Cards, Schema.org
  Person + Article, JSON-LD
- Assets: francisco-abad.webp + 13 imágenes más optimizadas en
  Sprint 0 (96% reducción promedio)

Lo que NO está migrado (sigue en legacy o pendiente):

- Admin (/admin): apagado en main, queda como código intacto en
  src/pages/admin/ del legacy. No accesible en producción.
- Formulario de contacto: UI lista, sin backend conectado a Resend
- Newsletter Beehiiv: UI lista, sin backend
- Quiz /growth-lab: pendiente migrar como island con endpoint server
- Páginas dinámicas de productos digitales: /growth-os pendiente

## Decisiones editoriales del blog

- Voz: ejecutiva, directa, sin guru, sin académico
- Sin em dashes en ningún copy
- Primera persona activa
- Sin nombres específicos en blogs sobre el IESS (no mencionar
  Lama, Cordovez, Gellibert, Healthbird)
- Sin atacar al gobierno actual
- Datos honestos: cuando algo no se logró, decirlo
- Frase ancla del blog 01 IESS: "una de las instituciones más
  grandes del Ecuador operando como una tienda de barrio"
- Cierre de bio estándar: "Francisco Abad fue Director General del
  IESS de junio a diciembre de 2025. Hoy es founder de Fulcra,
  partner en Kronek y board president de CODEIS."

## Paleta de colores — Ultramarine v5

Sistema dual dark/light mode. Primitivos en `:root`, semánticos en `[data-theme]`.

### Tokens primitivos

| Token | Hex | Uso |
|---|---|---|
| Ink | `#0E1738` | Fondo dark primario |
| Royal | `#1A2B6B` | Cards dark, texto sobre claro |
| Ultramarine | `#3B4ED9` | Acento principal, CTAs, links |
| Ultra-light | `#6B7AE8` | Hover de Ultramarine |
| Champagne | `#B5985A` | Metricas, KPIs, credenciales (SOLO) |
| Bronze | `#8A6F3D` | Hover de Champagne |
| Linen | `#FAFAF7` | Fondo light mode |
| Slate-light | `#E8EAF0` | Bordes y divisores claros |
| Slate-mid | `#6B7280` | Texto secundario, captions |
| Slate-dark | `#2D3748` | Texto primario sobre fondos claros |
| Charcoal | `#1A1A1A` | Footer oscuro |

### Aliases legacy (backward compat, NO cambiar)

- `--ember` apunta a `--ultramarine`
- `--sienna` apunta a `--royal`
- `--bg-primary` apunta a `--background` (cambia con el tema)
- `--bg-elevated` cambia con el tema (dark: `#131F4A`, light: `#FFFFFF`)

### CSS vars clave

`--ember`, `--bg-primary`, `--bg-elevated`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-subtle`, `--ultramarine`, `--champagne`, `--charcoal`

### Regla de uso del champagne

El token `--champagne` / `text-champagne` se usa EXCLUSIVAMENTE para:
metricas numericas, KPIs, credenciales academicas/institucionales.
NO usar como acento general ni en CTAs (eso es `--ember`/`--ultramarine`).

## Regla de oro de archivos

Antes de referenciar cualquier archivo de `public/` en el código, verificar que existe en el repo:

```bash
git ls-files public/[nombre-del-archivo]
```

Si no aparece: `git add + commit + push` antes de continuar.

## Rutas del proyecto

Repo: `C:\DEV\franciscoabad`

Estructura:

- `/` (raíz) — código legacy Vite/React, todavía operativo
- `/apps/web/` — sitio Astro nuevo, target de producción
- `/apps/web/src/content/blog/` — blogs en Markdown con frontmatter
- `/apps/web/public/` — assets del Astro
- `/supabase/migrations/` — migraciones SQL (compartidas)

## Commits

Siempre hacer commit y push al final de cada tarea.
Formato: `tipo: descripción breve en inglés`
Tipos: `feat`, `fix`, `docs`, `refactor`

## Contexto del proyecto

Ver `PROYECTO_STATUS.md` para el estado completo del sitio,
pendientes y servicios externos.
