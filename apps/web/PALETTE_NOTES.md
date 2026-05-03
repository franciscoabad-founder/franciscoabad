# Palette: Midnight Steel

Branch: `exp/palette-midnight-steel`
Base: `feat/astro-migration`

## Concepto

Iron base (#0F1216) con Cobalt Deep (#0F2A52) como acento. Tono naval, técnico, serio.
Sin calidez. Para probar si el sitio funciona con una paleta completamente fría y corporativa.

## Tokens

| Variable         | Valor HSL         | Hex      | Rol                     |
|------------------|-------------------|----------|-------------------------|
| `--bg-primary`   | `214 19% 7%`      | #0F1216  | Fondo base              |
| `--bg-elevated`  | `213 17% 10%`     | #161A1F  | Cards, nav              |
| `--bg-contrast`  | `210 12% 90%`     | #E2E5E8  | Sección logos           |
| `--ember`        | `216 69% 19%`     | #0F2A52  | Acento cobalt deep      |
| `--text-primary` | `210 12% 90%`     | #E2E5E8  | Texto principal         |
| `--text-secondary`| `207 17% 55%`    | #7A8FA0  | Texto secundario        |
| `--text-muted`   | `206 17% 44%`     | #5C7283  | Texto terciario         |
| `--border-subtle`| `214 17% 16%`     | #222830  | Bordes                  |
| `--border-accent`| `216 69% 19%`     | #0F2A52  | Bordes de acento        |

## Para probar localmente

```bash
git checkout exp/palette-midnight-steel
cd apps/web && npm run dev
```

## Para volver a la base

```bash
git checkout feat/astro-migration
```
