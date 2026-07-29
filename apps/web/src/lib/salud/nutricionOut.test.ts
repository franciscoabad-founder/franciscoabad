import test from 'node:test';
import assert from 'node:assert/strict';
import {
  comidaANutritionLog,
  comidaAFitbitFoodLog,
  esEmpujable,
  intervaloComida,
  nombreVisible,
  nutrientes,
  OFFSET_GUAYAQUIL,
  type ComidaLog,
} from './nutricionOut.ts';

const BASE: ComidaLog = {
  id: 'a1b2c3d4-e5f6-4890-9234-567890abcdef',
  fecha: '2026-07-27',
  momento: 'almuerzo',
  created_at: null,
  alimento_nombre: 'Arroz con menestra',
  cantidad_g: 350,
  kcal: 620,
  proteina_g: 24,
  carbos_g: 88,
  grasa_g: 18,
  fibra_g: 9,
  sodio_mg: 480,
  colesterol_mg: 30,
  source: 'manual',
};

test('el name del data point lleva el id del OS (idempotencia por construccion)', () => {
  const dp = comidaANutritionLog(BASE);
  assert.equal(dp.name, `users/me/dataTypes/nutrition-log/dataPoints/${BASE.id}`);
  // Dos llamadas producen el mismo nombre: reenviar no duplica.
  assert.equal(dp.name, comidaANutritionLog(BASE).name);
});

test('mapea macros y mealType', () => {
  const { nutritionLog } = comidaANutritionLog(BASE) as { nutritionLog: Record<string, any> };
  assert.equal(nutritionLog.mealType, 'LUNCH');
  assert.deepEqual(nutritionLog.energy, { kcal: 620 });
  assert.deepEqual(nutritionLog.totalCarbohydrate, { grams: 88 });
  assert.deepEqual(nutritionLog.totalFat, { grams: 18 });
});

test('sodio y colesterol se convierten de mg a gramos', () => {
  const n = nutrientes(BASE);
  assert.deepEqual(n.find((x) => x.nutrient === 'SODIUM'), { nutrient: 'SODIUM', quantity: { grams: 0.48 } });
  assert.deepEqual(n.find((x) => x.nutrient === 'CHOLESTEROL'), { nutrient: 'CHOLESTEROL', quantity: { grams: 0.03 } });
});

test('los nutrientes ausentes no se mandan como cero', () => {
  const n = nutrientes({ ...BASE, fibra_g: null, sodio_mg: null });
  assert.ok(!n.some((x) => x.nutrient === 'DIETARY_FIBER'));
  assert.ok(!n.some((x) => x.nutrient === 'SODIUM'));
});

test('sin created_at usa la hora canonica del momento en offset de Guayaquil', () => {
  const iv = intervaloComida(BASE);
  assert.equal(iv.startTime, '2026-07-27T18:00:00.000Z'); // 13:00 -05:00
  assert.equal(iv.endTime, '2026-07-27T18:20:00.000Z');
  assert.equal(iv.startUtcOffset, OFFSET_GUAYAQUIL);
  assert.equal(iv.endUtcOffset, OFFSET_GUAYAQUIL);
});

test('con created_at del mismo dia usa la hora real', () => {
  const iv = intervaloComida({ ...BASE, created_at: '2026-07-27T17:42:00.000Z' });
  assert.equal(iv.startTime, '2026-07-27T17:42:00.000Z');
});

test('created_at de otro dia calendario no se usa (backfill)', () => {
  // 2026-07-28T04:00Z son las 23:00 del 27 en Guayaquil: mismo dia, si se usa.
  assert.equal(
    intervaloComida({ ...BASE, created_at: '2026-07-28T04:00:00.000Z' }).startTime,
    '2026-07-28T04:00:00.000Z',
  );
  // 2026-07-29T18:00Z es el 29 en Guayaquil: distinto dia, cae a la canonica.
  assert.equal(
    intervaloComida({ ...BASE, created_at: '2026-07-29T18:00:00.000Z' }).startTime,
    '2026-07-27T18:00:00.000Z',
  );
});

test('nombre visible: alimento con gramos, luego descripcion libre, luego fallback', () => {
  assert.equal(nombreVisible(BASE), 'Arroz con menestra (350 g)');
  assert.equal(
    nombreVisible({ ...BASE, alimento_nombre: null, descripcion_libre: 'Ceviche', cantidad_g: null }),
    'Ceviche',
  );
  assert.equal(
    nombreVisible({ ...BASE, alimento_nombre: null, descripcion_libre: null, cantidad_g: null }),
    'Comida del OS (almuerzo)',
  );
});

test('nunca se empuja hacia afuera un registro de origen externo', () => {
  assert.equal(esEmpujable({ source: 'manual' }), true);
  assert.equal(esEmpujable({ source: 'telegram' }), true);
  assert.equal(esEmpujable({ source: 'google' }), false);
  assert.equal(esEmpujable({ source: 'google_health' }), false);
  assert.equal(esEmpujable({ source: 'FITBIT' }), false);
});

test('mapeo Fitbit legacy', () => {
  const f = comidaAFitbitFoodLog(BASE);
  assert.equal(f.mealTypeId, 3);
  assert.equal(f.date, '2026-07-27');
  assert.equal(f.calories, 620);
  assert.equal(f.unitId, 147);
});
