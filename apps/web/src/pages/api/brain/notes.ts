export const prerender = false;

import type { APIRoute } from 'astro';
import { createGbrainClient } from '../../../os/lib/gbrain';

export const GET: APIRoute = async ({ cookies, url }) => {
  const token = cookies.get('os_auth')?.value;
  const expected = import.meta.env.OS_AUTH_TOKEN;
  if (!token || token !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const gbrainToken = import.meta.env.GBRAIN_TOKEN;
  if (!gbrainToken) {
    return new Response(JSON.stringify({ error: 'GBRAIN_TOKEN not configured' }), { status: 500 });
  }

  const limit = Math.min(Number(url.searchParams.get('limit') ?? '12'), 30);
  const brain = createGbrainClient(gbrainToken);

  try {
    const pages = await brain.listPages({ limit, sort: 'updated_desc' });

    // Fetch full content for excerpts
    const full = await Promise.all(
      pages.map((p) =>
        brain.getPage(p.slug).catch(() => ({ ...p, compiled_truth: '', tags: [] }))
      )
    );

    const notes = full.map((p) => {
      const body = p.compiled_truth ?? '';
      const excerpt = body.replace(/^#+\s.*$/gm, '').replace(/\n+/g, ' ').trim().slice(0, 160);
      return {
        slug: p.slug,
        titulo: p.title,
        resumen: excerpt || p.title,
        tags: (p.tags ?? []).slice(0, 5),
        tipo: p.type,
        fecha: new Date(p.updated_at).toLocaleDateString('es', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
        conexiones: [],
      };
    });

    return new Response(JSON.stringify({ notes }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 502 });
  }
};
