export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase';
import { isOsAuthorized, json } from '../../../../os/lib/osAuth';
import { errMsg, numOrNull, isExternalTokenAuthorized } from '../../../../lib/salud/apiHelpers';
import { registrarEvento } from '../../../../lib/juego/motor';

const PROTOCOLOS = ['16_8', '18_6', '20_4', 'omad', 'extendido', 'custom'];
// Horas objetivo por defecto según protocolo.
const OBJETIVO_POR_PROTOCOLO: Record<string, number> = {
  '16_8': 16, '18_6': 18, '20_4': 20, omad: 23, extendido: 36, custom: 16,
};

export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const { url } = context;
  try {
    const sb = getSupabaseServer();

    // Ayuno abierto (sin fin). Usado por Nutrición para ofrecer cierre.
    if (url.searchParams.get('abierto') === '1') {
      const { data, error } = await sb
        .from('ayunos')
        .select('*')
        .is('fin', null)
        .order('inicio', { ascending: false })
        .limit(1);
      if (error) throw error;
      return json({ ayuno: data?.[0] ?? null });
    }

    // Historial completo.
    const { data, error } = await sb
      .from('ayunos')
      .select('*')
      .order('inicio', { ascending: false });
    if (error) throw error;
    return json({ ayunos: data ?? [] });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const POST: APIRoute = async (context) => {
  // Escritura externa (agente/telegram) permitida vía X-OS-Token.
  if (!isOsAuthorized(context) && !isExternalTokenAuthorized(context)) {
    return json({ error: 'Unauthorized' }, 401);
  }
  try {
    const body = await context.request.json();
    const protocolo = body.protocolo?.trim() || '16_8';
    if (!PROTOCOLOS.includes(protocolo)) {
      return json({ error: `protocolo debe ser uno de: ${PROTOCOLOS.join(', ')}` }, 400);
    }
    const objetivo = numOrNull(body.objetivo_horas) ?? OBJETIVO_POR_PROTOCOLO[protocolo] ?? 16;

    const sb = getSupabaseServer();

    // Cierra cualquier ayuno abierto antes de iniciar uno nuevo (no solapar).
    await sb.from('ayunos').update({ fin: new Date().toISOString() }).is('fin', null);

    const { data, error } = await sb
      .from('ayunos')
      .insert([{
        inicio: body.inicio?.trim() || new Date().toISOString(),
        fin: body.fin?.trim() || null,
        protocolo,
        objetivo_horas: objetivo,
        notas: body.notas?.trim() || null,
        source: body.source?.trim() || 'manual',
      }])
      .select()
      .single();
    if (error) throw error;
    return json({ ayuno: data }, 201);
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const PATCH: APIRoute = async (context) => {
  if (!isOsAuthorized(context) && !isExternalTokenAuthorized(context)) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const id = context.url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const body = await context.request.json();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if ('inicio' in body) patch.inicio = body.inicio || null;
    if ('fin' in body) patch.fin = body.fin || null;
    if ('notas' in body) patch.notas = body.notas?.trim() || null;
    if ('objetivo_horas' in body) patch.objetivo_horas = numOrNull(body.objetivo_horas);
    if ('protocolo' in body) {
      if (!PROTOCOLOS.includes(body.protocolo)) return json({ error: 'protocolo inválido' }, 400);
      patch.protocolo = body.protocolo;
    }
    const sb = getSupabaseServer();
    const { data, error } = await sb.from('ayunos').update(patch).eq('id', id).select().single();
    if (error) throw error;
    if ('fin' in patch && patch.fin) {
      registrarEvento(sb, { tipo: 'ayuno_fin', ref_tabla: 'ayunos', ref_id: id }).catch(() => null);
    }
    return json({ ayuno: data });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const DELETE: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const id = context.url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const sb = getSupabaseServer();
    const { error } = await sb.from('ayunos').delete().eq('id', id);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
