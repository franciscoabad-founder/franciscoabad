export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../lib/supabase';
import { sistemaDefault } from '../../../os/data/sistema';
import { isOsAuthorized, json } from '../../../os/lib/osAuth';
import type { SistemaState } from '../../../os/data/types';

const STATE_KEY = 'main';

async function notifySystemWebhook(state: SistemaState) {
  const webhook = import.meta.env.OS_SYSTEM_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'os-system', state, ts: new Date().toISOString() }),
    });
  } catch {
    // El OS no debe fallar si n8n esta temporalmente abajo.
  }
}

export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);

  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('os_system_state')
      .select('state, updated_at')
      .eq('key', STATE_KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data?.state) return json({ state: sistemaDefault, source: 'default' });

    return json({
      state: data.state,
      source: 'supabase',
      updated_at: data.updated_at,
    });
  } catch (err) {
    return json({
      state: sistemaDefault,
      source: 'fallback',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

export const PUT: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);

  let state: SistemaState;
  try {
    const body = await context.request.json();
    state = body.state;
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  if (!state || !Array.isArray(state.objetivos_90d) || !Array.isArray(state.priority_stack)) {
    return json({ error: 'estado invalido' }, 400);
  }

  const nextState = {
    ...state,
    version: 1,
    updated_at: new Date().toISOString(),
  };

  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('os_system_state')
      .upsert({
        key: STATE_KEY,
        state: nextState,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
      .select('state, updated_at')
      .single();

    if (error) throw error;
    await notifySystemWebhook(data.state as SistemaState);
    return json({ ok: true, state: data.state, updated_at: data.updated_at });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err), state: nextState }, 502);
  }
};
