import { useEffect, useRef, useState } from 'react';
import type { GrafoNodo, GrafoArista } from '../data/types';

interface NodeSim extends GrafoNodo {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Props {
  nodos: GrafoNodo[];
  aristas: GrafoArista[];
}

const TIPO_COLOR: Record<string, string> = {
  proyecto:    '#3B4ED9',
  concepto:    '#6B7AE8',
  persona:     '#B5985A',
  herramienta: '#6B7280',
};

const W = 720;
const H = 340;

export default function OSGraphBrain({ nodos, aristas }: Props) {
  const simRef = useRef<NodeSim[]>([]);
  const frameRef = useRef<number>(0);
  const alphaRef = useRef<number>(1);
  const [, forceRender] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    alphaRef.current = 1;
    simRef.current = nodos.map((n) => ({
      ...n,
      x: W / 2 + (Math.random() - 0.5) * W * 0.5,
      y: H / 2 + (Math.random() - 0.5) * H * 0.5,
      vx: 0,
      vy: 0,
    }));

    const tick = () => {
      const nodes = simRef.current;
      const alpha = alphaRef.current;
      if (alpha < 0.003) { cancelAnimationFrame(frameRef.current); return; }

      const cx = W / 2;
      const cy = H / 2;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.vx += (cx - a.x) * 0.018 * alpha;
        a.vy += (cy - a.y) * 0.018 * alpha;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy + 1;
          const force = -130 / dist2;
          a.vx += dx * force * alpha;
          a.vy += dy * force * alpha;
        }
      }

      for (const edge of aristas) {
        const src = nodes.find(n => n.id === edge.origen);
        const tgt = nodes.find(n => n.id === edge.destino);
        if (!src || !tgt) continue;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 130;
        const diff = (dist - targetDist) / dist * 0.04 * alpha;
        src.vx += dx * diff;
        src.vy += dy * diff;
        tgt.vx -= dx * diff;
        tgt.vy -= dy * diff;
      }

      const pad = 36;
      for (const n of nodes) {
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x = Math.max(pad, Math.min(W - pad, n.x + n.vx));
        n.y = Math.max(pad, Math.min(H - pad, n.y + n.vy));
      }

      alphaRef.current = alpha * 0.975;
      forceRender(t => t + 1);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [nodos, aristas]);

  const nodes = simRef.current;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', maxHeight: 340, display: 'block' }}
      aria-label="Grafo de proyectos y conceptos"
    >
      {aristas.map((e, i) => {
        const src = nodes.find(n => n.id === e.origen);
        const tgt = nodes.find(n => n.id === e.destino);
        if (!src || !tgt) return null;
        const isHighlighted = hovered === e.origen || hovered === e.destino;
        return (
          <line
            key={i}
            x1={src.x} y1={src.y}
            x2={tgt.x} y2={tgt.y}
            stroke={isHighlighted ? 'rgba(107,122,232,0.5)' : 'rgba(59,78,217,0.2)'}
            strokeWidth={isHighlighted ? 1.5 : 1}
          />
        );
      })}
      {nodes.map((n) => {
        const r = 7 + n.peso * 4;
        const color = TIPO_COLOR[n.tipo] ?? '#6B7280';
        const isHov = hovered === n.id;
        return (
          <g
            key={n.id}
            style={{ cursor: 'default' }}
            onMouseEnter={() => setHovered(n.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHov && (
              <circle cx={n.x} cy={n.y} r={r + 6} fill={color} opacity={0.12} />
            )}
            <circle
              cx={n.x} cy={n.y} r={r}
              fill={isHov ? color : color + '22'}
              stroke={color}
              strokeWidth={isHov ? 2 : 1.5}
            />
            <text
              x={n.x} y={n.y + r + 13}
              textAnchor="middle"
              fontSize={isHov ? 11 : 9.5}
              fill={isHov ? '#F4F6F8' : '#6B7280'}
              fontFamily="'Montserrat', sans-serif"
              fontWeight={isHov ? 700 : 400}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
