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
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return json({ gastos: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    if (!body.descripcion?.trim() && !(Number(body.monto) > 0)) {
      return json({ error: 'descripcion o monto requerido' }, 400);
    }
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('gastos')
      .insert([{
        fecha: body.fecha || new Date().toISOString().slice(0, 10),
        categoria: body.categoria?.trim() || null,
        descripcion: body.descripcion?.trim() || null,
        monto: Number(body.monto) || 0,
        cuenta: body.cuenta?.trim() || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return json({ gasto: data }, 201);
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
      .from('gastos')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return json({ gasto: data });
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
    const { error } = await sb.from('gastos').delete().eq('id', id);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
    return json({ error: msg }, 502);
  }
};
