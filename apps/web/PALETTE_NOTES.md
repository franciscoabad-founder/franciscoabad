# Sistema: Clarity (version correcta)

Sistema completo de marca alineado al brand book de referencia. Inter como tipografia unica en TODOS los pesos. Paleta Iron + Cobalt + Steel con acentos de Patina dorada. Manifiesto de 5 principios. 4 variantes de logo (marca, reducida, monograma, firma).

## Tokens

| Rol                 | Token          | HEX      |
|---------------------|----------------|----------|
| Background base     | Pitch          | #0D0F12  |
| Cards               | Iron           | #161A1F  |
| Cards 2             | Graphite       | #1F232A  |
| Bordes sutiles      | Iron Mid       | #1F232A  |
| Bordes visibles     | Steel Mid      | #3A4550  |
| Texto principal     | Frost          | #F4F6F8  |
| Texto secundario    | Steel Soft     | #B8C2CC  |
| Acento UI           | Steel Light    | #7A8FA0  |
| Acento CTA          | Cobalt Deep    | #0F2A52  |
| Acento "GROWTH."    | Cobalt Mid     | #1A3060  |
| Acento raro         | Patina         | #8E7A43  |

## Tipografia

Inter en todos los pesos (300, 400, 500, 600, 700, 900). Sin serif. Sin Georgia. Disciplina monotipo.
Caveat 500 para la variante "signature" del Logo.

## Logo

4 variantes en `src/components/Logo.astro`:
- `full`: FRANCISCO (light 300) + ABAD (bold 700) + tagline italic ember
- `compact`: solo ABAD (bold 700)
- `monogram`: A geometrica con remate cobalt-mid
- `signature`: F. Abad en Caveat

Navbar desktop: `variant="full" size="sm"`. Navbar mobile: `variant="monogram" size="md"`.
Footer: `variant="full" size="md"`.

## Secciones nuevas

- `KpiStrip`: 4 stats en franja horizontal despues del Hero
- `TaglineSection`: CLARITY BUILDS GROWTH. + specimen tipografico
- `Manifiesto`: 5 principios con iconos SVG
- `CitaSection`: blockquote editorial antes del Footer

## Orden en Home

Hero > KpiStrip > TaglineSection > LogosInstitucionales > ProblemStatement > Manifiesto > Services > Testimonials > Resources > BlogPreview > NewsletterCTA > CitaSection

## Como volver

```bash
git checkout feat/astro-migration
```

## Status

Branch candidata a produccion si supera la comparacion con las 10 branches experimentales de paleta.
