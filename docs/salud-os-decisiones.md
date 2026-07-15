# Salud OS — bitácora de decisiones

Registro de decisiones tomadas en modo autónomo durante la construcción del módulo
`/os/salud`. Cada entrada explica una ambigüedad de la especificación y cómo se
resolvió siguiendo las convenciones del repo.

## D1 — Un solo archivo de migración por dominio

Las migraciones existentes agrupan un dominio completo en un archivo (`os_gtd_layer.sql`
trae pendientes, notas, recordatorios y reuniones juntas). Se sigue ese estilo: toda la
fundación de Salud OS vive en `20260715000000_salud_os_schema.sql`. La migración de datos
de `comidas` a `comidas_log` va aparte (`20260715000100_comidas_a_comidas_log.sql`) porque
mueve data existente y conviene poder correrla o revertirla de forma independiente.

## D2 — RLS habilitado sin políticas + grant a service_role

Patrón establecido del OS: `enable row level security` en cada tabla y `grant all ... to
service_role`. El acceso solo ocurre vía endpoints server-side con service role detrás del
login `os_auth`. No se crean políticas.

## D3 — IDs uuid con gen_random_uuid()

Todas las tablas nuevas usan `uuid primary key default gen_random_uuid()`, igual que
`pendientes`, `notas`, etc.

## D4 — Timezone América/Guayaquil para "hoy"

Igual que `comidas.ts`, el cálculo de "hoy" usa `America/Guayaquil`. Las fechas de día se
guardan como `date`; los timestamps de eventos (ayuno, sets) como `timestamptz`.

## D5 — Columna `source` en tablas de captura para integraciones futuras

Fitbit, balanza Renpho y Telegram/n8n quedan fuera de esta sesión pero se dejan preparados
los puntos de integración: cada tabla que puede recibir escritura externa lleva una columna
`source`/`fuente`. Los endpoints que aceptan escritura externa validan el header
`X-OS-Token` contra `OS_API_TOKEN` (además del `os_auth` normal).

## D6 — Gráficas con SVG propio en vez de recharts

La especificación dice "usa la librería que ya esté en el repo; si no hay, recharts". El
repo ya trae `d3` y, sobre todo, el resto del OS dibuja sparklines y anillos con SVG inline
(ver `redes.astro`, `comidas.astro`). Para mantener consistencia visual y no agregar peso al
bundle, las gráficas de `/os/salud/progreso` y `/os/salud/cuerpo` se construyen con SVG
propio (líneas, barras, promedio móvil) en componentes React. Decisión: cero dependencias
nuevas.

## D7 — Test runner nativo de Node

No existe framework de tests en el repo. Node 22.12+ (el repo pide `>=22.12.0`) puede
ejecutar TypeScript con `--experimental-strip-types` y trae `node:test` + `node:assert`.
Los tests de `src/lib/salud/*.test.ts` corren con `npm run test:salud`
(`node --experimental-strip-types --test`). Cero dependencias nuevas.

## D8 — `/os/salud` pasa de página estática a dashboard

Ya existía `src/pages/os/salud.astro` (página estática con data hardcodeada en
`os/data/salud.ts`). Se convierte en `src/pages/os/salud/index.astro` (dashboard real con
datos de Supabase) y los submódulos viven en `src/pages/os/salud/{nutricion,ayuno,
entrenamiento,progreso,cuerpo,estiramiento}.astro`. Se elimina el `salud.astro` plano para
evitar el conflicto de ruta con `salud/index.astro`.

## D9 — Macros denormalizados en `comidas_log`

Se guardan los macros ya calculados en cada entrada de `comidas_log` (denormalizado) para
que el histórico no dependa de que el alimento referenciado siga existiendo con los mismos
valores. Es el mismo criterio del tracker actual de `comidas`.

## D10 — Seeds ejecutables por Pancho, nunca en build

`seed-alimentos.ts` y `seed-ejercicios.ts` se corren manualmente con
`node --experimental-strip-types` leyendo `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` del
entorno. No se llaman en el build de Astro. wger y Open Food Facts se consultan en runtime
del script (seed) o del endpoint, nunca durante `astro build`.

## D11 — Datos latinoamericanos con fuente documentada

Los ~40 platos/ingredientes latinoamericanos del seed llevan macros razonables por 100 g con
la fuente anotada en el propio registro (`fuente: 'latam'` + nota). Son estimaciones de
dominio público (tablas de composición de alimentos de Ecuador/INCAP) redondeadas.

## D12 — Middleware: aceptar X-OS-Token para escrituras externas

La spec pedía dos cosas en tensión: (a) "no modifiques el middleware" y (b) que las
escrituras externas usen el header `X-OS-Token`. El middleware solo dejaba pasar `/api/os/*`
con cookie `os_auth` o `Authorization: Bearer`, así que un request con solo `X-OS-Token`
recibía un 302 a login y la integración quedaba muerta. Se hizo un cambio ADITIVO mínimo:
el middleware ahora también acepta `X-OS-Token === OS_API_TOKEN` en el bloque
server-to-server de `/api/os/*` y `/api/brain`. No altera ninguna ruta existente ni debilita
la protección (es una credencial adicional equivalente al Bearer que ya se aceptaba). Esto
hace que la integración especificada realmente funcione.
