# AUDIT_PRE_ULTRAMARINE — Auditoría Pre-Migración Paleta Ultramarine v5

**Fecha:** 2026-05-03  
**Branch base auditado:** `feat/astro-migration`  
**Propósito:** Verificar estado del codebase antes de ejecutar migración a Ultramarine v5

---

## 1. Estado del Repo

**Ruta confirmada:** `C:\DEV\franciscoabad`  
**Branch actual durante auditoría:** `feat/astro-migration`

**Archivo modificado (sin commit):**
- `src/assets/logos/fa_stacked_tagline_ember_3x.png` — unstaged en el working directory del repo legacy. No afecta el sitio Astro (apps/web/ no lo usa directamente).

**Total de branches:** 15 (13 experimentales + `feat/astro-migration` + `main`)

**Ultimos 10 commits en feat/astro-migration:**

| Hash | Mensaje |
|------|---------|
| `150b04f` | exp(palette): add Indigo Light Mode system |
| `e94a7cd` | refactor(brand): replace all hardcoded ember/sienna hex with CSS vars |
| `fb58ab4` | docs(blog): add README with creation workflow and common pitfalls |
| `15d6d8d` | fix(blog): tighten prose spacing for tighter reading rhythm |
| `f7b5af5` | fix(seo): tighten meta descriptions and post title length |
| `88eb25f` | feat(seo): add dynamic llms-full.txt and replace sitemap integration with custom endpoints |
| `f089eb8` | feat(seo): add llms.txt for generative engine optimization |
| `30b9ecf` | feat(seo): expand robots.txt with explicit AI crawler allow list |
| `2ac3939` | content(blog): restore inline images to iess post |
| `4c8088f` | style(brand): update ember to #9B3D28 (deeper, more burnt) |

---

## 2. Estado del Refactor de Colores

**Patrones buscados:** `#9B3D28`, `#C2654A`, `#7D2F1F`, `#A3503A`, `#141414`, `#1E1E1E`, `#F4EDE6`, `hsl(13,...)`, `hsl(14,...)`

### Hex hardcoded encontrados en apps/web/src/

| Archivo | Linea | Valor encontrado | Tipo | Evaluacion |
|---------|-------|-----------------|------|-----------|
| `layouts/BaseLayout.astro` | 109 | `content="#9B3D28"` | `<meta name="theme-color">` | ESPERADO, parte de la migracion |
| `styles/global.css` | 15 | `/* #9B3D28 terracotta */` | Comentario CSS | IGNORAR (no runtime) |
| `styles/global.css` | 20 | `/* #9B3D28 */` | Comentario CSS | IGNORAR (no runtime) |

**Resultado `#C2654A`, `#7D2F1F`, `#A3503A`, `#141414`, `#1E1E1E`, `#F4EDE6`:** 0 resultados.  
**Resultado `hsl(14,...)` o `hsl(13,...)`:** 0 resultados.

### Referencias semanticas en componentes

Todos los colores de acento en componentes usan:
- **Tailwind utilities via CSS var:** `text-ember`, `bg-ember`, `border-ember`, `hover:text-ember`, `hover:bg-ember`, `hover:border-ember`, `focus:border-ember`
- **Inline styles con CSS var:** `hsl(var(--ember))`, `hsl(var(--bg-elevated))`, `hsl(var(--bg-primary))`

No se encontraron referencias `sienna` ni `burnished` en el codebase.

**El refactor anterior (`e94a7cd`) esta limpio. Todos los colores de componentes usan CSS vars. El unico hex hardcoded es el `theme-color` meta tag (esperado, se actualiza en cada palette branch).**

---

## 3. Inventario de Logos

### apps/web/public/ (Astro — produccion)

| Archivo | Tamano | Clasificacion | Razon |
|---------|--------|---------------|-------|
| `fa_stacked_tagline_ember_3x.png` | 24 KB | **REGENERAR** | Nombre contiene "ember" — el logo tiene el color terracota hardcoded en la imagen |
| `fa_horizontal_clean_dark.svg` | 35 KB | **INSPECCIONAR VISUALMENTE** | "dark" indica version para fondo oscuro; puede contener el terracota en el texto/trazo |
| `favicon.svg` | 1.9 KB | **INSPECCIONAR VISUALMENTE** | Sin indicacion de color en el nombre |
| `favicon.ico` | 655 B | **INSPECCIONAR VISUALMENTE** | Sin indicacion de color en el nombre |

**Usado activamente en produccion:**
- `fa_horizontal_clean_dark.svg` — en `Navbar.astro` como logotipo principal
- `fa_stacked_tagline_ember_3x.png` — en `Footer.astro` como logo del footer

### src/assets/logos/ (Legacy Vite/React)

| Archivo | Tamano | Clasificacion | Razon |
|---------|--------|---------------|-------|
| `fa_stacked_tagline_ember_3x.png` | 24 KB | **REGENERAR** | Nombre contiene "ember" — mismo archivo que el de public/ |
| `fa_horizontal_clean_dark.svg` | 35 KB | **INSPECCIONAR VISUALMENTE** | "dark" indica version para fondo oscuro |
| `fa_horizontal_tagline_dark.svg` | 34 KB | **INSPECCIONAR VISUALMENTE** | "dark" indica version para fondo oscuro |
| `fa_reduced_white.svg` | 3.7 KB | **REUTILIZABLE** | "white" — version monocromatica blanca, no depende de color de marca |

**Nota:** El archivo `src/assets/logos/fa_stacked_tagline_ember_3x.png` aparece como **modificado (unstaged)** en el working directory. Fue editado recientemente pero no committeado. Verificar si es la version actualizada o si hay conflicto con la version en `apps/web/public/`.

### Prioridad para migracion Ultramarine

1. `fa_stacked_tagline_ember_3x.png` (ambas rutas) — regenerar con nueva paleta azul/champagne
2. `fa_horizontal_clean_dark.svg` — inspeccionar si contiene terracota, posiblemente regenerar
3. `favicon.svg` / `favicon.ico` — inspeccionar si el isotipo usa el terracota

---

## 4. Branches Existentes

**feat/astro-migration** — branch base confirmada.

**13 branches experimentales:**

| # | Branch | Tipo | Estado |
|---|--------|------|--------|
| 1 | `exp/palette-cobalt` | Paleta dark, acento azul cobalto | Rebased sobre feat/astro-migration |
| 2 | `exp/palette-iron` | Paleta dark, acento gris acero | Rebased |
| 3 | `exp/palette-conifer` | Paleta dark, acento verde | Rebased |
| 4 | `exp/palette-petrol` | Paleta dark, acento azul petroleo | Rebased |
| 5 | `exp/palette-console` | Paleta dark, acento verde terminal | Rebased |
| 6 | `exp/palette-indigo` | Paleta dark, acento indigo | Rebased |
| 7 | `exp/palette-midnight-steel` | Paleta dark, acento azul medianoche | Rebased |
| 8 | `exp/palette-ember-system` | Paleta dark, variante ember extendida | Rebased |
| 9 | `exp/palette-clarity` | Paleta dark, acento azul clarity | Rebased |
| 10 | `exp/palette-isotype` | Isotipo SVG experimental | Rebased |
| 11 | `exp/system-clarity` | Sistema de marca completo (multi-commit) | Rebased (conflicto Hero resuelto) |
| 12 | `exp/system-iron-light` | Light mode, acento steel blue #3B82F6 | Nueva (creada en este sprint) |
| 13 | `exp/system-indigo-light` | Light mode, acento periwinkle #6366F1 | Nueva (creada en este sprint) |

Todas las 13 branches estan sincronizadas en `origin`.

---

## 5. Estado del Build

**Comando:** `npm run build` en `apps/web/`  
**Resultado:** PASA sin errores ni advertencias  
**Paginas generadas:** 6  
**Tiempo de build:** 2.81s  
**Tamano de `dist/`:** 3.8 MB

---

## 6. Env Vars y Supabase

**Archivos buscados:** `apps/web/.env`, `apps/web/.env.example`, `.env` (raiz)  
**Resultado:** Ningun archivo `.env` encontrado en el repo.

| Variable | Estado |
|----------|--------|
| `VITE_SUPABASE_URL` | No configurada |
| `VITE_SUPABASE_ANON_KEY` | No configurada |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | **No encontrada** (sin riesgo de seguridad) |
| `RESEND_API_KEY` | No configurada |
| `BEEHIIV_API_KEY` | No configurada |

**Sin riesgos de seguridad detectados en env vars.**

Pendiente de configuracion (Fase 3 del roadmap):
- Resend — formulario de contacto
- Beehiiv — newsletter

---

## DECISION

### Semaforo de condiciones

| Condicion | Estado |
|-----------|--------|
| Hex hardcoded en componentes | LIMPIO (0 hex en componentes) |
| Hex en meta theme-color | 1 instancia en BaseLayout.astro:109 (ESPERADO, cambiar durante migracion) |
| Build | PASA |
| Env vars SERVICE_ROLE expuesta | NO |

### Resultado

**LISTO PARA MIGRAR A ULTRAMARINE**

El codebase esta en estado optimo para la migracion:
- Todos los colores de componentes usan `var(--ember)` y las CSS vars del sistema
- El build compila sin errores
- No hay service keys expuestas

**Checklist para la migracion Ultramarine v5:**

- [ ] Actualizar `:root` en `apps/web/src/styles/global.css` con los tokens de Ultramarine
- [ ] Actualizar `<meta name="theme-color">` en `BaseLayout.astro:109`
- [ ] Regenerar `fa_stacked_tagline_ember_3x.png` con paleta azul/champagne
- [ ] Inspeccionar y posiblemente regenerar `fa_horizontal_clean_dark.svg`
- [ ] Inspeccionar `favicon.svg` / `favicon.ico`
- [ ] Verificar/commitear el `src/assets/logos/fa_stacked_tagline_ember_3x.png` modificado (unstaged)
- [ ] Rebase de las 13 branches experimentales sobre el nuevo base post-migracion (si aplica)
