export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../lib/supabase';

function isAuthorized(cookies: Parameters<APIRoute>[0]['cookies']): boolean {
  const token = cookies.get('os_auth')?.value;
  const expected = import.meta.env.OS_AUTH_TOKEN;
  return !!(token && expected && token === expected);
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return json({ tareas: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    if (!body.titulo?.trim()) return json({ error: 'titulo requerido' }, 400);
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('tareas')
      .insert([{
        titulo: body.titulo.trim(),
        proyecto: body.proyecto?.trim() || null,
        categoria: body.categoria?.trim() || null,
        estado: body.estado ?? 'pendiente',
        urgente: body.urgente === true || body.urgente === 'true',
        deadline: body.deadline || null,
        notas: body.notas ?? null,
      }])
      .select()
      .single();
    if (error) throw error;
    return json({ ok: true, tarea: data }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};

export const PATCH: APIRoute = async ({ cookies, request, url }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    const id = url.searchParams.get('id') ?? body.id;
    if (!id) return json({ error: 'id requerido' }, 400);

    const patch: Record<string, unknown> = {};
    if (typeof body.titulo === 'string') {
      const titulo = body.titulo.trim();
      if (!titulo) return json({ error: 'titulo requerido' }, 400);
      patch.titulo = titulo;
    }
    if ('proyecto' in body) patch.proyecto = body.proyecto?.toString().trim() || null;
    if ('urgente' in body) patch.urgente = body.urgente === true || body.urgente === 'true';
    if ('estado' in body) {
      const estado = body.estado?.toString();
      if (!['pendiente', 'en_progreso', 'hecho'].includes(estado)) {
        return json({ error: 'estado invalido' }, 400);
      }
      patch.estado = estado;
    }
    if ('deadline' in body) patch.deadline = body.deadline || null;
    if (!Object.keys(patch).length) return json({ error: 'sin campos para actualizar' }, 400);

    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('tareas')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return json({ ok: true, tarea: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};

export const DELETE: APIRoute = async ({ cookies, url }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const sb = getSupabaseServer();
    const { error } = await sb.from('tareas').delete().eq('id', id);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};
