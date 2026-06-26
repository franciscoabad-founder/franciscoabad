export const prerender = false;

import type { APIRoute } from 'astro';

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

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultRange(url: URL) {
  const today = new Date();
  const inTwoWeeks = new Date(today);
  inTwoWeeks.setDate(today.getDate() + 14);
  return {
    desde: url.searchParams.get('desde') ?? dateOnly(today),
    hasta: url.searchParams.get('hasta') ?? dateOnly(inTwoWeeks),
  };
}

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);

  const webhook = import.meta.env.AGENDA_LIST_WEBHOOK_URL;
  if (!webhook) return json({ ok: true, eventos: [] });

  const { desde, hasta } = defaultRange(url);

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desde, hasta }),
    });
    if (!res.ok) throw new Error(`n8n HTTP ${res.status}`);
    const data = await res.json();
    return json({ ok: true, eventos: Array.isArray(data.eventos) ? data.eventos : [] });
  } catch {
    return json({ ok: true, eventos: [] });
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);

  const webhook = import.meta.env.AGENDA_WRITE_WEBHOOK_URL;
  if (!webhook) {
    return json({ ok: false, error: 'AGENDA_WRITE_WEBHOOK_URL no configurada' }, 501);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'JSON invalido' }, 400);
  }

  const titulo = body.titulo?.toString().trim();
  const inicio = body.inicio?.toString().trim();
  const fin = body.fin?.toString().trim();
  const descripcion = body.descripcion?.toString().trim() || undefined;
  const ubicacion = body.ubicacion?.toString().trim() || undefined;

  if (!titulo) return json({ ok: false, error: 'titulo requerido' }, 400);
  if (!inicio) return json({ ok: false, error: 'inicio requerido' }, 400);
  if (!fin) return json({ ok: false, error: 'fin requerido' }, 400);

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, inicio, fin, descripcion, ubicacion }),
    });
    if (!res.ok) throw new Error(`n8n HTTP ${res.status}`);
    const data = await res.json();
    return json({ ok: true, id: data.id ?? null }, 201);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 502);
  }
};
