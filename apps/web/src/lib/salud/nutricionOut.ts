/**
 * Mapeo de una fila de `comidas_log` al DataPoint `nutritionLog` de la Google
 * Health API v4, y a la forma equivalente del food log de la Fitbit Web API
 * legacy (plan B mientras esa API siga viva, hasta el 30 de septiembre de 2026).
 *
 * Logica pura, sin acceso a red ni a Supabase, para poder testearla con el
 * runner nativo de Node igual que el resto de `src/lib/salud/`.
 *
 * Contrato completo en `apps/web/docs/contrato-nutricion-out.md`.
 */

/** Ecuador continental no aplica horario de verano: UTC-05:00 todo el ano. */
export const OFFSET_GUAYAQUIL = '-18000s';
const OFFSET_ISO = '-05:00';

/** momento del OS -> mealType de Google Health. */
const MEAL_TYPE: Record<string, string> = {
  desayuno: 'BREAKFAST',
  almuerzo: 'LUNCH',
  cena: 'DINNER',
  snack: 'SNACK',
};

/**
 * Hora canonica por momento cuando no se puede usar `created_at` (por ejemplo
 * una comida registrada al dia siguiente, o un backfill). Google Health exige
 * un intervalo real; inventar 00:00 para todo amontonaria el dia entero a
 * medianoche y romperia el orden en la app.
 */
const HORA_CANONICA: Record<string, string> = {
  desayuno: '08:00:00',
  almuerzo: '13:00:00',
  cena: '20:00:00',
  snack: '16:00:00',
};

/** Duracion asumida de una comida. La API pide intervalo, no instante. */
const DURACION_MIN = 20;

export interface ComidaLog {
  id: string;
  fecha: string;
  momento: string;
  created_at?: string | null;
  descripcion_libre?: string | null;
  alimento_nombre?: string | null;
  cantidad_g?: number | null;
  kcal?: number | null;
  proteina_g?: number | null;
  carbos_g?: number | null;
  grasa_g?: number | null;
  fibra_g?: number | null;
  azucares_g?: number | null;
  saturada_g?: number | null;
  monoinsaturada_g?: number | null;
  poliinsaturada_g?: number | null;
  sodio_mg?: number | null;
  colesterol_mg?: number | null;
  source?: string | null;
}

/**
 * Fuentes que NO se empujan hacia afuera nunca. Un registro que nacio en
 * Google o en Fitbit y se devuelve al mismo sistema es exactamente el bucle de
 * realimentacion que hay que evitar. Hoy `comidas_log` solo acepta manual,
 * telegram y agente, asi que la lista es defensiva: protege contra un source
 * externo que se agregue mas adelante sin que nadie recuerde esta regla.
 */
export const SOURCES_NO_EMPUJABLES = ['google', 'google_health', 'fitbit'];

export function esEmpujable(comida: Pick<ComidaLog, 'source'>): boolean {
  const s = (comida.source ?? '').trim().toLowerCase();
  return !SOURCES_NO_EMPUJABLES.includes(s);
}

/** Fecha-hora ISO con offset de Guayaquil, sumando `minutos` si se pide. */
function isoGuayaquil(fecha: string, hora: string, minutos = 0): string {
  const base = new Date(`${fecha}T${hora}${OFFSET_ISO}`);
  if (Number.isNaN(base.getTime())) throw new Error(`fecha/hora invalida: ${fecha}T${hora}`);
  base.setUTCMinutes(base.getUTCMinutes() + minutos);
  return base.toISOString();
}

/**
 * Intervalo del registro. Usa `created_at` solo si cae en el mismo dia
 * calendario que `fecha` en Guayaquil; si no, la hora canonica del momento.
 */
export function intervaloComida(comida: ComidaLog) {
  let startTime: string;
  const creado = comida.created_at ? new Date(comida.created_at) : null;
  const mismoDia =
    creado &&
    !Number.isNaN(creado.getTime()) &&
    creado.toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' }) === comida.fecha;

  if (mismoDia && creado) {
    startTime = creado.toISOString();
  } else {
    const hora = HORA_CANONICA[comida.momento] ?? HORA_CANONICA.snack;
    startTime = isoGuayaquil(comida.fecha, hora);
  }

  const fin = new Date(startTime);
  fin.setUTCMinutes(fin.getUTCMinutes() + DURACION_MIN);

  return {
    startTime,
    endTime: fin.toISOString(),
    startUtcOffset: OFFSET_GUAYAQUIL,
    endUtcOffset: OFFSET_GUAYAQUIL,
  };
}

/** Nombre visible del registro en la app de Google Health / Fitbit. */
export function nombreVisible(comida: ComidaLog): string {
  const n = comida.alimento_nombre?.trim() || comida.descripcion_libre?.trim();
  if (n) return comida.cantidad_g ? `${n} (${Math.round(comida.cantidad_g)} g)` : n;
  return `Comida del OS (${comida.momento})`;
}

function gramos(v: number | null | undefined) {
  return v == null ? null : { grams: v };
}

/**
 * Nutrientes individuales. Solo se mandan los que existen: un `nutrients` con
 * ceros inventados ensucia el historico y no se distingue de un dato medido.
 */
export function nutrientes(comida: ComidaLog) {
  const mapa: Array<[string, number | null | undefined]> = [
    ['PROTEIN', comida.proteina_g],
    ['CARBOHYDRATES', comida.carbos_g],
    ['DIETARY_FIBER', comida.fibra_g],
    ['SUGAR', comida.azucares_g],
    ['SATURATED_FAT', comida.saturada_g],
    ['MONOUNSATURATED_FAT', comida.monoinsaturada_g],
    ['POLYUNSATURATED_FAT', comida.poliinsaturada_g],
    // sodio y colesterol vienen en mg en el OS; la API los pide en gramos.
    ['SODIUM', comida.sodio_mg == null ? null : comida.sodio_mg / 1000],
    ['CHOLESTEROL', comida.colesterol_mg == null ? null : comida.colesterol_mg / 1000],
  ];
  return mapa
    .filter(([, v]) => v != null)
    .map(([nutrient, v]) => ({ nutrient, quantity: { grams: v as number } }));
}

/**
 * DataPoint listo para `POST users/me/dataTypes/nutrition-log/dataPoints`.
 *
 * El `name` lleva el id de la fila del OS. La API acepta ids de data point
 * provistos por el cliente, asi que reenviar la misma comida apunta al mismo
 * data point en vez de crear uno nuevo: idempotencia por construccion, sin
 * necesidad de consultar antes si ya existe.
 *
 * Se usa food anonimo (`foodDisplayName` + macros manuales) porque el catalogo
 * de alimentos del OS es propio y no tiene equivalencia en el catalogo de
 * Google. Consecuencia documentada por Google: los logs anonimos no son
 * editables despues de creados.
 */
export function comidaANutritionLog(comida: ComidaLog, healthUserId = 'me') {
  const nl: Record<string, unknown> = {
    interval: intervaloComida(comida),
    foodDisplayName: nombreVisible(comida),
    mealType: MEAL_TYPE[comida.momento] ?? 'ANYTIME',
  };
  if (comida.kcal != null) nl.energy = { kcal: comida.kcal };
  const carbos = gramos(comida.carbos_g);
  if (carbos) nl.totalCarbohydrate = carbos;
  const grasa = gramos(comida.grasa_g);
  if (grasa) nl.totalFat = grasa;
  const nut = nutrientes(comida);
  if (nut.length) nl.nutrients = nut;

  return {
    name: `users/${healthUserId}/dataTypes/nutrition-log/dataPoints/${comida.id}`,
    nutritionLog: nl,
  };
}

/**
 * Equivalente para la Fitbit Web API legacy (`POST /1/user/-/foods/log.json`,
 * form-urlencoded). Solo se usa si la escritura de nutricion en Google Health
 * resulta no funcionar. Muere con esa API el 30 de septiembre de 2026.
 */
export function comidaAFitbitFoodLog(comida: ComidaLog) {
  const MEAL_TYPE_ID: Record<string, number> = { desayuno: 1, almuerzo: 3, cena: 5, snack: 7 };
  return {
    foodName: nombreVisible(comida),
    mealTypeId: MEAL_TYPE_ID[comida.momento] ?? 7,
    date: comida.fecha,
    amount: comida.cantidad_g ?? 1,
    unitId: 147, // gramo
    calories: comida.kcal == null ? undefined : Math.round(comida.kcal),
    protein: comida.proteina_g ?? undefined,
    totalCarbohydrate: comida.carbos_g ?? undefined,
    totalFat: comida.grasa_g ?? undefined,
    dietaryFiber: comida.fibra_g ?? undefined,
    sodium: comida.sodio_mg ?? undefined,
  };
}
