# Salud OS

Módulo de salud del OS personal de Pancho, en `/os/salud`. Cubre Nutrición, Ayuno,
Entrenamiento, Progreso, Cuerpo y Estiramiento. Mobile-first, PWA, misma estética que el
resto del OS.

## Arquitectura

Sigue el patrón "Molde A" del OS (ver `apps/web/docs/patron-two-way.md`):

- Endpoints server-side en `apps/web/src/pages/api/os/salud/*` con `export const prerender = false`.
- Cada endpoint usa `getSupabaseServer()` (lee `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  server-side) y `isOsAuthorized()` (cookie `os_auth` o Bearer con `OS_AUTH_TOKEN`/`OS_API_TOKEN`).
- Los endpoints que aceptan escritura externa (comidas-log, ayunos, sesiones, cuerpo) también
  admiten el header `X-OS-Token` validado contra `OS_API_TOKEN` (`isExternalTokenAuthorized`),
  para futura integración con balanza Renpho / Fitbit / Telegram vía n8n.
- El middleware existente (`src/middleware.ts`) ya protege `/os/*` y `/api/os/*`. No se tocó.
- UI: páginas Astro (`src/pages/os/salud/*.astro`) que montan islas React
  (`src/os/components/salud/*.tsx`) con `client:load`.
- Lógica pura y testeable en `src/lib/salud/*` (macros, ayuno, progresión) con tests
  `*.test.ts` que corren con `npm run test:salud`.

## Tablas (Supabase)

Todas con RLS habilitado sin políticas y `grant all ... to service_role` (patrón OS).
Migración: `supabase/migrations/20260715000000_salud_os_schema.sql`.

| Tabla | Qué guarda |
|---|---|
| `salud_config` | Targets nutricionales base + ajustes por tipo de día (JSON), preferencias. Fila única. |
| `alimentos` | Base de alimentos (personal/off/usda/latam), macros por 100 g, porciones JSON, barcode. |
| `comidas_log` | Registro de comidas con macros calculados/denormalizados, momento, tipo_dia, source. |
| `ayunos` | Ayunos con inicio/fin, protocolo, objetivo_horas, source. |
| `ejercicios` | Biblioteca (wger/personal): grupo, patrón, secundarios, equipamiento, media, wger_id. |
| `rutinas` + `rutina_ejercicios` | Rutinas y su lista de ejercicios con `sets_plan` tipados (JSON). |
| `sesiones` + `sets_log` | Sesiones de entreno y cada set logueado (tipo, reps, peso, rpe, completado). |
| `cuerpo_log` | Mediciones corporales (peso, grasa, músculo, agua, cintura, sueño), source manual/renpho/fitbit. |
| `rutinas_estiramiento` | Rutinas guiadas con `pasos` JSON (nombre, detalle, duracion_seg, por_lado). |

Índices en fechas (`*_fecha_idx`), `barcode`, `wger_id`, grupo/patrón de ejercicios, y GIN
para búsqueda de texto en `alimentos.nombre` y `ejercicios.nombre`.

Migraciones adicionales:
- `20260715000100_comidas_a_comidas_log.sql`: migra la tabla `comidas` existente a `comidas_log`
  como entradas cualitativas (idempotente, guarda `origen_comida_id`). No borra `comidas`.
- `20260715000200_salud_seed_full_body_casa.sql`: 4 ejercicios de peso corporal + rutina de
  ejemplo "Full Body Casa" (para probar el modo sesión sin depender de wger).
- `20260715000300_salud_seed_estiramiento.sql`: 2 rutinas de estiramiento guiadas.

## Endpoints

Todos bajo `/api/os/salud/`:

| Endpoint | Métodos | Notas |
|---|---|---|
| `config` | GET, PATCH | Fila única de targets/preferencias. |
| `alimentos` | GET, POST, DELETE | GET `?q=` busca local; `?barcode=` busca local y si no consulta Open Food Facts (server-side) y lo guarda. |
| `comidas-log` | GET, POST, PATCH, DELETE | GET `?dia=` con totales; `?historial=1&desde=`. POST calcula macros por `alimento_id`+`cantidad_g` o acepta macros directos. POST admite `X-OS-Token`. |
| `ayunos` | GET, POST, PATCH, DELETE | GET `?abierto=1` devuelve el ayuno en curso. POST cierra el abierto antes de iniciar. |
| `ejercicios` | GET, POST, PATCH, DELETE | GET filtra por `q`, `grupo`, `patron`. |
| `rutinas` | GET, POST, PATCH, DELETE | Maneja `rutina_ejercicios` anidados (borra+inserta). |
| `sesiones` | GET, POST, PATCH, DELETE | Maneja `sets_log` anidados. POST admite `X-OS-Token`. |
| `cuerpo` | GET, POST, PATCH, DELETE | POST admite `X-OS-Token` (balanza/Fitbit). |
| `estiramiento` | GET, POST, PATCH, DELETE | Rutinas guiadas. |
| `progreso` | GET | Devuelve sets crudos + serie de peso para analytics (la lógica vive en `lib/salud/progresion.ts`). |

## Lógica testeable (`src/lib/salud/`)

- `macros.ts`: cálculo de macros por cantidad, porciones a gramos, suma, targets por tipo de día.
- `ayuno.ts`: fases del ayuno, duración, formato.
- `progresion.ts`: progressive overload, Progress Index (volumen por grupo, e1RM Epley, ratios
  push/pull y squat/hinge con alertas), regla de recuperación por sueño, promedio móvil.

Correr tests: `npm run test:salud` (usa `node --experimental-strip-types --test`, sin dependencias nuevas).

## Cómo correr los seeds

Desde `apps/web/`, con las env vars de Supabase (service role):

```bash
SUPABASE_URL="https://yfrrfmankgodpepbgyvu.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
node --experimental-strip-types scripts/seed-alimentos.ts

SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." \
node --experimental-strip-types scripts/seed-ejercicios.ts
```

- `seed-alimentos.ts`: inserta ~304 alimentos (261 USDA dominio público + 43 LATAM). Idempotente
  por (nombre, fuente). No hace llamadas de red.
- `seed-ejercicios.ts`: importa ~150-200 ejercicios desde la API pública de wger (CC-BY-SA).
  Hace llamadas de red en runtime (no en build). Idempotente por `wger_id`.

Los seeds de "Full Body Casa" y estiramiento van como migraciones SQL (se aplican en Supabase Studio).

## Variables de entorno

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: ya configuradas (uso server-side y seeds).
- `OS_AUTH_TOKEN`, `OS_API_TOKEN`: ya existen (auth del OS). `OS_API_TOKEN` valida `X-OS-Token`.
- `OFF_CONTACT_EMAIL`: email de contacto para el User-Agent de Open Food Facts (nueva).

Ninguna variable con prefijo `VITE_`/`PUBLIC_`. Ningún secreto en el código.

## Integraciones futuras (preparadas, fuera de esta sesión)

- Fitbit, balanza Renpho, Telegram/n8n, voz TTS: las tablas llevan columna `source`/`fuente` y
  los endpoints de escritura aceptan `X-OS-Token`. Falta el flujo n8n y el mapeo por proveedor.
- Open Food Facts ya se consulta en runtime desde el endpoint de alimentos por barcode.
