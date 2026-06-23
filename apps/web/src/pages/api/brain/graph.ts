export const prerender = false;

import type { APIRoute } from 'astro';
import { createGbrainClient } from '../../../os/lib/gbrain';

// In-memory cache (per-serverless-instance, 5 min TTL)
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

const KNOWN_GROUPS: Array<[string, RegExp]> = [
  ['arazza', /arazza|meal.prep/i],
  ['braintech', /braintech|brain.tech/i],
  ['codeis', /codeis/i],
  ['taskr', /taskr/i],
  ['rafik', /rafik|gustavo/i],
  ['marca', /\bmarca\b|linkedin|instagram|contenido|blog/i],
  ['sistema', /sistema|os.brief|os.personal|\bos\b|cerebro|gbrain|n8n|vps|infra|playbook|metodolog|hermes|modelos/i],
  ['personal', /personal|vida|contexto|finanzas|salud|familia|fellows|fellows|pendientes|recordatorio|limite/i],
];

function inferGroup(slug: string, title: string): string {
  const text = `${slug} ${title}`;
  for (const [group, pattern] of KNOWN_GROUPS) {
    if (pattern.test(text)) return group;
  }
  return 'otros';
}

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get('os_auth')?.value;
  const expected = import.meta.env.OS_AUTH_TOKEN;
  if (!token || token !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return new Response(JSON.stringify(cache.data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const gbrainToken = import.meta.env.GBRAIN_TOKEN;
  if (!gbrainToken) {
    return new Response(JSON.stringify({ error: 'GBRAIN_TOKEN not configured' }), { status: 500 });
  }

  const brain = createGbrainClient(gbrainToken);

  try {
    const pages = await brain.listPages({ limit: 100, sort: 'updated_desc' });

    // Fetch links for all pages in parallel
    const linksResults = await Promise.all(
      pages.map((p) => brain.getLinks(p.slug).catch(() => []))
    );

    const nodes = pages.map((p) => ({
      id: p.slug,
      label: p.title,
      type: p.type,
      group: inferGroup(p.slug, p.title),
      updated_at: p.updated_at,
    }));

    const slugSet = new Set(pages.map((p) => p.slug));
    const edgeSet = new Set<string>();
    const edges: { source: string; target: string }[] = [];

    pages.forEach((p, i) => {
      for (const link of linksResults[i]) {
        const target = link.target_slug ?? (link as any).target;
        if (!target || !slugSet.has(target)) continue;
        const key = [p.slug, target].sort().join('|');
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push({ source: p.slug, target });
      }
    });

    const data = { nodes, edges };
    cache = { data, ts: Date.now() };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 502 });
  }
};
