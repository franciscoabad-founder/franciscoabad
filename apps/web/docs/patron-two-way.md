# Patron two-way del OS

El OS usa endpoints server-side en `apps/web/src/pages/api/os/*` con `export const prerender = false`. El front llama esos endpoints con `fetch('/api/os/...')` desde la pagina del modulo. Las credenciales sensibles se leen con `import.meta.env` en el servidor, nunca con variables `VITE_`.

## Molde A: Supabase como fuente de verdad

Usa este molde cuando la tabla vive en Supabase y el OS es dueno de la data. El endpoint importa el cliente server-side real del repo:

```ts
import { getSupabaseServer } from '../../../lib/supabase';

const sb = getSupabaseServer();
```

El helper lee `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` desde `import.meta.env` y crea el cliente con `persistSession: false`.

Endpoint tipo:

```ts
export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  const sb = getSupabaseServer();
  const { data, error } = await sb.from('tareas').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return json({ tareas: data ?? [] });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  const body = await request.json();
  const sb = getSupabaseServer();
  const { data, error } = await sb.from('tareas').insert([{ titulo: body.titulo.trim() }]).select().single();
  if (error) throw error;
  return json({ ok: true, tarea: data }, 201);
};

export const PATCH: APIRoute = async ({ cookies, request, url }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Unauthorized' }, 401);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  const body = await request.json();
  const sb = getSupabaseServer();
  const { data, error } = await sb.from('tareas').update(body).eq('id', id).select().single();
  if (error) throw error;
  return json({ ok: true, tarea: data });
};
```

Front tipo:

```js
await fetch('/api/os/tareas');

await fetch('/api/os/tareas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ titulo, proyecto, deadline, urgente }),
});

await fetch('/api/os/tareas?id=' + encodeURIComponent(id), {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ estado: 'hecho' }),
});
```

## Molde B: servicio externo via n8n

Usa este molde cuando la fuente de verdad vive fuera del OS, por ejemplo Google Calendar. El OS no llama al servicio externo. El endpoint lee URLs de webhooks desde variables server-side y llama n8n.

Endpoint tipo:

```ts
const webhook = import.meta.env.AGENDA_LIST_WEBHOOK_URL;
if (!webhook) return json({ ok: true, eventos: [] });

const res = await fetch(webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ desde, hasta }),
});
```

Para escribir:

```ts
const webhook = import.meta.env.AGENDA_WRITE_WEBHOOK_URL;
if (!webhook) return json({ ok: false, error: 'AGENDA_WRITE_WEBHOOK_URL no configurada' }, 501);

const res = await fetch(webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ titulo, inicio, fin, descripcion, ubicacion }),
});
```

Front tipo:

```js
const data = await fetch('/api/os/agenda').then(function(res) { return res.json(); });

await fetch('/api/os/agenda', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ titulo, inicio, fin, descripcion, ubicacion }),
});
```

Contrato: las URLs de n8n viven en `AGENDA_LIST_WEBHOOK_URL` y `AGENDA_WRITE_WEBHOOK_URL`. Son variables server-side sin prefijo `VITE_`.
