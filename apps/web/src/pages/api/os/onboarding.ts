export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../lib/supabase';
import { isOsAuthorized, json } from '../../../os/lib/osAuth';
import { errMsg } from '../../../lib/salud/apiHelpers';

type SB = ReturnType<typeof getSupabaseServer>;

// GET ?modulo=X → estado del onboarding de ese modulo (o null si nunca se toco).
export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const modulo = context.url.searchParams.get('modulo');
  if (!modulo) return json({ error: 'modulo requerido' }, 400);
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('onboarding_estado')
      .select('*')
      .eq('modulo', modulo)
      .maybeSingle();
    if (error) throw error;
    return json({ estado: data ?? null });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

// Deriva y escribe la config de Salud a partir de las respuestas del onboarding
// del modulo 'salud'. Escribe defensivamente: si la columna `ayuno_objetivo_h`
// (agregada por otra migracion en paralelo, ver 20260720000100_ayuno_objetivo_default.sql)
// todavia no existe en la base contra la que corre esto, reintenta sin las columnas
// de ayuno y deja constancia en la respuesta via `nota`.
async function aplicarSalud(sb: SB, respuestas: Record<string, any>): Promise<{ config: unknown; nota?: string }> {
  const r = respuestas ?? {};

  const pesoActual = r.peso_actual ?? {};
  const targets = r.targets ?? {};
  const unidadFinal = r.unidad ?? pesoActual.unidad ?? 'kg';

  const patchBase: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (targets.kcal != null) patchBase.kcal_objetivo = Math.round(targets.kcal);
  if (targets.proteina_g != null) patchBase.proteina_objetivo_g = Math.round(targets.proteina_g);
  if (targets.carbos_g != null) patchBase.carbos_objetivo_g = Math.round(targets.carbos_g);
  if (targets.grasa_g != null) patchBase.grasa_objetivo_g = Math.round(targets.grasa_g);
  if (unidadFinal === 'kg' || unidadFinal === 'lb') patchBase.unidad_peso = unidadFinal;

  // Ayuno: la columna real es salud_config.protocolo_ayuno_default (token legacy
  // '16_8', no '16:8') + salud_config.ayuno_objetivo_h para las horas (ver
  // apps/web/src/pages/api/os/salud/config.ts, fuente de verdad de este mapeo).
  // 'sin_ayuno' es una respuesta valida del onboarding pero no un preset de
  // salud_config: en ese caso no se escribe nada, se deja la config como estaba.
  const TOKEN_ONBOARDING_A_CONFIG: Record<string, string> = { '16:8': '16_8', '24h': '24h', '36h': '36h' };
  const HORAS_POR_PROTOCOLO: Record<string, number> = { '16_8': 16, '24h': 24, '36h': 36 };
  const protocoloAyuno = TOKEN_ONBOARDING_A_CONFIG[r.protocolo_ayuno as string];
  const patchAyuno: Record<string, unknown> = {};
  if (protocoloAyuno) {
    patchAyuno.protocolo_ayuno_default = protocoloAyuno;
    patchAyuno.ayuno_objetivo_h = HORAS_POR_PROTOCOLO[protocoloAyuno];
  }

  // Config es singleton (misma convencion que api/os/salud/config.ts): lee o crea.
  const { data: existente, error: errLeer } = await sb
    .from('salud_config')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1);
  if (errLeer) throw errLeer;
  let configId = existente?.[0]?.id as string | undefined;
  if (!configId) {
    const { data: creado, error: errCrear } = await sb.from('salud_config').insert([{}]).select('id').single();
    if (errCrear) throw errCrear;
    configId = creado.id;
  }

  try {
    const { data, error } = await sb
      .from('salud_config')
      .update({ ...patchBase, ...patchAyuno })
      .eq('id', configId)
      .select()
      .single();
    if (error) throw error;
    return { config: data };
  } catch (errConAyuno) {
    if (!Object.keys(patchAyuno).length) throw errConAyuno;
    // Reintenta sin las columnas de ayuno (todavia no aplicadas en esta base).
    const { data, error } = await sb
      .from('salud_config')
      .update(patchBase)
      .eq('id', configId)
      .select()
      .single();
    if (error) throw error;
    return {
      config: data,
      nota: 'Las columnas de protocolo de ayuno no existian todavia; se aplicaron el resto de los targets. Vuelve a intentar "aplicar" tras la siguiente migracion.',
    };
  }
}

// POST { modulo, paso?, respuestas? (merge sobre lo existente), completado? }
//   → upsert de onboarding_estado por modulo.
// POST { aplicar: 'salud' }
//   → toma las respuestas guardadas del modulo 'salud' y escribe la config derivada.
export const POST: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  let body: Record<string, any>;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  const sb = getSupabaseServer();

  if (body.aplicar === 'salud') {
    try {
      const { data: estado, error } = await sb
        .from('onboarding_estado')
        .select('respuestas')
        .eq('modulo', 'salud')
        .maybeSingle();
      if (error) throw error;
      const resultado = await aplicarSalud(sb, estado?.respuestas ?? {});
      return json({ ok: true, ...resultado });
    } catch (err) {
      return json({ error: errMsg(err) }, 502);
    }
  }

  const modulo = typeof body.modulo === 'string' ? body.modulo.trim() : '';
  if (!modulo) return json({ error: 'modulo requerido' }, 400);

  try {
    const { data: actual, error: errActual } = await sb
      .from('onboarding_estado')
      .select('respuestas, paso')
      .eq('modulo', modulo)
      .maybeSingle();
    if (errActual) throw errActual;

    const respuestasMerge = {
      ...(actual?.respuestas ?? {}),
      ...(body.respuestas && typeof body.respuestas === 'object' ? body.respuestas : {}),
    };

    const patch: Record<string, unknown> = {
      modulo,
      respuestas: respuestasMerge,
      updated_at: new Date().toISOString(),
    };
    if (typeof body.paso === 'number') patch.paso = body.paso;
    else if (actual?.paso != null) patch.paso = actual.paso;
    if (body.completado === true) patch.completado_at = new Date().toISOString();

    const { data, error } = await sb
      .from('onboarding_estado')
      .upsert(patch, { onConflict: 'modulo' })
      .select()
      .single();
    if (error) throw error;
    return json({ estado: data });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
