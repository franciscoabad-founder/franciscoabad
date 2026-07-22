import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Spinner } from './ui';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  group: string;
  tags?: string[];
  connections: number;
  orphan?: boolean;
  isCenter?: boolean;
  isCanon?: boolean;
  anchor?: { x: number; y: number };
}

interface RawEdge {
  source: string;
  target: string;
}

interface SimEdge extends d3.SimulationLinkDatum<GraphNode> {}

interface RawData {
  nodes: Array<{ id: string; label: string; type: string; group: string; tags?: string[]; connections?: number }>;
  edges: RawEdge[];
  sources?: string[];
  meta?: {
    notes: number;
    notes_shown: number;
    edges: number;
    connected: number;
    orphans: number;
    truncated: boolean;
    top_n: number;
  };
}

// Paleta categorica por grupo real (tags), derivada de la marca: azules
// ultramarine, ambares, bronces, corales y neutros. Sin verdes ni morados.
// El dorado champagne (#B5985A) queda reservado para el nodo central "pancho".
const GROUP_COLORS: Record<string, string> = {
  // Proyectos
  braintech: '#6B7AE8',
  rafik:     '#FBBF24',
  cortex:    '#5FB4D9',
  taskr:     '#FB923C',
  arazza:    '#E8837F',
  codeis:    '#EF9F27',
  fonquito:  '#D97798',
  flow:      '#4C8DD9',
  kronek:    '#8FA3C8',
  // Areas
  marca:     '#E8EAF0',
  contenido: '#DDA15E',
  gtm:       '#E05C6E',
  personal:  '#F87171',
  familia:   '#F0A8A8',
  salud:     '#E76F51',
  finanzas:  '#EAC54F',
  // Sistema y resto
  sistema:   '#94A3B8',
  otros:     '#6B7280',
};

const GROUP_LABELS: Record<string, string> = {
  braintech: 'BrainTech',
  rafik:     'Rafik',
  cortex:    'Cortex',
  taskr:     'Taskr',
  arazza:    'Arazza',
  codeis:    'CODEIS',
  fonquito:  'Fonquito',
  flow:      'Flow',
  kronek:    'Kronek',
  marca:     'Marca',
  contenido: 'Contenido',
  gtm:       'GTM',
  personal:  'Personal',
  familia:   'Familia',
  salud:     'Salud',
  finanzas:  'Finanzas',
  sistema:   'Sistema',
  otros:     'Otros',
};

// Orden canonico para chips y leyenda: proyectos, areas, sistema, otros.
const GROUP_ORDER = [
  'braintech', 'rafik', 'cortex', 'taskr', 'arazza', 'codeis', 'fonquito', 'flow', 'kronek',
  'marca', 'contenido', 'gtm', 'personal', 'familia', 'salud', 'finanzas',
  'sistema', 'otros',
];

const CHAMPAGNE = '#B5985A';
const CENTER_SLUG = 'pancho';
const DEFAULT_SOURCES = ['Telegram', 'Reuniones', 'Repos de código', 'Chats IA', 'Manual'];

// Enlaces cuyo extremo tiene grado alto se aflojan para evitar la "bola".
const HUB_DEGREE = 15;
const LINK_STRENGTH_NORMAL = 0.85;
const LINK_STRENGTH_HUB = 0.15;

function nodeR(connections: number) {
  return 5 + Math.min(connections, 10) * 1.6;
}

function radiusOf(d: GraphNode) {
  if (d.isCenter) return 20;
  if (d.isCanon) return Math.max(nodeR(d.connections), 9) + 2;
  return nodeR(d.connections);
}

function edgeIsCross(e: SimEdge): boolean {
  const s = e.source as GraphNode | string;
  const t = e.target as GraphNode | string;
  if (typeof s === 'string' || typeof t === 'string') return false;
  return s.group !== t.group;
}

// Enlaces entre grupos distintos: lineas mas finas y tenues que las intra-grupo.
const baseEdgeWidth = (e: SimEdge) => (edgeIsCross(e) ? 0.7 : 1.4);
const baseEdgeOpacity = (e: SimEdge) => (edgeIsCross(e) ? 0.25 : 0.6);
const baseEdgeStroke = (e: SimEdge) =>
  edgeIsCross(e) ? 'rgba(107,122,232,0.4)' : 'rgba(107,122,232,0.6)';

export default function OSGraphBrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef      = useRef<SVGSVGElement>(null);
  const simRef      = useRef<d3.Simulation<GraphNode, SimEdge> | null>(null);
  const gRef        = useRef<SVGGElement | null>(null);
  const dimsRef     = useRef({ W: 800, H: 520 });

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [graphData, setGraphData]           = useState<RawData | null>(null);
  const [nodeCount, setNodeCount]           = useState(0);
  const [edgeCount, setEdgeCount]           = useState(0);
  const [totalNotes, setTotalNotes]         = useState(0);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [activeGroup, setActiveGroup]       = useState<string | null>(null);
  const [panelSlug, setPanelSlug]           = useState<string | null>(null);
  const [panelData, setPanelData]           = useState<{label:string;group:string;connections:number;tags?:string[]} | null>(null);
  const [onlyConnected, setOnlyConnected]   = useState(false);
  const [showAll, setShowAll]               = useState(false);
  const [showSources, setShowSources]       = useState(false);

  // --- Effect 1: fetch data (no DOM access) ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/brain/graph${showAll ? '?all=1' : ''}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: RawData) => {
        if (cancelled) return;
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [showAll]);

  // --- Effect 2: filter opacity (no restart) ---
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (activeGroup) {
      svg.selectAll<SVGGElement, GraphNode>('.node-g')
        .attr('opacity', (d) => (d.group === activeGroup || d.isCenter ? 1 : 0.1));
      svg.selectAll<SVGLineElement, SimEdge>('.edge-line')
        .attr('opacity', (d) => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          return s.group === activeGroup || t.group === activeGroup ? 0.5 : 0.03;
        });
    } else {
      svg.selectAll('.node-g').attr('opacity', 1);
      svg.selectAll<SVGLineElement, SimEdge>('.edge-line').attr('opacity', baseEdgeOpacity);
    }
  }, [activeGroup]);

  // --- Effect 3: D3 init — runs only AFTER graphData is set and DOM is painted ---
  useEffect(() => {
    if (!graphData || !containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 520;
    dimsRef.current = { W, H };
    const cx = W / 2;
    const cy = H / 2;

    const connCount: Record<string, number> = {};
    for (const e of graphData.edges) {
      connCount[e.source] = (connCount[e.source] || 0) + 1;
      connCount[e.target] = (connCount[e.target] || 0) + 1;
    }

    const allNodes: GraphNode[] = graphData.nodes.map((n) => ({
      ...n,
      connections: n.connections ?? connCount[n.id] ?? 0,
      orphan: (n.connections ?? connCount[n.id] ?? 0) === 0,
      isCenter: n.id === CENTER_SLUG,
      isCanon: n.id !== CENTER_SLUG && n.id.endsWith('-canon'),
    }));

    // El esqueleto (pancho + canones) se dibuja siempre, aun con "Solo conectados".
    const nodes = onlyConnected
      ? allNodes.filter((n) => !n.orphan || n.isCenter || n.isCanon)
      : allNodes;
    const nodeIds = new Set(nodes.map((n) => n.id));

    const groups = [...new Set(nodes.map((n) => n.group))].sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a);
      const ib = GROUP_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    setAvailableGroups(groups);
    setNodeCount(graphData.meta?.notes_shown ?? nodes.length);
    setTotalNotes(graphData.meta?.notes ?? nodes.length);
    setEdgeCount(graphData.meta?.edges ?? graphData.edges.length);

    // --- Layout sistema solar ---
    // pancho fijo al centro; canones anclados en un anillo alrededor; el resto
    // orbita el canon (o centroide) de su grupo; huerfanos en anillo exterior.
    const canonRing = Math.min(W, H) * 0.26;
    const groupRing = Math.min(W, H) * 0.36;
    const outerR    = Math.min(W, H) * 0.46;

    const canonNodes = nodes.filter((n) => n.isCanon).sort((a, b) => a.id.localeCompare(b.id));
    canonNodes.forEach((n, i) => {
      const angle = (i / Math.max(canonNodes.length, 1)) * 2 * Math.PI - Math.PI / 2;
      n.anchor = { x: cx + canonRing * Math.cos(angle), y: cy + canonRing * Math.sin(angle) };
    });

    // Centroide por grupo: el ancla de su canon si existe; si no, posicion en
    // un anillo intermedio propio.
    const groupCentroids: Record<string, { x: number; y: number }> = {};
    for (const n of canonNodes) {
      if (n.anchor && !(n.group in groupCentroids)) groupCentroids[n.group] = n.anchor;
    }
    const groupsWithoutCanon = groups.filter((grp) => !(grp in groupCentroids));
    groupsWithoutCanon.forEach((grp, i) => {
      const angle = (i / Math.max(groupsWithoutCanon.length, 1)) * 2 * Math.PI - Math.PI / 3;
      groupCentroids[grp] = { x: cx + groupRing * Math.cos(angle), y: cy + groupRing * Math.sin(angle) };
    });

    // Seed positions
    let orphanIdx = 0;
    const orphanCount = nodes.filter((n) => n.orphan && !n.isCenter && !n.isCanon).length;
    nodes.forEach((n) => {
      if (n.isCenter) {
        n.x = cx; n.y = cy;
        n.fx = cx; n.fy = cy;
        return;
      }
      if (n.isCanon && n.anchor) {
        n.x = n.anchor.x;
        n.y = n.anchor.y;
        return;
      }
      if (n.orphan) {
        const angle = (orphanIdx / Math.max(orphanCount, 1)) * 2 * Math.PI;
        orphanIdx++;
        n.x = cx + outerR * Math.cos(angle);
        n.y = cy + outerR * Math.sin(angle);
      } else {
        const c = groupCentroids[n.group] ?? { x: cx, y: cy };
        n.x = c.x + (Math.random() - 0.5) * 60;
        n.y = c.y + (Math.random() - 0.5) * 60;
      }
    });

    const edges: SimEdge[] = graphData.edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({ ...e }));

    // Grado por nodo sobre las aristas visibles: los hubs (grado alto) usan
    // strength reducida para no colapsar el grafo en una bola.
    const degree: Record<string, number> = {};
    for (const e of edges) {
      const s = e.source as string;
      const t = e.target as string;
      degree[s] = (degree[s] || 0) + 1;
      degree[t] = (degree[t] || 0) + 1;
    }

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H);
    svg.selectAll('*').remove();

    // Markers: flechas para aristas y para la capa de fuentes
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -4 8 8')
      .attr('refX', 14)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', 'rgba(107,122,232,0.5)');
    defs.append('marker')
      .attr('id', 'arrow-src')
      .attr('viewBox', '0 -4 8 8')
      .attr('refX', 8)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', 'rgba(148,163,184,0.7)');

    const g = svg.append('g');
    gRef.current = g.node();

    // Zoom + pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 6])
      .on('zoom', (ev) => g.attr('transform', ev.transform));
    svg.call(zoom).on('dblclick.zoom', null);

    // Simulation
    const sim = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, SimEdge>(edges)
        .id((d) => d.id)
        .distance(55)
        .strength((l) => {
          const s = typeof l.source === 'object' ? (l.source as GraphNode).id : String(l.source);
          const t = typeof l.target === 'object' ? (l.target as GraphNode).id : String(l.target);
          return (degree[s] || 0) > HUB_DEGREE || (degree[t] || 0) > HUB_DEGREE
            ? LINK_STRENGTH_HUB
            : LINK_STRENGTH_NORMAL;
        }))
      .force('charge', d3.forceManyBody<GraphNode>().strength(-320))
      .force('collide', d3.forceCollide<GraphNode>().radius((d) => radiusOf(d) + 12))
      .force('cluster', (() => {
        const cf = () => {
          const a = sim.alpha();
          for (const n of nodes) {
            if (n.isCenter) continue; // fijado con fx/fy
            if (n.isCanon && n.anchor) {
              // Ancla fuerte al anillo canon.
              n.vx = (n.vx ?? 0) + (n.anchor.x - (n.x ?? 0)) * 0.35 * a;
              n.vy = (n.vy ?? 0) + (n.anchor.y - (n.y ?? 0)) * 0.35 * a;
              continue;
            }
            if (n.orphan) {
              // Huerfanos derivan cerca del margen exterior, leidos como
              // "sin enlaces" en lugar de flotar al azar.
              const dx = (n.x ?? 0) - cx;
              const dy = (n.y ?? 0) - cy;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const pull = (outerR - dist) * 0.02 * a;
              n.vx = (n.vx ?? 0) + (dx / dist) * pull;
              n.vy = (n.vy ?? 0) + (dy / dist) * pull;
              continue;
            }
            const c = groupCentroids[n.group];
            if (!c) continue;
            n.vx = (n.vx ?? 0) + (c.x - (n.x ?? 0)) * 0.05 * a;
            n.vy = (n.vy ?? 0) + (c.y - (n.y ?? 0)) * 0.05 * a;
          }
        };
        return cf;
      })())
      .alphaDecay(0.015)
      .velocityDecay(0.4);

    simRef.current = sim;

    // Edges
    const edgeSel = g.append('g')
      .selectAll<SVGLineElement, SimEdge>('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'edge-line')
      .attr('stroke', baseEdgeStroke)
      .attr('stroke-width', baseEdgeWidth)
      .attr('stroke-dasharray', 'none')
      .attr('opacity', baseEdgeOpacity);

    // Nodes
    const nodeSel = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-g')
      .style('cursor', 'pointer');

    const colorOf = (d: GraphNode) => (d.isCenter ? CHAMPAGNE : GROUP_COLORS[d.group] ?? '#6B7280');

    nodeSel.append('circle')
      .attr('class', 'node-halo')
      .attr('r', (d) => radiusOf(d) + 8)
      .attr('fill', colorOf)
      .attr('opacity', (d) => (d.isCenter ? 0.12 : 0));

    nodeSel.append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d) => radiusOf(d))
      .attr('fill', (d) => (d.isCenter ? CHAMPAGNE : colorOf(d) + '44'))
      .attr('stroke', (d) => (d.isCenter ? '#E8D5AC' : colorOf(d)))
      .attr('stroke-width', (d) => (d.isCenter ? 2.5 : d.isCanon ? 2 : 1.5));

    nodeSel.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => radiusOf(d) + 13)
      .attr('fill', (d) => (d.isCenter ? CHAMPAGNE : d.isCanon ? '#9AA6C8' : '#6B7280'))
      .attr('font-size', (d) => (d.isCenter ? '11px' : d.isCanon ? '10px' : '9px'))
      .attr('font-weight', (d) => (d.isCenter || d.isCanon ? '700' : '400'))
      .attr('font-family', 'Montserrat, sans-serif')
      .attr('pointer-events', 'none')
      .text((d) => (d.isCenter || d.isCanon || d.connections >= 4 ? d.label : ''));

    // Drag: pancho vuelve a su centro fijo al soltar; el resto queda libre.
    nodeSel.call(
      d3.drag<SVGGElement, GraphNode>()
        .on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end',   (ev, d) => {
          if (!ev.active) sim.alphaTarget(0);
          if (d.isCenter) { d.fx = cx; d.fy = cy; }
          else { d.fx = null; d.fy = null; }
        })
    );

    // Hover
    nodeSel
      .on('mouseenter', function (_, d) {
        d3.select(this).select('.node-halo').attr('opacity', 0.12);
        d3.select(this).select('.node-circle')
          .transition().duration(100)
          .attr('fill', d.isCenter ? CHAMPAGNE : colorOf(d) + '88')
          .attr('stroke-width', 2.5)
          .attr('r', radiusOf(d) + 2);
        d3.select(this).select('.node-label')
          .text(d.label).attr('fill', '#F4F6F8').attr('font-size', '10px').attr('font-weight', '700');
        edgeSel
          .attr('stroke', (e) => {
            const s = e.source as GraphNode;
            const t = e.target as GraphNode;
            return s.id === d.id || t.id === d.id ? 'rgba(107,122,232,0.85)' : 'rgba(107,122,232,0.06)';
          })
          .attr('stroke-width', (e) => {
            const s = e.source as GraphNode;
            const t = e.target as GraphNode;
            return s.id === d.id || t.id === d.id ? 2 : 0.6;
          });
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).select('.node-halo').attr('opacity', d.isCenter ? 0.12 : 0);
        d3.select(this).select('.node-circle')
          .transition().duration(100)
          .attr('fill', d.isCenter ? CHAMPAGNE : colorOf(d) + '44')
          .attr('stroke-width', d.isCenter ? 2.5 : d.isCanon ? 2 : 1.5)
          .attr('r', radiusOf(d));
        d3.select(this).select('.node-label')
          .text(d.isCenter || d.isCanon || d.connections >= 4 ? d.label : '')
          .attr('fill', d.isCenter ? CHAMPAGNE : d.isCanon ? '#9AA6C8' : '#6B7280')
          .attr('font-size', d.isCenter ? '11px' : d.isCanon ? '10px' : '9px')
          .attr('font-weight', d.isCenter || d.isCanon ? '700' : '400');
        edgeSel
          .attr('stroke', baseEdgeStroke)
          .attr('stroke-width', baseEdgeWidth);
      })
      .on('click', (ev, d) => {
        ev.stopPropagation();
        setPanelSlug(d.id);
        setPanelData({ label: d.label, group: d.group, connections: d.connections, tags: d.tags });
      });

    svg.on('click', () => { setPanelSlug(null); setPanelData(null); });

    // Tick
    sim.on('tick', () => {
      edgeSel
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);
      nodeSel.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Auto zoom-fit when settled
    sim.on('end', () => {
      const xs = nodes.map((n) => n.x ?? 0);
      const ys = nodes.map((n) => n.y ?? 0);
      if (!xs.length) return;
      const x0 = Math.min(...xs) - 40, x1 = Math.max(...xs) + 40;
      const y0 = Math.min(...ys) - 40, y1 = Math.max(...ys) + 40;
      const sc = Math.min(0.9, W / (x1 - x0), H / (y1 - y0));
      const tx = (W - sc * (x0 + x1)) / 2;
      const ty = (H - sc * (y0 + y1)) / 2;
      svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(sc));
    });

    return () => { sim.stop(); };
  }, [graphData, onlyConnected]);

  // --- Effect 4: capa de fuentes (toggle, sin reiniciar la simulacion) ---
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);
    g.select('.sources-layer').remove();
    if (!showSources || !graphData) return;

    const { W, H } = dimsRef.current;
    const cx = W / 2;
    const cy = H / 2;
    const list = graphData.sources && graphData.sources.length > 0 ? graphData.sources : DEFAULT_SOURCES;

    const layer = g.append('g').attr('class', 'sources-layer');
    const x = cx - Math.min(W, H) * 0.62; // entran desde el borde izquierdo
    const spacing = Math.min(64, (H - 80) / Math.max(list.length, 1));

    list.forEach((name, i) => {
      const y = cy + (i - (list.length - 1) / 2) * spacing;

      // Flecha hacia el centro, detenida antes del nodo pancho.
      const dx = cx - x;
      const dy = cy - y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const stop = 34; // radio de pancho + margen
      const ex = cx - (dx / dist) * stop;
      const ey = cy - (dy / dist) * stop;

      layer.append('line')
        .attr('x1', x + 10).attr('y1', y)
        .attr('x2', ex).attr('y2', ey)
        .attr('stroke', 'rgba(148,163,184,0.4)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4')
        .attr('marker-end', 'url(#arrow-src)');

      // Rombo: forma distinta a las notas para leerse como capa de entrada.
      layer.append('rect')
        .attr('x', x - 7).attr('y', y - 7)
        .attr('width', 14).attr('height', 14)
        .attr('transform', `rotate(45 ${x} ${y})`)
        .attr('fill', 'rgba(148,163,184,0.18)')
        .attr('stroke', '#94A3B8')
        .attr('stroke-width', 1.5);

      layer.append('text')
        .attr('x', x).attr('y', y + 24)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94A3B8')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'Montserrat, sans-serif')
        .attr('pointer-events', 'none')
        .text(name);
    });
  }, [showSources, graphData, onlyConnected]);

  // Chrome HTML en tokens; los colores dentro del SVG quedan literales (canvas oscuro fijo).
  const MUTED  = 'var(--os-muted)';
  const BORDER = 'var(--os-line)';
  const PANEL  = 'var(--os-surface)';

  return (
    <div>
      {loading && (
        <div style={{ height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner label="Conectando con gbrain..." />
        </div>
      )}

      {error && (
        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--os-error)', fontSize: 'var(--os-text-sm)' }}>
          No se pudo cargar el grafo: {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveGroup(null)}
              style={{ fontSize: '11px', padding: '4px 12px', minHeight: 36, borderRadius: '99px', border: `1px solid ${!activeGroup ? 'var(--os-accent)' : BORDER}`, background: !activeGroup ? 'var(--os-accent)' : 'transparent', color: !activeGroup ? '#fff' : MUTED, cursor: 'pointer', fontFamily: 'var(--os-font-display)' }}
            >
              Todos
            </button>
            {availableGroups.map((gr) => (
              <button
                key={gr}
                onClick={() => setActiveGroup(gr === activeGroup ? null : gr)}
                style={{ fontSize: '11px', padding: '4px 12px', minHeight: 36, borderRadius: '99px', border: `1px solid ${activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) : BORDER}`, background: activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) + '22' : 'transparent', color: activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) : MUTED, cursor: 'pointer', fontFamily: 'var(--os-font-display)', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: GROUP_COLORS[gr] ?? MUTED, display: 'inline-block', flexShrink: 0 }} />
                {GROUP_LABELS[gr] ?? gr}
              </button>
            ))}

            <span style={{ flex: 1 }} />

            <button
              onClick={() => setShowSources((v) => !v)}
              style={{ fontSize: '11px', padding: '4px 12px', minHeight: 36, borderRadius: '99px', border: `1px solid ${showSources ? '#94A3B8' : BORDER}`, background: showSources ? 'rgba(148,163,184,0.15)' : 'transparent', color: showSources ? '#94A3B8' : MUTED, cursor: 'pointer', fontFamily: 'var(--os-font-display)' }}
            >
              Ver fuentes
            </button>

            <button
              onClick={() => setOnlyConnected((v) => !v)}
              style={{ fontSize: '11px', padding: '4px 12px', minHeight: 36, borderRadius: '99px', border: `1px solid ${onlyConnected ? 'var(--os-accent)' : BORDER}`, background: onlyConnected ? 'var(--os-accent)' : 'transparent', color: onlyConnected ? '#fff' : MUTED, cursor: 'pointer', fontFamily: 'var(--os-font-display)' }}
            >
              Solo conectados
            </button>

            {graphData?.meta?.truncated && (
              <button
                onClick={() => setShowAll((v) => !v)}
                style={{ fontSize: '11px', padding: '4px 12px', minHeight: 36, borderRadius: '99px', border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, cursor: 'pointer', fontFamily: 'var(--os-font-display)' }}
              >
                {showAll ? 'Ver top conectadas' : 'Ver todo'}
              </button>
            )}
          </div>

          {/* Graph container with fixed height so SVG gets real dimensions */}
          <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '520px' }}>
            <svg
              ref={svgRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px', background: '#0a1020' }}
            />

            {/* Node detail panel */}
            {panelSlug && panelData && (
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '220px', background: PANEL, border: `1px solid ${(GROUP_COLORS[panelData.group] ?? '#3B4ED9') + '55'}`, borderLeft: `3px solid ${panelSlug === CENTER_SLUG ? CHAMPAGNE : GROUP_COLORS[panelData.group] ?? '#3B4ED9'}`, borderRadius: '10px', padding: '14px', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: panelSlug === CENTER_SLUG ? CHAMPAGNE : GROUP_COLORS[panelData.group] ?? '#6B7AE8', fontFamily: 'var(--os-font-display)', fontWeight: 600 }}>
                    {panelSlug === CENTER_SLUG ? 'Centro' : GROUP_LABELS[panelData.group] ?? panelData.group}
                  </span>
                  <button onClick={() => { setPanelSlug(null); setPanelData(null); }} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>x</button>
                </div>
                <h3 style={{ fontSize: 'var(--os-text-sm)', fontWeight: 700, color: 'var(--os-text)', margin: '0 0 8px', lineHeight: 1.35 }}>{panelData.label}</h3>
                <span style={{ fontSize: '11px', color: '#6B7AE8', background: 'rgba(107,122,232,0.1)', padding: '2px 7px', borderRadius: '4px' }}>{panelData.connections} enlaces</span>
                {panelData.tags && panelData.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {panelData.tags.map((t) => (
                      <span key={t} style={{ fontSize: '10px', color: MUTED, background: 'var(--os-fill-subtle)', padding: '1px 6px', borderRadius: '4px' }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend + stats */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${BORDER}`, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: CHAMPAGNE, display: 'block' }} />
              <span style={{ fontSize: '11px', color: CHAMPAGNE, fontFamily: 'var(--os-font-display)', fontWeight: 600 }}>Pancho</span>
            </div>
            {availableGroups.map((gr) => (
              <div key={gr} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GROUP_COLORS[gr] ?? MUTED, display: 'block' }} />
                <span style={{ fontSize: '11px', color: MUTED, fontFamily: 'var(--os-font-display)' }}>{GROUP_LABELS[gr] ?? gr}</span>
              </div>
            ))}
            <span style={{ fontSize: '11px', color: MUTED, marginLeft: 'auto' }}>
              {totalNotes} notas · {nodeCount} mostradas · {edgeCount} enlaces reales
              {graphData?.meta?.orphans ? ` · ${graphData.meta.orphans} sin enlaces` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
