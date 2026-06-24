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

    // Fetch full pages in parallel to read tags (structured + inline in body).
    const fullResults = await Promise.all(
      pages.map((p) => brain.getPage(p.slug).catch(() => null))
    );

    // tags[i] = normalized tag list for pages[i]
    const tagsByIndex = pages.map((_, i) =>
      extractTags(fullResults[i]?.tags, fullResults[i]?.compiled_truth)
    );

    const nodes = pages.map((p, i) => ({
      id: p.slug,
      label: p.title,
      type: p.type,
      group: inferGroup(p.slug, p.title),
      tags: tagsByIndex[i],
      updated_at: p.updated_at,
    }));

    // Tag frequency: a tag present in > 60% of notes is too generic to link by
    // (it would collapse the whole graph into one blob). Exclude those.
    const total = pages.length;
    const tagFreq: Record<string, number> = {};
    for (const tags of tagsByIndex) {
      for (const t of tags) tagFreq[t] = (tagFreq[t] ?? 0) + 1;
    }
    const threshold = total * 0.6;
    const excluded = new Set(
      Object.entries(tagFreq).filter(([, c]) => c > threshold).map(([t]) => t)
    );

    // Edges: connect two notes if they share at least one non-generic tag.
    // One line per pair regardless of how many tags they share (dedup by key).
    const tagToSlugs: Record<string, string[]> = {};
    pages.forEach((p, i) => {
      for (const t of tagsByIndex[i]) {
        if (excluded.has(t)) continue;
        (tagToSlugs[t] ??= []).push(p.slug);
      }
    });

    const edgeSet = new Set<string>();
    const edges: { source: string; target: string; kind: 'real' | 'tema' }[] = [];

    for (const slugs of Object.values(tagToSlugs)) {
      for (let i = 0; i < slugs.length; i++) {
        for (let j = i + 1; j < slugs.length; j++) {
          const key = [slugs[i], slugs[j]].sort().join('|');
          if (edgeSet.has(key)) continue;
          edgeSet.add(key);
          edges.push({ source: slugs[i], target: slugs[j], kind: 'tema' });
        }
      }
    }

    const data = {
      nodes,
      edges,
      meta: {
        notes: total,
        edges: edges.length,
        tags_used: Object.keys(tagToSlugs).length,
        tags_excluded: [...excluded],
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
