export const prerender = false;

import type { APIRoute } from 'astro';
import { aprobacionesDefault } from '../../../os/data/sistema';
import { isOsAuthorized, json } from '../../../os/lib/osAuth';

export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  return json({ approvals: aprobacionesDefault });
};

export const POST: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);

  let body: { id?: string; action?: string; comment?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  if (!body.id || !['approve', 'reject', 'execute'].includes(body.action ?? '')) {
    return json({ error: 'accion invalida' }, 400);
  }

  const webhook = import.meta.env.APPROVAL_WEBHOOK_URL;
  if (!webhook) {
    return json({
      ok: true,
      queued: false,
      message: 'APPROVAL_WEBHOOK_URL no configurado. La aprobacion quedo solo en el OS.',
    });
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'os-approvals',
        id: body.id,
        action: body.action,
        comment: body.comment ?? '',
        ts: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`webhook HTTP ${res.status}`);
    return json({ ok: true, queued: true });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 502);
  }
};
