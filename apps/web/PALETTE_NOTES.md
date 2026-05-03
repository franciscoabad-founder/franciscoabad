# Palette: Ember System

Branch: `exp/palette-ember-system`
Base: `feat/astro-migration`

## Concepto

Fondo casi negro (#0D0D0D) con ember vivo (#FF5A36) como acento. Maxima tension visual.
El nombre de marca "Ember" llevado al limite: fuego real, no terracota sofisticada.
Arriesgado. Puede sentirse demasiado agresivo o demasiado startup.

## Tokens

| Variable          | Valor HSL         | Hex      | Rol                     |
|-------------------|-------------------|----------|-------------------------|
| `--bg-primary`    | `0 0% 5%`         | #0D0D0D  | Fondo base              |
| `--bg-elevated`   | `30 4% 11%`       | #1F1D1A  | Cards, nav              |
| `--bg-contrast`   | `29 55% 93%`      | #F4EDE6  | Seccion logos           |
| `--ember`         | `12 100% 60%`     | #FF5A36  | Acento ember vivo       |
| `--text-primary`  | `29 55% 93%`      | #F4EDE6  | Texto principal         |
| `--text-secondary`| `43 34% 75%`      | #D5C9A6  | Texto secundario        |
| `--text-muted`    | `26 4% 51%`       | #8A8279  | Texto terciario         |
| `--border-subtle` | `30 4% 15%`       | #2A2724  | Bordes                  |
| `--border-accent` | `12 100% 60%`     | #FF5A36  | Bordes de acento        |

## Para probar localmente

```bash
git checkout exp/palette-ember-system
cd apps/web && npm run dev
```

## Para volver a la base

```bash
git checkout feat/astro-migration
```
