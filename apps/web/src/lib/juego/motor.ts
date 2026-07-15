// Motor transversal de gamificacion (Version B): unico modulo con IO de lib/juego.
// Fire-and-forget: los call sites lo invocan con `.catch(() => null)` tras el insert
// exitoso del endpoint; si el motor falla, el endpoint ya respondio igual. NO testeado
// con node:test (requiere Supabase); la logica pura que usa (recompensas/hp/loot/nivel)
// si esta cubierta.

import { nivelDesdeXp } from './nivel.ts';
import { recompensaPorEvento, type TipoEvento, type RecompensaMeta } from './recompensas.ts';
import { danioPorFallo, aplicarMuerte } from './hp.ts';
import { tirarLoot, type Loot } from './loot.ts';
import { hoyLocal } from '../habitos/fechas.ts';
import type { Dificultad } from '../habitos/scoring.ts';

export interface EventoEntrada {
  tipo: TipoEvento;
  ref_tabla?: string;
  ref_id?: string;
  fecha?: string;
  meta?: RecompensaMeta & Record<string, unknown>;
  /** xp/oro/hp explicitos: usados cuando el llamador ya calculo el monto (compra,
   * ajuste, muerte, loot, quest_*) en vez de derivarlo de recompensaPorEvento. */
  xp?: number;
  oro?: number;
  hp?: number;
}

export interface ResultadoEvento {
  xp: number;
  oro: number;
  hp: number;
  nivel: number;
  subioNivel: boolean;
  loot?: Loot;
  muerte?: { oroPerdido: number };
}

interface JugadorRow {
  id: string;
  xp_total: number;
  oro: number;
  hp: number;
  hp_max: number;
  config: { hp_activo?: boolean; oro_activo?: boolean; loot_activo?: boolean };
}

// Tipos minimos de cliente Supabase que el motor necesita (evita atar la lib a
// @supabase/supabase-js como dependencia directa de tipos).
interface SupabaseLike {
  from: (tabla: string) => any;
}

/**
 * Registra un evento gamificable: calcula xp/oro (salvo que vengan explicitos),
 * inserta en xp_events (idempotente via unique parcial tipo+ref_id), tira loot,
 * aplica dano/muerte si corresponde, y actualiza el estado agregado de `jugador`.
 * Devuelve null si el evento ya habia sido otorgado (colision de unique).
 */
export async function registrarEvento(
  sb: SupabaseLike,
  ev: EventoEntrada,
  rng: () => number = Math.random,
): Promise<ResultadoEvento | null> {
  const { data: jugadorRows, error: errJugador } = await sb
    .from('jugador')
    .select('id, xp_total, oro, hp, hp_max, config')
    .limit(1);
  if (errJugador || !jugadorRows || jugadorRows.length === 0) return null;

  const jugador = jugadorRows[0] as JugadorRow;
  const config = jugador.config ?? {};
  const hpActivo = config.hp_activo !== false;
  const oroActivo = config.oro_activo !== false;
  const lootActivo = config.loot_activo !== false;

  const meta = ev.meta ?? {};
  const calculado = recompensaPorEvento(ev.tipo, meta);
  let xp = ev.xp ?? calculado.xp;
  let oro = ev.oro ?? calculado.oro;
  if (!oroActivo) oro = 0;

  let hpDelta = ev.hp ?? 0;
  if ((ev.tipo === 'diaria_fallo') && hpActivo && hpDelta === 0) {
    const dificultad = (meta.dificultad ?? 'facil') as Dificultad;
    const valor = meta.valor ?? 0;
    hpDelta = -danioPorFallo(dificultad, valor);
  }
  if (!hpActivo) hpDelta = 0;

  const fecha = ev.fecha ?? hoyLocal();

  const { error: errInsert } = await sb.from('xp_events').insert({
    tipo: ev.tipo,
    ref_tabla: ev.ref_tabla ?? null,
    ref_id: ev.ref_id ?? null,
    xp,
    oro,
    hp: hpDelta,
    fecha,
    meta,
  });

  if (errInsert) {
    // 23505 = violacion de unique (tipo, ref_id): el evento ya fue otorgado antes.
    if ((errInsert as { code?: string }).code === '23505') return null;
    return null;
  }

  let loot: Loot | undefined;
  if (lootActivo && ev.tipo !== 'loot') {
    const racha = typeof meta.valor === 'number' ? meta.valor : 0;
    const tirada = tirarLoot(rng, { racha });
    if (tirada) {
      loot = tirada;
      oro += tirada.oro;
      await sb.from('xp_events').insert({
        tipo: 'loot',
        xp: 0,
        oro: tirada.oro,
        hp: 0,
        fecha,
        meta: { mensaje: tirada.mensaje },
      });
    }
  }

  let hpNuevo = Math.min(jugador.hp_max, Math.max(0, jugador.hp + hpDelta));
  let oroTotal = jugador.oro + oro;
  let muerte: ResultadoEvento['muerte'];

  if (hpNuevo <= 0 && hpActivo) {
    const { oroPerdido, hpNuevo: hpRestaurado } = aplicarMuerte(oroTotal, jugador.hp_max);
    oroTotal = Math.max(0, oroTotal - oroPerdido);
    hpNuevo = hpRestaurado;
    muerte = { oroPerdido };
    await sb.from('xp_events').insert({
      tipo: 'muerte',
      xp: 0,
      oro: -oroPerdido,
      hp: 0,
      fecha,
      meta: {},
    });
  }

  const xpTotalNuevo = jugador.xp_total + xp;
  const nivelAntes = nivelDesdeXp(jugador.xp_total).nivel;
  const nivelInfo = nivelDesdeXp(xpTotalNuevo);

  await sb
    .from('jugador')
    .update({ xp_total: xpTotalNuevo, oro: oroTotal, hp: hpNuevo, updated_at: new Date().toISOString() })
    .eq('id', jugador.id);

  return {
    xp,
    oro,
    hp: hpNuevo,
    nivel: nivelInfo.nivel,
    subioNivel: nivelInfo.nivel > nivelAntes,
    loot,
    muerte,
  };
}
