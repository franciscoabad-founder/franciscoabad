import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  group: string;
  connections: number;
  orphan?: boolean;
}

interface RawEdge {
  source: string;
  target: string;
}

interface SimEdge extends d3.SimulationLinkDatum<GraphNode> {}

interface RawData {
  nodes: Array<{ id: string; label: string; type: string; group: string; connections?: number }>;
  edges: RawEdge[];
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

const GROUP_COLORS: Record<string, string> = {
  braintech: '#6B7AE8',
  codeis:    '#EF9F27',
  taskr:     '#FB923C',
  arazza:    '#B5985A',
  rafik:     '#FBBF24',
  marca:     '#C084FC',
  sistema:   '#94A3B8',
  personal:  '#F87171',
  otros:     '#6B7280',
};

const GROUP_LABELS: Record<string, string> = {
  braintech: 'BrainTech',
  codeis:    'CODEIS',
  taskr:     'Taskr',
  arazza:    'Arazza',
  rafik:     'Rafik',
  marca:     'Marca',
  sistema:   'Sistema',
  personal:  'Personal',
  otros:     'Otros',
};

function nodeR(connections: number) {
  return 5 + Math.min(connections, 10) * 1.6;
}

export default function OSGraphBrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef      = useRef<SVGSVGElement>(null);
  const simRef      = useRef<d3.Simulation<GraphNode, SimEdge> | null>(null);

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [graphData, setGraphData]           = useState<RawData | null>(null);
  const [nodeCount, setNodeCount]           = useState(0);
  const [edgeCount, setEdgeCount]           = useState(0);
  const [totalNotes, setTotalNotes]         = useState(0);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [activeGroup, setActiveGroup]       = useState<string | null>(null);
  const [panelSlug, setPanelSlug]           = useState<string | null>(null);
  const [panelData, setPanelData]           = useState<{label:string;group:string;connections:number} | null>(null);
  const [onlyConnected, setOnlyConnected]   = useState(false);
  const [showAll, setShowAll]               = useState(false);

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
        .attr('opacity', (d) => (d.group === activeGroup ? 1 : 0.1));
      svg.selectAll<SVGLineElement, SimEdge>('.edge-line')
        .attr('opacity', (d) => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          return s.group === activeGroup || t.group === activeGroup ? 0.5 : 0.03;
        });
    } else {
      svg.selectAll('.node-g').attr('opacity', 1);
      svg.selectAll<SVGLineElement, SimEdge>('.edge-line').attr('opacity', 0.6);
    }
  }, [activeGroup]);

  // --- Effect 3: D3 init — runs only AFTER graphData is set and DOM is painted ---
  useEffect(() => {
    if (!graphData || !containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 520;

    const connCount: Record<string, number> = {};
    for (const e of graphData.edges) {
      connCount[e.source] = (connCount[e.source] || 0) + 1;
      connCount[e.target] = (connCount[e.target] || 0) + 1;
    }

    const allNodes: GraphNode[] = graphData.nodes.map((n) => ({
      ...n,
      connections: n.connections ?? connCount[n.id] ?? 0,
      orphan: (n.connections ?? connCount[n.id] ?? 0) === 0,
    }));

    const nodes = onlyConnected ? allNodes.filter((n) => !n.orphan) : allNodes;
    const nodeIds = new Set(nodes.map((n) => n.id));

    const groups = [...new Set(nodes.map((n) => n.group))].sort();
    setAvailableGroups(groups);
    setNodeCount(graphData.meta?.notes_shown ?? nodes.length);
    setTotalNotes(graphData.meta?.notes ?? nodes.length);
    setEdgeCount(graphData.meta?.edges ?? graphData.edges.length);

    // Group centroids — place connected clusters in a circle, orphans in a
    // wider outer ring so they read as "unlinked" rather than floating randomly.
    const groupCentroids: Record<string, { x: number; y: number }> = {};
    groups.forEach((grp, i) => {
      const angle = (i / groups.length) * 2 * Math.PI - Math.PI / 2;
      const r = Math.min(W, H) * 0.28;
      groupCentroids[grp] = { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
    });

    const outerR = Math.min(W, H) * 0.46;

    // Seed positions
    let orphanIdx = 0;
    const orphanCount = nodes.filter((n) => n.orphan).length;
    nodes.forEach((n) => {
      if (n.orphan) {
        const angle = (orphanIdx / Math.max(orphanCount, 1)) * 2 * Math.PI;
        orphanIdx++;
        n.x = W / 2 + outerR * Math.cos(angle);
        n.y = H / 2 + outerR * Math.sin(angle);
      } else {
        const c = groupCentroids[n.group] ?? { x: W / 2, y: H / 2 };
        n.x = c.x + (Math.random() - 0.5) * 60;
        n.y = c.y + (Math.random() - 0.5) * 60;
      }
    });

    const edges: SimEdge[] = graphData.edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({ ...e }));

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H);
    svg.selectAll('*').remove();

    // Arrow marker for real edges
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -4 8 8')
      .attr('refX', 14)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', 'rgba(107,122,232,0.5)');

    const g = svg.append('g');

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
        .strength(0.85))
      .force('charge', d3.forceManyBody<GraphNode>().strength(-320))
      .force('collide', d3.forceCollide<GraphNode>().radius((d) => nodeR(d.connections) + 12))
      .force('cluster', (() => {
        const cf = () => {
          const a = sim.alpha();
          for (const n of nodes) {
            if (n.orphan) {
              // Keep orphans drifting near the outer margin rather than the
              // main topic clusters, so they read as visually unlinked.
              const dx = (n.x ?? 0) - W / 2;
              const dy = (n.y ?? 0) - H / 2;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const pull = (outerR - dist) * 0.02 * a;
              n.vx = (n.vx ?? 0) + (dx / dist) * pull;
              n.vy = (n.vy ?? 0) + (dy / dist) * pull;
              continue;
            }
            const c = groupCentroids[n.group];
            if (!c) continue;
            n.vx = (n.vx ?? 0) + (c.x - (n.x ?? 0)) * 0.045 * a;
            n.vy = (n.vy ?? 0) + (c.y - (n.y ?? 0)) * 0.045 * a;
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
      .attr('stroke', 'rgba(107,122,232,0.6)')
      .attr('stroke-width', 1.4)
      .attr('stroke-dasharray', 'none')
      .attr('opacity', 0.6);

    // Nodes
    const nodeSel = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-g')
      .style('cursor', 'pointer');

    nodeSel.append('circle')
      .attr('class', 'node-halo')
      .attr('r', (d) => nodeR(d.connections) + 8)
      .attr('fill', (d) => GROUP_COLORS[d.group] ?? '#6B7280')
      .attr('opacity', 0);

    nodeSel.append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d) => nodeR(d.connections))
      .attr('fill', (d) => (GROUP_COLORS[d.group] ?? '#6B7280') + '44')
      .attr('stroke', (d) => GROUP_COLORS[d.group] ?? '#6B7280')
      .attr('stroke-width', 1.5);

    nodeSel.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => nodeR(d.connections) + 13)
      .attr('fill', '#6B7280')
      .attr('font-size', '9px')
      .attr('font-family', 'Montserrat, sans-serif')
      .attr('pointer-events', 'none')
      .text((d) => (d.connections >= 4 ? d.label : ''));

    // Drag
    nodeSel.call(
      d3.drag<SVGGElement, GraphNode>()
        .on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end',   (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    );

    // Hover
    nodeSel
      .on('mouseenter', function (_, d) {
        d3.select(this).select('.node-halo').attr('opacity', 0.12);
        d3.select(this).select('.node-circle')
          .transition().duration(100)
          .attr('fill', (GROUP_COLORS[d.group] ?? '#6B7280') + '88')
          .attr('stroke-width', 2.5)
          .attr('r', nodeR(d.connections) + 2);
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
        d3.select(this).select('.node-halo').attr('opacity', 0);
        d3.select(this).select('.node-circle')
          .transition().duration(100)
          .attr('fill', (GROUP_COLORS[d.group] ?? '#6B7280') + '44')
          .attr('stroke-width', 1.5)
          .attr('r', nodeR(d.connections));
        d3.select(this).select('.node-label')
          .text(d.connections >= 4 ? d.label : '').attr('fill', '#6B7280').attr('font-size', '9px').attr('font-weight', '400');
        edgeSel
          .attr('stroke', 'rgba(107,122,232,0.6)')
          .attr('stroke-width', 1.4);
      })
      .on('click', (ev, d) => {
        ev.stopPropagation();
        setPanelSlug(d.id);
        setPanelData({ label: d.label, group: d.group, connections: d.connections });
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

  const MUTED  = '#6B7280';
  const BORDER = 'rgba(232,234,240,0.1)';
  const INK    = '#0E1738';

  return (
    <div>
      {loading && (
        <div style={{ height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: '13px' }}>
          Conectando con gbrain...
        </div>
      )}

      {error && (
        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F87171', fontSize: '12px' }}>
          No se pudo cargar el grafo: {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveGroup(null)}
              style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '99px', border: `1px solid ${!activeGroup ? '#3B4ED9' : BORDER}`, background: !activeGroup ? '#3B4ED9' : 'transparent', color: !activeGroup ? '#fff' : MUTED, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
            >
              Todos
            </button>
            {availableGroups.map((gr) => (
              <button
                key={gr}
                onClick={() => setActiveGroup(gr === activeGroup ? null : gr)}
                style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '99px', border: `1px solid ${activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) : BORDER}`, background: activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) + '22' : 'transparent', color: activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) : MUTED, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: GROUP_COLORS[gr] ?? MUTED, display: 'inline-block', flexShrink: 0 }} />
                {GROUP_LABELS[gr] ?? gr}
              </button>
            ))}

            <span style={{ flex: 1 }} />

            <button
              onClick={() => setOnlyConnected((v) => !v)}
              style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '99px', border: `1px solid ${onlyConnected ? '#3B4ED9' : BORDER}`, background: onlyConnected ? '#3B4ED9' : 'transparent', color: onlyConnected ? '#fff' : MUTED, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
            >
              Solo conectados
            </button>

            {graphData?.meta?.truncated && (
              <button
                onClick={() => setShowAll((v) => !v)}
                style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '99px', border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
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
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '220px', background: INK, border: `1px solid ${(GROUP_COLORS[panelData.group] ?? '#3B4ED9') + '55'}`, borderLeft: `3px solid ${GROUP_COLORS[panelData.group] ?? '#3B4ED9'}`, borderRadius: '10px', padding: '14px', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: GROUP_COLORS[panelData.group] ?? '#6B7AE8', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    {GROUP_LABELS[panelData.group] ?? panelData.group}
                  </span>
                  <button onClick={() => { setPanelSlug(null); setPanelData(null); }} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>x</button>
                </div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#F4F6F8', margin: '0 0 8px', lineHeight: 1.35 }}>{panelData.label}</h3>
                <span style={{ fontSize: '10px', color: '#6B7AE8', background: 'rgba(107,122,232,0.1)', padding: '2px 7px', borderRadius: '4px' }}>{panelData.connections} enlaces</span>
              </div>
            )}
          </div>

          {/* Legend + stats */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${BORDER}`, alignItems: 'center' }}>
            {availableGroups.map((gr) => (
              <div key={gr} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GROUP_COLORS[gr] ?? MUTED, display: 'block' }} />
                <span style={{ fontSize: '10px', color: MUTED, fontFamily: 'Montserrat, sans-serif' }}>{GROUP_LABELS[gr] ?? gr}</span>
              </div>
            ))}
            <span style={{ fontSize: '10px', color: '#4B5563', marginLeft: 'auto' }}>
              {totalNotes} notas · {nodeCount} mostradas · {edgeCount} enlaces reales
              {graphData?.meta?.orphans ? ` · ${graphData.meta.orphans} sin enlaces` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
