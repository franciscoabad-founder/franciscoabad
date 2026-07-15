// Recompensas por evento del motor transversal (Version B). Logica pura, testeable
// con node:test. Traduce cada tipo de evento gamificable a {xp, oro}.

import { recompensaCheck, type Dificultad } from '../habitos/scoring.ts';

export type TipoEvento =
  | 'habito_check'
  | 'diaria_check'
  | 'diaria_fallo'
  | 'tarea_hecha'
  | 'pendiente_hecho'
  | 'comida_log'
  | 'sesion_gym'
  | 'ayuno_fin'
  | 'registro_cuerpo'
  | 'dia_perfecto'
  | 'quest_ganada'
  | 'quest_perdida'
  | 'compra_recompensa'
  | 'loot'
  | 'muerte'
  | 'ajuste';

export type Prioridad = 'low' | 'medium' | 'high' | 'critical';

export interface RecompensaMeta {
  prioridad?: Prioridad;
  dificultad?: Dificultad;
  valor?: number;
}

export interface Recompensa {
  xp: number;
  oro: number;
}

const round = (n: number) => Math.round(n);

// Base por prioridad de tarea (task value plano, sin factor anti-farming: las tareas
// no llevan valor acumulado como los habitos).
const XP_TAREA: Record<Prioridad, number> = {
  low: 5,
  medium: 10,
  high: 15,
  critical: 25,
};

const SIN_RECOMPENSA: Recompensa = { xp: 0, oro: 0 };

/**
 * XP y oro otorgados por un evento gamificable. Los eventos que traen su monto ya
 * calculado en otro lado (compra, ajuste, muerte, loot, quest_*) devuelven {0,0}
 * a proposito: el llamador pasa xp/oro explicitos en vez de derivarlos de aqui.
 */
export function recompensaPorEvento(tipo: TipoEvento, meta: RecompensaMeta = {}): Recompensa {
  switch (tipo) {
    case 'tarea_hecha': {
      const xp = XP_TAREA[meta.prioridad ?? 'medium'] ?? XP_TAREA.medium;
      return { xp, oro: round(xp / 2) };
    }
    case 'pendiente_hecho':
      return { xp: 8, oro: round(8 / 2) };
    case 'sesion_gym':
      return { xp: 30, oro: round(30 / 2) };
    case 'ayuno_fin':
      return { xp: 20, oro: round(20 / 2) };
    case 'comida_log':
      return { xp: 5, oro: round(5 / 2) };
    case 'registro_cuerpo':
      return { xp: 5, oro: round(5 / 2) };
    case 'dia_perfecto':
      return { xp: 25, oro: round(25 / 2) };
    case 'habito_check':
    case 'diaria_check': {
      const dificultad = meta.dificultad ?? 'facil';
      const valor = meta.valor ?? 0;
      return recompensaCheck(valor, dificultad);
    }
    case 'diaria_fallo':
    case 'quest_ganada':
    case 'quest_perdida':
    case 'compra_recompensa':
    case 'loot':
    case 'muerte':
    case 'ajuste':
      return SIN_RECOMPENSA;
    default:
      return SIN_RECOMPENSA;
  }
}
