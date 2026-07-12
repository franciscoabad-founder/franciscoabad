export const prerender = false;

import type { APIRoute } from 'astro';
import { createGbrainClient } from '../../../os/lib/gbrain';

// In-memory cache (per-serverless-instance, 5 min TTL). Reset on redeploy.
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// Above this many live pages we degrade to a "top N by connections" view by
// default. The client can still ask for the full set with ?all=1.
const TRUNCATE_ABOVE = 300;
const TOP_N = 180;

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

// Tags live in two places: the structured `tags` array (populated on some pages)
// and inline in the body as `Tags: [arazza, marca]`. Merge + normalize both.
function extractTags(structured: string[] | undefined, body: string | undefined): string[] {
  const out = new Set<string>();
  const norm = (t: string) => t.trim().replace(/^#/, '').toLowerCase();

  for (const t of structured ?? []) {
    const n = norm(t);
    if (n) out.add(n);
  }

  const m = (body ?? '').match(/Tags:\s*\[([^\]]*)\]/i);
  if (m) {
    for (const raw of m[1].split(',')) {
      const n = norm(raw);
      if (n) out.add(n);
    }
  }

  return [...out];
}

// Run async work over a list with bounded concurrency so we don't fire
// hundreds of simultaneous requests at the gbrain MCP endpoint.
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export const GET: APIRoute = async ({ cookies, url }) => {
  const token = cookies.get('os_auth')?.value;
  const expected = import.meta.env.OS_AUTH_TOKEN;
  if (!token || token !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const wantAll = url.searchParams.get('all') === '1';
  const cacheKey = wantAll ? 'all' : 'default';

  if (cache && (cache.data as any)?.__key === cacheKey && Date.now() - cache.ts < CACHE_TTL) {
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
    // Pull every live page (not just the last 100). 500 is comfortably above
    // the current corpus size (~240) and cheap for list_pages.
    const pages = await brain.listPages({ limit: 500, sort: 'updated_desc' });
    const slugSet = new Set(pages.map((p) => p.slug));

    // Fetch full pages (tags) and real wikilinks in parallel, capped concurrency.
    const [fullResults, linksResults] = await Promise.all([
      mapLimit(pages, 15, (p) => brain.getPage(p.slug).catch(() => null)),
      mapLimit(pages, 15, (p) => brain.getLinks(p.slug).catch(() => [])),
    ]);

    const tagsByIndex = pages.map((_, i) =>
      extractTags(fullResults[i]?.tags, fullResults[i]?.compiled_truth)
    );

    // Real edges only: actual wikilinks resolved by gbrain, source -> target.
    // Drop anything pointing at a slug we don't have as a node (dangling link).
    const edgeSet = new Set<string>();
    const edges: { source: string; target: string }[] = [];
    pages.forEach((p, i) => {
      for (const link of linksResults[i] ?? []) {
        const target = (link as any).target_slug ?? (link as any).to_slug;
        if (!target || target === p.slug || !slugSet.has(target)) continue;
        const key = [p.slug, target].sort().join('|');
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push({ source: p.slug, target });
      }
    });

    // Connection count (backlinks + forward links) per node — drives node size.
    const connCount: Record<string, number> = {};
    for (const e of edges) {
      connCount[e.source] = (connCount[e.source] ?? 0) + 1;
      connCount[e.target] = (connCount[e.target] ?? 0) + 1;
    }

    let nodes = pages.map((p, i) => ({
      id: p.slug,
      label: p.title,
      type: p.type,
      group: inferGroup(p.slug, p.title),
      tags: tagsByIndex[i],
      updated_at: p.updated_at,
      connections: connCount[p.slug] ?? 0,
    }));

    let finalEdges = edges;
    let truncated = false;

    if (nodes.length > TRUNCATE_ABOVE && !wantAll) {
      truncated = true;
      const top = [...nodes].sort((a, b) => b.connections - a.connections).slice(0, TOP_N);
      const topIds = new Set(top.map((n) => n.id));
      // Keep any node that's an endpoint of an edge whose other end is in the
      // top set too, so hub neighborhoods stay intact.
      finalEdges = edges.filter((e) => topIds.has(e.source) && topIds.has(e.target));
      nodes = top;
    }

    const data = {
      __key: cacheKey,
      nodes,
      edges: finalEdges,
      meta: {
        notes: pages.length,
        notes_shown: nodes.length,
        edges: finalEdges.length,
        connected: nodes.filter((n) => n.connections > 0).length,
        orphans: nodes.filter((n) => n.connections === 0).length,
        truncated,
        top_n: TOP_N,
      },
    };
    cache = { data, ts: Date.now() };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 502 });
  }
};
