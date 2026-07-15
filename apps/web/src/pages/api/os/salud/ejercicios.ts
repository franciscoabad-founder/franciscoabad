export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase';
import { isOsAuthorized, json } from '../../../../os/lib/osAuth';
import { errMsg } from '../../../../lib/salud/apiHelpers';

const PATRONES = ['push_h', 'push_v', 'pull_h', 'pull_v', 'squat', 'hinge', 'core', 'otro'];

export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const { url } = context;
  try {
    const sb = getSupabaseServer();
    let q = sb.from('ejercicios').select('*').order('nombre', { ascending: true });
    const texto = url.searchParams.get('q')?.trim();
    const grupo = url.searchParams.get('grupo')?.trim();
    const patron = url.searchParams.get('patron')?.trim();
    if (texto) q = q.or(`nombre.ilike.%${texto}%,nombre_en.ilike.%${texto}%`);
    if (grupo) q = q.eq('grupo_muscular_primario', grupo);
    if (patron) q = q.eq('patron', patron);
    const { data, error } = await q.limit(500);
    if (error) throw error;
    return json({ ejercicios: data ?? [] });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const POST: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await context.request.json();
    if (!body.nombre?.trim()) return json({ error: 'nombre requerido' }, 400);
    if (body.patron && !PATRONES.includes(body.patron)) {
      return json({ error: 'patron inválido' }, 400);
    }
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('ejercicios')
      .insert([{
        nombre: body.nombre.trim(),
        nombre_en: body.nombre_en?.trim() || null,
        grupo_muscular_primario: body.grupo_muscular_primario?.trim() || null,
        secundarios: Array.isArray(body.secundarios) ? body.secundarios : [],
        patron: body.patron || null,
        equipamiento: body.equipamiento?.trim() || null,
        instrucciones: body.instrucciones?.trim() || null,
        media_url: body.media_url?.trim() || null,
        fuente: 'personal',
      }])
      .select()
      .single();
    if (error) throw error;
    return json({ ejercicio: data }, 201);
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const PATCH: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const id = context.url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const body = await context.request.json();
    if (body.patron && !PATRONES.includes(body.patron)) return json({ error: 'patron inválido' }, 400);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const c of ['nombre', 'nombre_en', 'grupo_muscular_primario', 'patron', 'equipamiento', 'instrucciones', 'media_url']) {
      if (c in body) patch[c] = typeof body[c] === 'string' ? body[c].trim() || null : body[c];
    }
    if ('secundarios' in body) patch.secundarios = Array.isArray(body.secundarios) ? body.secundarios : [];
    const sb = getSupabaseServer();
    const { data, error } = await sb.from('ejercicios').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return json({ ejercicio: data });
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
    const { error } = await sb.from('ejercicios').delete().eq('id', id);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
