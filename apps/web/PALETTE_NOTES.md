# Palette: Clarity

Branch: `exp/palette-clarity`
Base: `feat/astro-migration`

## Concepto

Modo claro completo. Fondo casi blanco (#FAFAF8) con teal (#00B3AA) como acento.
Texto oscuro azulado (#0D1B2A). Propuesta opuesta al dark mode que usamos actualmente.

Hipotesis: puede aumentar percepcion de claridad y accesibilidad para audiencias
mas conservadoras (directivos, inversores institucionales).

## Advertencia

El blog (`/blog/[slug]`) usa `prose-invert` en el div de contenido, lo que
invierte el texto a blanco sobre fondo blanco. Para evaluar el blog en
modo claro hay que quitar `prose-invert` de `[slug].astro` — esa es la
unica modificacion extra que requeriria este branch si se decide avanzar.

## Tokens

| Variable          | Valor HSL         | Hex      | Rol                     |
|-------------------|-------------------|----------|-------------------------|
| `--bg-primary`    | `60 20% 98%`      | #FAFAF8  | Fondo base              |
| `--bg-elevated`   | `0 0% 100%`       | #FFFFFF  | Cards, nav              |
| `--bg-contrast`   | `210 57% 11%`     | #0D1B2A  | Seccion logos           |
| `--ember`         | `177 100% 35%`    | #00B3AA  | Acento teal             |
| `--text-primary`  | `210 57% 11%`     | #0D1B2A  | Texto principal         |
| `--text-secondary`| `215 16% 35%`     | #4A5568  | Texto secundario        |
| `--text-muted`    | `215 14% 52%`     | #718096  | Texto terciario         |
| `--border-subtle` | `60 6% 89%`       | #E5E5E0  | Bordes                  |
| `--border-accent` | `177 100% 35%`    | #00B3AA  | Bordes de acento        |

## Para probar localmente

```bash
git checkout exp/palette-clarity
cd apps/web && npm run dev
```

## Para volver a la base

```bash
git checkout feat/astro-migration
```
