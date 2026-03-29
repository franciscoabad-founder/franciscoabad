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

React + TypeScript + Tailwind + Vite + Supabase + Vercel
Bun como gestor de paquetes. Puerto local: 8080.

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| Ember | `#C2654A` | Acento principal, CTAs, highlights |
| Sienna | `#A3503A` | Variante más oscura del Ember |
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

```
C:\Users\Francisco\OneDrive\Profesional\FRANCISCO ABAD\02_Web\franciscoabad
```

## Commits

Siempre hacer commit y push al final de cada tarea.
Formato: `tipo: descripción breve en inglés`
Tipos: `feat`, `fix`, `docs`, `refactor`

## Contexto del proyecto

Ver `PROYECTO_STATUS.md` para el estado completo del sitio,
pendientes y servicios externos.
