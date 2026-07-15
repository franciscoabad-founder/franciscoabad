export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase';
import { isOsAuthorized, json } from '../../../../os/lib/osAuth';
import { errMsg } from '../../../../lib/salud/apiHelpers';

// Devuelve los datos crudos para analytics de progreso. La lógica (progressIndex,
// sugerenciaOverload, e1RM, promedio móvil) vive en src/lib/salud/progresion.ts y la
// consumen la UI de progreso y el modo sesión activa (una sola fuente de verdad testeada).
export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const { url } = context;
  try {
    const sb = getSupabaseServer();
    const dias = Number(url.searchParams.get('dias')) || 120;
    const desde = new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10);

    // Sets con datos de ejercicio y fecha de sesión.
    const { data: sesiones, error } = await sb
      .from('sesiones')
      .select('id, fecha, sets_log(reps, peso_kg, tipo_set, ejercicio_id, ejercicio:ejercicios(nombre, patron, grupo_muscular_primario))')
      .gte('fecha', desde)
      .order('fecha', { ascending: true });
    if (error) throw error;

    interface SetRow {
      ejercicio_id: string; ejercicio_nombre: string; grupo: string | null;
      patron: string | null; reps: number | null; peso_kg: number | null;
      tipo_set: string; fecha: string;
    }
    const sets: SetRow[] = [];
    for (const s of sesiones ?? []) {
      for (const sl of (s as any).sets_log ?? []) {
        sets.push({
          ejercicio_id: sl.ejercicio_id,
          ejercicio_nombre: sl.ejercicio?.nombre ?? 'Ejercicio',
          grupo: sl.ejercicio?.grupo_muscular_primario ?? null,
          patron: sl.ejercicio?.patron ?? null,
          reps: sl.reps, peso_kg: sl.peso_kg, tipo_set: sl.tipo_set,
          fecha: (s as any).fecha,
        });
      }
    }

    // Serie de peso corporal (para promedio móvil de 7 días en el cliente).
    const { data: cuerpo, error: errCuerpo } = await sb
      .from('cuerpo_log')
      .select('fecha, peso_kg, sueno_horas')
      .gte('fecha', desde)
      .order('fecha', { ascending: true });
    if (errCuerpo) throw errCuerpo;

    return json({ sets, cuerpo: cuerpo ?? [] });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
