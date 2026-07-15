import { useEffect, useMemo, useRef, useState } from 'react';
import { FASES_AYUNO, faseActual, duracionHoras, formatearDuracion } from '../../../lib/salud/ayuno';

interface Ayuno {
  id: string; inicio: string; fin: string | null;
  protocolo: string; objetivo_horas: number; notas: string | null;
}

const PROTOCOLOS = [
  { key: '16_8', label: '16:8', horas: 16 },
  { key: '18_6', label: '18:6', horas: 18 },
  { key: '20_4', label: '20:4', horas: 20 },
  { key: 'omad', label: 'OMAD', horas: 23 },
  { key: 'extendido', label: 'Extendido', horas: 36 },
  { key: 'custom', label: 'Custom', horas: 16 },
];

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
const selStyle: React.CSSProperties = {
  background: '#0E1738', border: '1px solid var(--os-line)', borderRadius: 6,
  padding: '8px 10px', fontSize: 13, color: 'var(--os-text)', colorScheme: 'dark', outline: 'none',
};

export default function OSSaludAyuno() {
  const [activo, setActivo] = useState<Ayuno | null>(null);
  const [historial, setHistorial] = useState<Ayuno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [protocolo, setProtocolo] = useState('16_8');
  const [nowMs, setNowMs] = useState<number>(0); // tick de reloj; 0 hasta montar (evita hydration mismatch)
  const [editId, setEditId] = useState<string | null>(null);
  const [editVals, setEditVals] = useState({ inicio: '', fin: '' });
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function cargar() {
    setLoading(true); setError('');
    try {
      const [resAbierto, resHist] = await Promise.all([
        fetch('/api/os/salud/ayunos?abierto=1'),
        fetch('/api/os/salud/ayunos'),
      ]);
      const dataAbierto = await resAbierto.json();
      const dataHist = await resHist.json();
      if (dataAbierto.error) throw new Error(dataAbierto.error);
      setActivo(dataAbierto.ayuno ?? null);
      if (dataAbierto.ayuno) setProtocolo(dataAbierto.ayuno.protocolo);
      setHistorial(dataHist.ayunos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  // Tick de reloj SOLO para re-render del display. El estado real vive en DB (inicio).
  useEffect(() => {
    setNowMs(Date.now());
    tickRef.current = setInterval(() => setNowMs(Date.now()), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  async function iniciar() {
    setError('');
    const p = PROTOCOLOS.find((x) => x.key === protocolo) ?? PROTOCOLOS[0];
    try {
      const res = await fetch('/api/os/salud/ayunos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolo, objetivo_horas: p.horas }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      cargar();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  }

  async function terminar() {
    if (!activo) return;
    try {
      await fetch(`/api/os/salud/ayunos?id=${activo.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fin: new Date().toISOString() }),
      });
      cargar();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  }

  async function guardarEdicion(id: string) {
    try {
      const body: Record<string, unknown> = {};
      if (editVals.inicio) body.inicio = new Date(editVals.inicio).toISOString();
      if (editVals.fin) body.fin = new Date(editVals.fin).toISOString();
      await fetch(`/api/os/salud/ayunos?id=${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      setEditId(null);
      cargar();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  }

  async function borrar(id: string) {
    if (!confirm('¿Borrar este ayuno?')) return;
    await fetch(`/api/os/salud/ayunos?id=${id}`, { method: 'DELETE' });
    cargar();
  }

  const horasActual = useMemo(() => {
    if (!activo || !nowMs) return 0;
    return duracionHoras(activo.inicio, null, nowMs);
  }, [activo, nowMs]);

  const fase = faseActual(horasActual);
  const progresoPct = activo && activo.objetivo_horas > 0
    ? Math.min(100, (horasActual / activo.objetivo_horas) * 100) : 0;
  const C = 2 * Math.PI * 54;

  // Racha semanal: ayunos completados (con fin) en los últimos 7 días.
  const racha = useMemo(() => {
    const hace7 = Date.now() - 7 * 86400000;
    return historial.filter((a) => a.fin && new Date(a.inicio).getTime() >= hace7).length;
  }, [historial]);

  function inputLocal(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && <div style={{ color: 'var(--os-error)', fontSize: 13 }}>{error}</div>}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Cargando...</p>
      ) : activo ? (
        // ── Ayuno en curso: timer en vivo ──
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 200, height: 200 }}>
            <svg viewBox="0 0 120 120" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--os-line)" strokeWidth="7" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--os-accent)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${(progresoPct / 100) * C} ${C}`} style={{ transition: 'stroke-dasharray 1s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{formatearDuracion(horasActual)}</span>
              <span style={{ fontSize: 11, color: 'var(--os-muted)', marginTop: 4 }}>de {activo.objetivo_horas}h · {Math.round(progresoPct)}%</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--os-font-display)', fontSize: 15, fontWeight: 700, color: 'var(--os-accent-light)', margin: 0 }}>{fase.nombre}</p>
            <p style={{ fontSize: 12, color: 'var(--os-text-2)', margin: '4px 0 0', maxWidth: 340, lineHeight: 1.4 }}>{fase.descripcion}</p>
          </div>

          <p style={{ fontSize: 12, color: 'var(--os-muted)', margin: 0 }}>
            Inició {new Date(activo.inicio).toLocaleString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {activo.protocolo}
          </p>

          <button style={btn} onClick={terminar}>Terminar ayuno</button>
        </div>
      ) : (
        // ── Sin ayuno activo: iniciar ──
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--os-text-2)', margin: 0 }}>No hay ayuno activo.</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <select style={selStyle} value={protocolo} onChange={(e) => setProtocolo(e.target.value)}>
              {PROTOCOLOS.map((p) => <option key={p.key} value={p.key}>{p.label} ({p.horas}h)</option>)}
            </select>
            <button style={btn} onClick={iniciar}>Iniciar ayuno</button>
          </div>
        </div>
      )}

      {/* Fases (referencia) */}
      <div style={card}>
        <p style={{ fontFamily: 'var(--os-font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--os-muted)', margin: '0 0 10px' }}>Fases del ayuno</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {FASES_AYUNO.map((f) => {
            const activa = activo && fase.key === f.key;
            return (
              <div key={f.key} style={{ display: 'flex', gap: 10, padding: '6px 8px', borderRadius: 6, background: activa ? 'rgba(59,78,217,0.13)' : 'transparent' }}>
                <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 11, color: activa ? 'var(--os-accent-light)' : 'var(--os-muted)', minWidth: 54 }}>
                  {f.hasta === Infinity ? `${f.desde}h+` : `${f.desde}-${f.hasta}h`}
                </span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: activa ? 700 : 500, color: activa ? 'var(--os-text)' : 'var(--os-text-2)' }}>{f.nombre}</span>
                  <p style={{ fontSize: 11, color: 'var(--os-muted)', margin: '1px 0 0', lineHeight: 1.35 }}>{f.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Racha semanal */}
      <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--os-text-2)' }}>Ayunos completados (7 días)</span>
        <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 18, color: 'var(--os-champagne)', fontWeight: 700 }}>{racha}</span>
      </div>

      {/* Historial */}
      <div style={card}>
        <p style={{ fontFamily: 'var(--os-font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--os-muted)', margin: '0 0 10px' }}>Historial</p>
        {historial.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--os-muted)', margin: 0 }}>Sin registros aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {historial.slice(0, 20).map((a) => {
              const dur = duracionHoras(a.inicio, a.fin, nowMs || undefined);
              const cumplido = dur >= a.objetivo_horas;
              return (
                <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--os-line-soft)' }}>
                  {editId === a.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, color: 'var(--os-muted)' }}>Inicio
                        <input type="datetime-local" style={{ ...selStyle, width: '100%', marginTop: 2 }} value={editVals.inicio} onChange={(e) => setEditVals({ ...editVals, inicio: e.target.value })} /></label>
                      <label style={{ fontSize: 11, color: 'var(--os-muted)' }}>Fin
                        <input type="datetime-local" style={{ ...selStyle, width: '100%', marginTop: 2 }} value={editVals.fin} onChange={(e) => setEditVals({ ...editVals, fin: e.target.value })} /></label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={btn} onClick={() => guardarEdicion(a.id)}>Guardar</button>
                        <button style={btnGhost} onClick={() => setEditId(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 13, color: 'var(--os-text)' }}>
                          {new Date(a.inicio).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} · {a.protocolo}
                        </span>
                        <p style={{ fontSize: 11, fontFamily: 'var(--os-font-mono)', color: cumplido ? 'var(--os-ok)' : 'var(--os-muted)', margin: '2px 0 0' }}>
                          {formatearDuracion(dur)} / {a.objetivo_horas}h {a.fin ? (cumplido ? '✓' : '') : '· en curso'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ ...btnGhost, padding: '4px 8px' }} onClick={() => { setEditId(a.id); setEditVals({ inicio: inputLocal(a.inicio), fin: inputLocal(a.fin) }); }} title="Editar">✎</button>
                        <button style={{ ...btnGhost, padding: '4px 8px' }} onClick={() => borrar(a.id)} title="Borrar">✕</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
