export const prerender = false;

import type { APIRoute } from 'astro';
import { createGbrainClient } from '../../../os/lib/gbrain';

// In-memory cache (per-serverless-instance, 5 min TTL). Reset on redeploy.
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
    const edges: { source: string; target: string; kind: 'real' | 'tema' }[] = [];

    // Real edges from gbrain links
    pages.forEach((p, i) => {
      for (const link of linksResults[i]) {
        const target = link.target_slug ?? (link as any).target;
        if (!target || !slugSet.has(target)) continue;
        const key = [p.slug, target].sort().join('|');
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push({ source: p.slug, target, kind: 'real' });
      }
    });

    // Derived edges: connect same-group nodes so each theme forms a visible cluster.
    // Strategy: ring topology per group (chain + close if 3+ members).
    const byGroup: Record<string, string[]> = {};
    for (const n of nodes) {
      byGroup[n.group] = byGroup[n.group] ?? [];
      byGroup[n.group].push(n.id);
    }

    for (const members of Object.values(byGroup)) {
      if (members.length < 2) continue;
      // Chain: 0-1, 1-2, ..., N-2 to N-1
      for (let i = 0; i < members.length - 1; i++) {
        const key = [members[i], members[i + 1]].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: members[i], target: members[i + 1], kind: 'tema' });
        }
      }
      // Close ring if 3+ members
      if (members.length >= 3) {
        const key = [members[0], members[members.length - 1]].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: members[0], target: members[members.length - 1], kind: 'tema' });
        }
      }
    }

    const data = { nodes, edges };
    cache = { data, ts: Date.now() };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 502 });
  }
};
