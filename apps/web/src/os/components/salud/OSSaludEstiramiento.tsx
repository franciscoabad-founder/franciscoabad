import { useEffect, useRef, useState } from 'react';

interface Paso { nombre: string; detalle: string; duracion_seg: number; por_lado: boolean }
interface RutinaEstiramiento { id: string; nombre: string; descripcion: string | null; pasos: Paso[] }

const card: React.CSSProperties = {
  background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)',
  borderRadius: 'var(--os-r-card)', padding: '1rem',
};
const btn: React.CSSProperties = {
  background: 'var(--os-accent)', color: '#fff', border: 'none', borderRadius: 6,
  padding: '10px 20px', fontSize: 14, fontFamily: 'var(--os-font-display)', fontWeight: 700, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: 'var(--os-muted)', border: '1px solid var(--os-line)',
  borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
};

// Expande pasos "por lado" en dos sub-pasos (izquierdo/derecho).
function expandirPasos(pasos: Paso[]): Array<{ nombre: string; detalle: string; duracion_seg: number }> {
  const out: Array<{ nombre: string; detalle: string; duracion_seg: number }> = [];
  for (const p of pasos) {
    if (p.por_lado) {
      out.push({ nombre: `${p.nombre} (lado izquierdo)`, detalle: p.detalle, duracion_seg: p.duracion_seg });
      out.push({ nombre: `${p.nombre} (lado derecho)`, detalle: p.detalle, duracion_seg: p.duracion_seg });
    } else {
      out.push({ nombre: p.nombre, detalle: p.detalle, duracion_seg: p.duracion_seg });
    }
  }
  return out;
}

// Beep corto usando Web Audio (sin assets). Silencioso si el navegador lo bloquea.
function beep() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 660; gain.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    setTimeout(() => ctx.close(), 300);
  } catch { /* audio bloqueado */ }
}

export default function OSSaludEstiramiento() {
  const [rutinas, setRutinas] = useState<RutinaEstiramiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activa, setActiva] = useState<RutinaEstiramiento | null>(null);

  useEffect(() => {
    fetch('/api/os/salud/estiramiento').then((r) => r.json()).then((d) => { setRutinas(d.rutinas ?? []); setLoading(false); });
  }, []);

  if (activa) return <Reproductor rutina={activa} onSalir={() => setActiva(null)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {loading ? <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Cargando...</p> :
        !rutinas.length ? <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Sin rutinas. Corre el seed de estiramiento.</p> :
        rutinas.map((r) => (
          <div key={r.id} style={card}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--os-text)', margin: 0 }}>{r.nombre}</p>
            {r.descripcion && <p style={{ fontSize: 12, color: 'var(--os-muted)', margin: '3px 0 0' }}>{r.descripcion}</p>}
            <p style={{ fontSize: 11, color: 'var(--os-muted)', margin: '6px 0 10px' }}>{r.pasos?.length ?? 0} pasos</p>
            <button style={btn} onClick={() => setActiva(r)}>▶ Empezar</button>
          </div>
        ))
      }
    </div>
  );
}

function Reproductor({ rutina, onSalir }: { rutina: RutinaEstiramiento; onSalir: () => void }) {
  const pasos = expandirPasos(rutina.pasos ?? []);
  const [idx, setIdx] = useState(0);
  const [restante, setRestante] = useState(pasos[0]?.duracion_seg ?? 0);
  const [pausado, setPausado] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const actual = pasos[idx];

  // Cuenta regresiva del paso actual.
  useEffect(() => {
    if (pausado || terminado) return;
    timerRef.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) { avanzar(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, [idx, pausado, terminado]);

  function avanzar() {
    if (timerRef.current) clearInterval(timerRef.current);
    beep();
    if (navigator.vibrate) navigator.vibrate(200);
    if (idx < pasos.length - 1) {
      const next = idx + 1;
      setIdx(next);
      setRestante(pasos[next].duracion_seg);
    } else {
      setTerminado(true);
    }
  }

  function saltar() { avanzar(); }
  function reiniciarPaso() { setRestante(actual?.duracion_seg ?? 0); }

  const totalSeg = pasos.reduce((a, p) => a + p.duracion_seg, 0);
  const transcurrido = pasos.slice(0, idx).reduce((a, p) => a + p.duracion_seg, 0) + ((actual?.duracion_seg ?? 0) - restante);
  const pctTotal = totalSeg > 0 ? Math.round((transcurrido / totalSeg) * 100) : 0;

  if (terminado) {
    return (
      <div style={{ ...card, textAlign: 'center', maxWidth: 480, margin: '2rem auto' }}>
        <p style={{ fontSize: 40, margin: 0 }}>✓</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--os-text)', margin: '8px 0' }}>Rutina completada</p>
        <p style={{ fontSize: 13, color: 'var(--os-muted)', margin: '0 0 16px' }}>{rutina.nombre}</p>
        <button style={btn} onClick={onSalir}>Volver</button>
      </div>
    );
  }

  const C = 2 * Math.PI * 54;
  const pctPaso = actual && actual.duracion_seg > 0 ? (restante / actual.duracion_seg) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', maxWidth: 480, margin: '0 auto' }}>
      {/* Progreso total */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
        <button style={btnGhost} onClick={() => { if (confirm('¿Salir de la rutina?')) onSalir(); }}>✕</button>
        <div style={{ flex: 1, height: 6, background: 'rgba(232,234,240,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pctTotal}%`, background: 'var(--os-accent)', borderRadius: 3, transition: 'width .3s' }} />
        </div>
        <span style={{ fontSize: 12, fontFamily: 'var(--os-font-mono)', color: 'var(--os-muted)' }}>{idx + 1}/{pasos.length}</span>
      </div>

      {/* Cronómetro grande */}
      <div style={{ position: 'relative', width: 240, height: 240 }}>
        <svg viewBox="0 0 120 120" width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--os-line)" strokeWidth="6" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--os-accent)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${pctPaso * C} ${C}`} style={{ transition: 'stroke-dasharray 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 52, fontWeight: 700, lineHeight: 1 }}>{restante}</span>
          <span style={{ fontSize: 11, color: 'var(--os-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>segundos</span>
        </div>
      </div>

      {/* Paso actual */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--os-text)', margin: 0 }}>{actual?.nombre}</p>
        <p style={{ fontSize: 14, color: 'var(--os-text-2)', margin: '6px 0 0', lineHeight: 1.4, maxWidth: 360 }}>{actual?.detalle}</p>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button style={btn} onClick={() => setPausado(!pausado)}>{pausado ? '▶ Reanudar' : '⏸ Pausar'}</button>
        <button style={btnGhost} onClick={reiniciarPaso}>↻ Reiniciar paso</button>
        <button style={btnGhost} onClick={saltar}>Saltar →</button>
      </div>

      {/* Siguiente */}
      {idx < pasos.length - 1 && (
        <p style={{ fontSize: 12, color: 'var(--os-muted)' }}>Sigue: {pasos[idx + 1]?.nombre}</p>
      )}
    </div>
  );
}
