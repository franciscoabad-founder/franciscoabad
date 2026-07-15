# PENDIENTES PANCHO — Salud OS

## Estado actual (aplicado por Claude vía MCP de Supabase)

Ya quedó hecho en el proyecto `yfrrfmankgodpepbgyvu` (franciscoabad):

- ✅ Las 4 migraciones SQL (todas las tablas + RLS + migración de comidas + seed Full Body Casa + 2 rutinas de estiramiento).
- ✅ Seed de 304 alimentos (261 USDA + 43 LATAM) cargado.
- ✅ salud_config con tus targets, Full Body Casa (4 ejercicios) y 2 rutinas de estiramiento.

**Te faltan solo 2 cosas** (PASO 2b y PASO 3 abajo). El PASO 1 y el seed de alimentos ya no hace falta correrlos.

---

Pasos manuales para dejar Salud OS 100% operativo.

## Qué se construyó

Módulo `/os/salud` completo, con 6 vistas mobile-first:

- **Resumen** (`/os/salud`): dashboard con macros del día, ayuno activo, última sesión y último peso, más navegación a los submódulos.
- **Nutrición** (`/os/salud/nutricion`): anillo de kcal y barras de macros vs target por tipo de día, buscador de alimentos con porciones, alta rápida, entrada libre, log por momento, promedio semanal. Absorbe la vieja bitácora de `/os/comidas` (que ahora redirige aquí).
- **Ayuno** (`/os/salud/ayuno`): timer en vivo calculado desde la DB (sobrevive recargas), selector de protocolo, fases 0-24h+, historial editable, racha semanal. Al loguear la primera comida ofrece cerrar el ayuno abierto.
- **Entrenamiento** (`/os/salud/entrenamiento`): biblioteca de ejercicios (búsqueda/filtros/alta manual), constructor de rutinas con sets tipados, y modo sesión activa mobile-first set por set con timer de descanso automático. Alta rápida de sesiones no-gym.
- **Progreso** (`/os/salud/progreso`): gráficas SVG de e1RM (Epley), volumen semanal, balance por grupo, ratios push/pull y squat/hinge con alertas, peso corporal con media móvil de 7 días.
- **Cuerpo** (`/os/salud/cuerpo`): alta manual de peso y medidas, gráfica de tendencia.
- **Estiramiento** (`/os/salud/estiramiento`): rutinas guiadas con cronómetro paso a paso, auto-avance, pausa, sonido y vibración.

Motor de progresión con tests, seeds de ~304 alimentos y de ejercicios wger, y puntos de
integración preparados (columnas `source` + header `X-OS-Token`) para balanza/Fitbit/n8n.

## Decisiones que tomé (autónomas)

Detalle completo en `docs/salud-os-decisiones.md`. Las principales:

1. Gráficas con SVG propio (no recharts): el repo ya dibuja así y evita una dependencia nueva.
2. Tests con el runner nativo de Node (`node --experimental-strip-types --test`), sin frameworks.
3. `/os/salud` pasó de página estática a dashboard real; la vieja `salud.astro` se eliminó y su
   data hardcodeada (`os/data/salud.ts`) ya no se usa en esa ruta.
4. Macros denormalizados en `comidas_log` (el histórico no depende del alimento referenciado).
5. Targets por tipo de día hardcodeados como defaults editables en `salud_config`.

---

## PASO 1 — Aplicar el SQL en Supabase Studio (en orden)

Proyecto Supabase: `yfrrfmankgodpepbgyvu`. Ve a Supabase Studio → SQL Editor y pega el contenido
de cada archivo, **en este orden**:

1. `supabase/migrations/20260715000000_salud_os_schema.sql` (crea todas las tablas + RLS).
2. `supabase/migrations/20260715000100_comidas_a_comidas_log.sql` (migra tus comidas viejas).
3. `supabase/migrations/20260715000200_salud_seed_full_body_casa.sql` (rutina de ejemplo).
4. `supabase/migrations/20260715000300_salud_seed_estiramiento.sql` (2 rutinas de estiramiento).

Todos son idempotentes: puedes correrlos más de una vez sin duplicar.

## PASO 1 — (YA HECHO) SQL en Supabase

Las 4 migraciones ya se aplicaron por MCP. No hagas nada aquí.

## PASO 2b — Correr SOLO el seed de ejercicios de wger (desde tu PC)

El seed de alimentos ya está cargado. Falta el de ejercicios, y este SÍ lo tienes que correr tú:
el entorno cloud de Claude no puede alcanzar `wger.de` (política de red), así que debe correr
desde tu máquina, que sí tiene internet abierto.

Necesitas el `SERVICE_ROLE_KEY` de Supabase (Studio → Project Settings → API → service_role):

```bash
cd apps/web

# ~150-200 ejercicios desde wger (hace llamadas de red). Idempotente por wger_id.
SUPABASE_URL="https://yfrrfmankgodpepbgyvu.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY" \
node --experimental-strip-types scripts/seed-ejercicios.ts
```

Imprime cuántos insertó. No es bloqueante: la app ya funciona con los 4 ejercicios de peso
corporal de "Full Body Casa" y puedes agregar ejercicios a mano. wger solo suma una biblioteca grande.

## PASO 3 — Variables de entorno nuevas (Vercel + local)

Agrega estas dos en Vercel (Production) y en `apps/web/.env` local:

| Variable | Valor | Para qué |
|---|---|---|
| `OS_API_TOKEN` | genera un token aleatorio largo (ej. `openssl rand -hex 32`) | Valida el header `X-OS-Token` de escrituras externas (balanza/Fitbit/n8n). Guárdalo, lo usarás en n8n. |
| `OFF_CONTACT_EMAIL` | `francisco@franciscoabad.com` | User-Agent para Open Food Facts (buena práctica de su API). |

`OS_API_TOKEN` es server-side (sin prefijo `VITE_`/`PUBLIC_`). Nunca lo pongas en el repo.

En Vercel: Project Settings → Environment Variables → Add. Marca Production (y Preview si quieres).
Después redeploy para que tomen efecto.

## PASO 4 — Verificación final

1. Abre `franciscoabad.com/os` → debe verse la tarjeta **Salud**. Click lleva a `/os/salud`.
2. En `/os/salud` navega por las 6 pestañas: todas cargan sin error.
3. **Nutrición**: busca "pollo" → aparece; agrégalo con cantidad; el anillo y las barras se actualizan.
4. **Ayuno**: inicia un ayuno; recarga la página → el timer sigue corriendo desde la DB.
5. **Entrenamiento** → Rutinas → "Full Body Casa" → Iniciar sesión → recorre los sets; al completar uno arranca el timer de descanso. Termina la sesión y revisa que aparezca en Historial.
6. **Estiramiento**: abre "Post-entreno 5 min" → el cronómetro avanza y suena/vibra al cambiar de paso.
7. **Cuerpo**: registra un peso → aparece en la gráfica.
8. `/os/comidas` debe redirigir a `/os/salud/nutricion`.

Si algo no carga datos, revisa que el PASO 1 y 2 se completaron y que las env vars del PASO 3
están en Production.

## Fuera de esta sesión (próximos pasos, ya preparados)

- Conectar la balanza Renpho / Fitbit vía n8n: hacer POST a `/api/os/salud/cuerpo` con header
  `X-OS-Token: <OS_API_TOKEN>` y body `{ peso_kg, grasa_pct, source: "renpho" }`.
- Captura de comidas por Telegram/agente: POST a `/api/os/salud/comidas-log` con `X-OS-Token` y
  `source: "telegram"`.
- Escaneo de barcode desde el celular para alta de alimentos (el endpoint ya consulta Open Food Facts).
- Voz/TTS para el modo sesión y estiramiento.
