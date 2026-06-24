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
      .from('comidas')
      .select('*')
      .order('fecha', { ascending: false });
    if (error) throw error;
    return json({ comidas: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    if (!body.descripcion?.trim() && !body.momento?.trim()) {
      return json({ error: 'descripcion o momento requerido' }, 400);
    }
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('comidas')
      .insert([{
        fecha: body.fecha || new Date().toISOString(),
        momento: body.momento?.trim() || null,
        descripcion: body.descripcion?.trim() || null,
        foto_url: body.foto_url?.trim() || null,
        notas: body.notas?.trim() || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return json({ comida: data }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};

export const PATCH: APIRoute = async ({ cookies, request, url }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const body = await request.json();
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('comidas')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return json({ comida: data });
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
    const { error } = await sb.from('comidas').delete().eq('id', id);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};
