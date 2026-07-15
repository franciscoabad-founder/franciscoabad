# Salud OS — QA y mejoras de calidad

Bitácora de QA del módulo `/os/salud`. Trabajo hecho sobre `main` (el módulo ya está
mergeado y en producción). Cada hallazgo: primero se reproduce, luego se arregla, luego
se verifica. Formato: `[severidad] título` con estado.

Entorno de QA: dev server Astro en `:4327` (el `:4321` estaba ocupado por otro proceso),
viewport mobile 375x812, autenticado con `os_auth`. Tests `npm run test:salud` 40/40 y
`npm run build` limpio antes de empezar.

Leyenda de estado: 🔴 abierto · 🟡 en verificación · 🟢 arreglado y verificado · ⚪ descartado / no-bug

---

## Hallazgos del audit de código (a verificar en navegador)

### Nutrición

- 🟡 **[media] `cambiarTipoDia` dispara N PATCH en paralelo sin await/feedback/reload ni guard de día vacío.**
  `OSSaludNutricion.tsx:254`. Al cambiar el selector de tipo de día, hace `Promise.all` de un
  PATCH por cada comida del día. En día sin comidas hace 0 requests (ok) pero no hay manejo de
  error ni indicación visual; si falla un PATCH, las entradas quedan con tipos distintos en
  silencio. Con muchas entradas son N round-trips. Escenario: cambiar tipo dos veces rápido
  puede intercalar batches. Fix propuesto: endpoint bulk (`PATCH ?dia=`) o al menos await +
  reload + captura de error.

- ⚪ **`ofrecerCerrarAyuno` en cada comida.** Verificado en código: `esPrimeraDelDia =
  comidas.length === 0` se captura antes del POST y el `confirm` solo aparece si además hay
  ayuno abierto (`OSSaludNutricion.tsx:199,224,232`). No molesta en cada comida. No-bug.

- ⚪ **Paridad macros gramos vs porción.** Verificado en código: ambos flujos pasan por
  `gramosEfectivos` (redondeado a 1 decimal) y el endpoint recalcula con el mismo factor
  `cantidad_g/100` vía `calcularMacros` (`macros.ts`), idéntico al `preview`. Coinciden.
  Pendiente confirmar en navegador.

- 🟡 **[baja] Barra de grasa marca "over" (rojo) al pasar el punto medio, no el máximo.**
  `OSSaludNutricion.tsx:320` pasa `target={grasaMid}` a `MacroBar`, cuyo `over = actual >
  target`. La grasa tiene rango min-max; usar el punto medio como umbral de alarma pinta de
  rojo dentro de rango válido. Revisar criterio.

### Búsqueda de alimentos

- 🟡 **[baja/mejora] Búsqueda sin acentos ni ranking.** `alimentos?q=` usa solo `ilike` sobre
  nombre/marca. "platano" no encuentra "plátano". Evaluar `unaccent` o normalización. Mejora,
  no bug bloqueante.

### Entrenamiento

- ⚪ **Sesión guardada sin columna `fecha`.** DESCARTADO tras auditar el endpoint: `sesiones`
  POST setea `fecha: body.fecha?.trim() || hoyGuayaquil()`, así que la sesión rápida también
  recibe fecha de hoy. El Historial recibe un `YYYY-MM-DD` válido. No-bug.

### Timers (React)

- ⚪ **Ayuno / Estiramiento / descanso en sesión: fugas y doble avance.** Auditados en código:
  - Ayuno: `nowMs` arranca en 0 (evita hydration mismatch), tick con cleanup correcto.
  - Estiramiento: separa el updater puro (decremento) del side-effect (beep/vibrar/avanzar),
    con cleanup por `[idx, pausado, terminado]`. No se detecta doble avance en lectura.
  - Descanso en sesión: dependencia booleana `[descanso > 0]`, no recrea intervalos por tick.
  Pendiente estrés en navegador (pausa/salto/desmontaje).

### General

- 🔴 **[a investigar] `Invalid hook call` en SSR de `/os` (índice).** Aparece en el log del dev
  server al renderizar `/os` tras login. Puede ser ajeno a salud (dashboard índice). Verificar
  origen y si afecta a algún island de salud.

- 🟡 **[baja] Cuerpo: tile "último registro" asume `mediciones[0]` = más reciente.** Depende de
  que el endpoint `cuerpo` GET ordene DESC por fecha. Pendiente confirmar.

---

## Hallazgos del audit de endpoints (server-side)

### Bugs de correctness

- 🔴 **[media] `comidas-log` PATCH borra los macros a null en entradas manuales.**
  `comidas-log.ts:129-140`. La rama de recálculo se dispara con `'cantidad_g' in body`. Para
  una entrada sin `alimento_id` (entrada libre), recalcula leyendo `body.kcal/...` (undefined)
  → guarda todos los macros en null (pérdida de datos silenciosa). Hoy no es disparable desde
  la UI (el front solo hace PATCH con `{tipo_dia}`), pero sí vía integración externa
  (`X-OS-Token`). Fix: solo recalcular si el `alimento_id` resuelto no es null.

- 🔴 **[media] `cuerpo` POST rechaza registrar solo sueño (o solo músculo/agua).**
  `cuerpo.ts:35-37`. El guard "al menos una medición" solo mira `peso_kg/grasa_pct/cintura_cm`.
  Pero `sueno_horas` alimenta la regla de recuperación del modo sesión. No se puede loguear
  solo sueño. El front (`OSSaludCuerpo.tsx:67`) tiene el mismo guard. Fix: incluir
  `sueno_horas` (y músculo/agua) en el guard, front y back.

- 🔴 **[baja] `comidas-log` PATCH no valida `tipo_dia` (POST sí).** `comidas-log.ts:142-143`.
  Inconsistencia; el front solo manda valores del dropdown, pero conviene validar también en
  PATCH. Fix: revalidar `tipo_dia`/`momento` en PATCH.

- 🔴 **[baja] `alimentos` por barcode: error de insert tragado por el catch de Open Food Facts.**
  `alimentos.ts:65-76`. `if (insErr) throw insErr` está dentro del `try` cuyo `catch {}` es para
  "OFF no disponible"; un fallo de insert (ej. barcode duplicado) devuelve `off_no_encontrado`
  en vez de surfacear el error. Fix: sacar el insert del try/catch del fetch.

- 🔴 **[baja] Sanitización de búsqueda ilike elimina paréntesis y rompe términos legítimos.**
  `alimentos.ts` / `ejercicios.ts`. Quita `()*`, así "leche (deslactosada)" no matchea. Sin
  riesgo de inyección (los chars estructurales se quitan). Además `ilike` es sensible a acentos
  ("cafe" ≠ "café"). Fix mínimo: no destruir paréntesis; mejora: `unaccent`.

- 🔴 **[baja] `progreso` calcula la ventana `desde` en UTC, no en Guayaquil.**
  `progreso.ts:17`. Borde de ventana puede desfasar ~1 día (fecha es local UTC-5). Fix: calcular
  `desde` en timezone Guayaquil.

- 🟡 **[baja] `comidas-log` POST exige `kcal` para entrada de solo-macros.** `comidas-log.ts:80`.
  Una entrada libre con solo proteína (sin kcal) da 400. Fix: aceptar si hay cualquier macro.

- 🟡 **[baja/defer] `ayunos` "cerrar-antes-de-crear" no es atómico.** `ayunos.ts:60-73`. Riesgo
  real bajo en un OS de un solo usuario. Fix propio: índice único parcial sobre `fin IS NULL`
  (requiere migración). Pendiente decisión.

### Verificado OK (server-side)

- `sesiones.ts` contrato con Historial: OK (setea `fecha`, ordena desc).
- `progreso.ts` nombres de campos que consume el front: OK.
- `progresion.ts`: sin división por cero / NaN / off-by-one.
- `macros.ts`: coacción y preservación de 0 correctas.
- `rutinas.ts`, `estiramiento.ts`, `config.ts`, `ejercicios.ts`: OK para correctness.
  (Notas menores no bloqueantes: delete+insert no atómicos en rutinas/sesiones; `config` sin
  constraint de fila única.)

---

## Verificación en navegador (dev :4327, mobile 375x812)

- 🟢 **Nutrición · agregar por gramos + paridad de macros.** Buscar "pollo" (12 resultados,
  incluye "Col (repollo)" por substring → confirma que los paréntesis ya no rompen la búsqueda).
  Seleccionar "Pollo entero cocido sin piel" (190 kcal/100g), poner 200 g → preview 380 kcal /
  P58 / C0 / G14.8. Al Agregar, el anillo y las barras marcan exactamente 380 / P58 / C0 / G14.8,
  y el log lo lista igual. La entrada guardada coincide con el preview: paridad correcta.
- 🟢 **Nutrición · cambiar tipo de día (fix).** Al cambiar el selector con una comida cargada:
  PATCH 200 a la entrada + GET `?dia=` de reload (mi fix con await+reload). Sin errores.
- 🟢 **Búsqueda sin acentos (fix + migración).** `?q=café` (con acento) encuentra "Cafe negro"
  (sin acento). `?q=cafe` idem. Filtros de ejercicios combinan (press=18, Pecho=11, ambos=3).
- 🟢 **Cuerpo · registrar solo sueño (fix).** POST `{sueno_horas:7}` → 201 (antes 400).
- 🟢 **Entrenamiento · modo sesión completo.** Iniciar "Full Body Casa" (12 sets), completar
  set 1 → avanza a 2/12 y aparece timer de DESCANSO 1:30 contando 1/s (sin doble decremento).
  Terminar → RPE 8 + notas → Guardar → aparece en Historial "Gym · 15 jul · 12 sets · 1 min ·
  RPE 8" (fecha correcta, confirma el contrato de `sesiones`).
- 🟢 **Estiramiento · cronómetro paso a paso.** "Post-entreno 5 min" (6 pasos → 11 sub-pasos por
  lado). Contador decrementa 1/s en el mismo paso (24→13, sigue 1/11). "Saltar" avanza exactamente
  1/11 → 2/11: sin doble avance. Expansión izquierdo/derecho correcta.

Nota de método: el click sintético del navegador no siempre dispara el `onClick` de React; se
usó click por JS como respaldo. No es un bug de la app (los handlers responden bien). Todos los
datos de prueba creados en Supabase se borraron al terminar (comidas_log, cuerpo_log, sesiones
en 0 para hoy).

## Migraciones aplicadas (Supabase yfrrfmankgodpepbgyvu)

- `20260716000000_salud_qa_busqueda_ayuno.sql` (aplicada por MCP y versionada):
  - `unaccent` en schema `extensions` + RPC `buscar_alimentos` / `buscar_ejercicios`
    (STABLE, parametrizados, `extensions.unaccent` calificado). Reemplaza el ilike frágil.
  - Índice único parcial `ayunos_un_solo_abierto` sobre `(fin is null)` (0 ayunos abiertos
    al momento, sin limpieza necesaria).

## Fuera de alcance (anotado, no tocado)

- `Invalid hook call` en el SSR de `/os` (índice del OS, no del módulo salud): aparece una vez
  al render de `/os`, nunca en `/os/salud/*`. Pertenece al shell/dashboard del OS. No se tocó
  por la regla de no modificar otros módulos. Vale la pena revisarlo aparte.
- `comidas-log` POST exige `kcal` para entrada de solo-macros: ya cubierto (ahora acepta
  cualquier macro).
