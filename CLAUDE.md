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

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| Ember | `#9B3D28` | Acento principal, CTAs, highlights |
| Sienna | `#7D2F1F` | Variante más oscura del Ember |
| Ink | `#141414` | Fondo más oscuro (growth-lab) |
| Onyx | `#1E1E1E` | Fondo de cards y elementos elevados |
| Linen | `#F4EDE6` | Sección LogosInstitucionales (fondo claro) |
| Stone | `#8A8279` | Texto secundario, labels, notas |
| Warm Slate | `#4A4541` | Texto de apoyo sobre fondos claros |

CSS vars: `--ember`, `--bg-primary`, `--bg-elevated`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-subtle`

## Regla de oro de archivos

Antes de referenciar cualquier archivo de `public/` en el código, verificar que existe en el repo:

```bash
git ls-files public/[nombre-del-archivo]
```

Si no aparece: `git add + commit + push` antes de continuar.

## Rutas del proyecto

Repo: `C:\Users\Francisco\OneDrive\Profesional\FRANCISCO ABAD\02_Web\franciscoabad`

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
