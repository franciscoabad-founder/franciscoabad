import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  group: string;
  connections: number;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface SelectedNode {
  id: string;
  label: string;
  type: string;
  group: string;
  connections: number;
}

const GROUP_COLORS: Record<string, string> = {
  braintech: '#6B7AE8',
  codeis:    '#34D399',
  taskr:     '#FB923C',
  arazza:    '#4ADE80',
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
  arazza:    'Arazzá',
  rafik:     'Rafik',
  marca:     'Marca',
  sistema:   'Sistema',
  personal:  'Personal',
  otros:     'Otros',
};

function nodeRadius(connections: number): number {
  return 5 + Math.min(connections, 10) * 1.8;
}

export default function OSGraphBrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  // Filter effect: update opacity without restarting simulation
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (activeGroup) {
      svg.selectAll<SVGGElement, GraphNode>('.node-g')
        .attr('opacity', (d) => (d.group === activeGroup ? 1 : 0.12));
      svg.selectAll<SVGLineElement, GraphEdge>('.edge-line')
        .attr('opacity', (d) => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          return s.group === activeGroup || t.group === activeGroup ? 0.4 : 0.04;
        });
    } else {
      svg.selectAll('.node-g').attr('opacity', 1);
      svg.selectAll('.edge-line').attr('opacity', 0.3);
    }
  }, [activeGroup]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch('/api/brain/graph');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        const rawNodes: Array<{ id: string; label: string; type: string; group: string }> = data.nodes;
        const rawEdges: Array<{ source: string; target: string }> = data.edges;

        const connCount: Record<string, number> = {};
        for (const e of rawEdges) {
          connCount[e.source] = (connCount[e.source] || 0) + 1;
          connCount[e.target] = (connCount[e.target] || 0) + 1;
        }

        const nodes: GraphNode[] = rawNodes.map((n) => ({
          ...n,
          connections: connCount[n.id] || 0,
        }));

        const groups = [...new Set(nodes.map((n) => n.group))].sort();
        setAvailableGroups(groups);
        setNodeCount(nodes.length);
        setEdgeCount(rawEdges.length);
        setLoading(false);

        if (!containerRef.current || !svgRef.current || cancelled) return;

        const W = containerRef.current.clientWidth || 840;
        const H = 560;

        const svg = d3.select(svgRef.current)
          .attr('width', W)
          .attr('height', H)
          .style('background', 'transparent');

        svg.selectAll('*').remove();

        const g = svg.append('g');

        // Zoom + pan
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.15, 5])
          .on('zoom', (event) => g.attr('transform', event.transform));
        svg.call(zoom).on('dblclick.zoom', null);

        // Group centroids for clustering
        const groupList = [...new Set(nodes.map((n) => n.group))];
        const groupCentroids: Record<string, { x: number; y: number }> = {};
        groupList.forEach((grp, i) => {
          const angle = (i / groupList.length) * 2 * Math.PI - Math.PI / 2;
          const r = Math.min(W, H) * 0.28;
          groupCentroids[grp] = {
            x: W / 2 + r * Math.cos(angle),
            y: H / 2 + r * Math.sin(angle),
          };
        });

        // Seed positions near group centroids
        nodes.forEach((n) => {
          const c = groupCentroids[n.group] ?? { x: W / 2, y: H / 2 };
          n.x = c.x + (Math.random() - 0.5) * 80;
          n.y = c.y + (Math.random() - 0.5) * 80;
        });

        const edges = rawEdges as unknown as GraphEdge[];

        const sim = d3.forceSimulation<GraphNode>(nodes)
          .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
            .id((d) => d.id)
            .distance(90)
            .strength(0.6))
          .force('charge', d3.forceManyBody<GraphNode>().strength(-280))
          .force('collide', d3.forceCollide<GraphNode>()
            .radius((d) => nodeRadius(d.connections) + 10))
          .force('cluster', (() => {
            // Custom clustering force
            const clusterForce = () => {
              const alpha = sim.alpha();
              for (const n of nodes) {
                const c = groupCentroids[n.group];
                if (!c) continue;
                n.vx = (n.vx ?? 0) + (c.x - (n.x ?? 0)) * 0.04 * alpha;
                n.vy = (n.vy ?? 0) + (c.y - (n.y ?? 0)) * 0.04 * alpha;
              }
            };
            return clusterForce;
          })())
          .alphaDecay(0.02)
          .velocityDecay(0.35);

        simRef.current = sim;

        // Edges
        const edgeSel = g.append('g')
          .selectAll<SVGLineElement, GraphEdge>('line')
          .data(edges)
          .enter()
          .append('line')
          .attr('class', 'edge-line')
          .attr('stroke', 'rgba(107,122,232,0.25)')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3);

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
          .attr('r', (d) => nodeRadius(d.connections) + 7)
          .attr('fill', (d) => GROUP_COLORS[d.group] ?? '#6B7280')
          .attr('opacity', 0);

        nodeSel.append('circle')
          .attr('class', 'node-circle')
          .attr('r', (d) => nodeRadius(d.connections))
          .attr('fill', (d) => (GROUP_COLORS[d.group] ?? '#6B7280') + '33')
          .attr('stroke', (d) => GROUP_COLORS[d.group] ?? '#6B7280')
          .attr('stroke-width', 1.5);

        nodeSel.append('text')
          .attr('class', 'node-label')
          .attr('text-anchor', 'middle')
          .attr('dy', (d) => nodeRadius(d.connections) + 13)
          .attr('fill', '#6B7280')
          .attr('font-size', '9px')
          .attr('font-family', 'Montserrat, sans-serif')
          .attr('pointer-events', 'none')
          .text((d) => (d.connections >= 3 ? d.label : ''));

        // Drag
        nodeSel.call(
          d3.drag<SVGGElement, GraphNode>()
            .on('start', (event, d) => {
              if (!event.active) sim.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on('drag', (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on('end', (event, d) => {
              if (!event.active) sim.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            })
        );

        // Hover
        nodeSel
          .on('mouseenter', function (_, d) {
            d3.select(this).select('.node-halo').attr('opacity', 0.1);
            d3.select(this).select('.node-circle')
              .transition().duration(120)
              .attr('fill', (GROUP_COLORS[d.group] ?? '#6B7280') + '66')
              .attr('stroke-width', 2.5)
              .attr('r', nodeRadius(d.connections) + 2);
            d3.select(this).select('.node-label')
              .text(d.label)
              .attr('fill', '#F4F6F8')
              .attr('font-size', '10px')
              .attr('font-weight', '700');
            edgeSel
              .attr('stroke', (e) => {
                const s = e.source as GraphNode;
                const t = e.target as GraphNode;
                return s.id === d.id || t.id === d.id
                  ? 'rgba(107,122,232,0.75)'
                  : 'rgba(107,122,232,0.07)';
              })
              .attr('stroke-width', (e) => {
                const s = e.source as GraphNode;
                const t = e.target as GraphNode;
                return s.id === d.id || t.id === d.id ? 2 : 1;
              });
          })
          .on('mouseleave', function (_, d) {
            d3.select(this).select('.node-halo').attr('opacity', 0);
            d3.select(this).select('.node-circle')
              .transition().duration(120)
              .attr('fill', (GROUP_COLORS[d.group] ?? '#6B7280') + '33')
              .attr('stroke-width', 1.5)
              .attr('r', nodeRadius(d.connections));
            d3.select(this).select('.node-label')
              .text(d.connections >= 3 ? d.label : '')
              .attr('fill', '#6B7280')
              .attr('font-size', '9px')
              .attr('font-weight', '400');
            edgeSel
              .attr('stroke', 'rgba(107,122,232,0.25)')
              .attr('stroke-width', 1);
          })
          .on('click', (event, d) => {
            event.stopPropagation();
            setSelectedNode({ id: d.id, label: d.label, type: d.type, group: d.group, connections: d.connections });
          });

        svg.on('click', () => setSelectedNode(null));

        // Tick
        sim.on('tick', () => {
          edgeSel
            .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
            .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
            .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
            .attr('y2', (d) => (d.target as GraphNode).y ?? 0);
          nodeSel.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
        });

        // Auto zoom-to-fit when simulation settles
        sim.on('end', () => {
          const xs = nodes.map((n) => n.x ?? 0);
          const ys = nodes.map((n) => n.y ?? 0);
          if (!xs.length) return;
          const x0 = Math.min(...xs) - 40;
          const x1 = Math.max(...xs) + 40;
          const y0 = Math.min(...ys) - 40;
          const y1 = Math.max(...ys) + 40;
          const scale = Math.min(0.92, W / (x1 - x0), H / (y1 - y0));
          const tx = (W - scale * (x0 + x1)) / 2;
          const ty = (H - scale * (y0 + y1)) / 2;
          svg.transition().duration(600).call(
            zoom.transform,
            d3.zoomIdentity.translate(tx, ty).scale(scale)
          );
        });

      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      simRef.current?.stop();
    };
  }, []);

  const MUTED = '#6B7280';
  const BORDER = 'rgba(232,234,240,0.1)';
  const INK = '#0E1738';

  return (
    <div>
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: MUTED, fontSize: '13px' }}>
          Conectando con gbrain...
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#F87171', fontSize: '12px' }}>
          No se pudo cargar el grafo: {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveGroup(null)}
              style={{
                fontSize: '11px', padding: '4px 12px', borderRadius: '99px',
                border: `1px solid ${!activeGroup ? '#3B4ED9' : BORDER}`,
                background: !activeGroup ? '#3B4ED9' : 'transparent',
                color: !activeGroup ? '#fff' : MUTED,
                cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Todos
            </button>
            {availableGroups.map((gr) => (
              <button
                key={gr}
                onClick={() => setActiveGroup(gr === activeGroup ? null : gr)}
                style={{
                  fontSize: '11px', padding: '4px 12px', borderRadius: '99px',
                  border: `1px solid ${activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) : BORDER}`,
                  background: activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) + '22' : 'transparent',
                  color: activeGroup === gr ? (GROUP_COLORS[gr] ?? MUTED) : MUTED,
                  cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: GROUP_COLORS[gr] ?? MUTED, display: 'inline-block', flexShrink: 0,
                }} />
                {GROUP_LABELS[gr] ?? gr}
              </button>
            ))}
          </div>

          {/* Graph canvas */}
          <div ref={containerRef} style={{ position: 'relative' }}>
            <svg
              ref={svgRef}
              style={{ width: '100%', display: 'block', borderRadius: '8px' }}
            />

            {/* Node detail panel */}
            {selectedNode && (
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '220px', background: INK,
                border: `1px solid ${(GROUP_COLORS[selectedNode.group] ?? '#3B4ED9') + '44'}`,
                borderLeft: `3px solid ${GROUP_COLORS[selectedNode.group] ?? '#3B4ED9'}`,
                borderRadius: '10px', padding: '14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: GROUP_COLORS[selectedNode.group] ?? '#6B7AE8',
                    fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
                  }}>
                    {GROUP_LABELS[selectedNode.group] ?? selectedNode.group}
                  </span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#F4F6F8', margin: '0 0 10px', lineHeight: 1.35 }}>
                  {selectedNode.label}
                </h3>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(232,234,240,0.06)', padding: '2px 7px', borderRadius: '4px' }}>
                    {selectedNode.type}
                  </span>
                  <span style={{ fontSize: '10px', color: '#6B7AE8', background: 'rgba(107,122,232,0.1)', padding: '2px 7px', borderRadius: '4px' }}>
                    {selectedNode.connections} enlaces
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legend + stats */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${BORDER}`, alignItems: 'center' }}>
            {availableGroups.map((gr) => (
              <div key={gr} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GROUP_COLORS[gr] ?? MUTED, display: 'block' }} />
                <span style={{ fontSize: '10px', color: MUTED, fontFamily: 'Montserrat, sans-serif' }}>
                  {GROUP_LABELS[gr] ?? gr}
                </span>
              </div>
            ))}
            <span style={{ fontSize: '10px', color: '#374151', marginLeft: 'auto' }}>
              {nodeCount} nodos · {edgeCount} enlaces
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
