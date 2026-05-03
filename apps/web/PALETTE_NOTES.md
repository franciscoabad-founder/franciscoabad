# Palette: Isotype

Branch: `exp/palette-isotype`
Base: `feat/astro-migration`

## Concepto

Sin cambios de color (mantiene Ember #9B3D28 completo). El experimento es de
identidad visual, no de paleta: reemplaza el logotipo horizontal y el logo
apilado por el isotipo "A" geometrico en ember.

Hipotesis: el marcador solo, sin texto, puede funcionar mejor en Navbar y
Footer a medida que la marca madura y el reconocimiento aumenta.

## Cambios

- `src/components/Isotype.astro` (nuevo): SVG del isotipo "A" en ember color
- `src/components/Navbar.astro`: logo reemplazado por `<Isotype height={32} />`
- `src/components/Footer.astro`: logo apilado reemplazado por `<Isotype height={64} />`
- `src/styles/global.css`: sin cambios
- `src/layouts/BaseLayout.astro`: sin cambios

## SVG del isotipo

Dos diagonales formando la "A" y una barra horizontal, todo en ember.
viewBox 0 0 32 40, stroke-width 3, linecap round.

```
  /\
 /  \
/----\
/    \
```

## Para probar localmente

```bash
git checkout exp/palette-isotype
cd apps/web && npm run dev
```

## Para volver a la base

```bash
git checkout feat/astro-migration
```
