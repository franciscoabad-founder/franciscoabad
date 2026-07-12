import { useEffect, useState } from 'react';

interface Nota {
  id: string;
  contenido: string;
  tags: string[];
  estado: 'activa' | 'convertida' | 'archivada';
  convertida_a: string | null;
  created_at: string;
}

type Destino = 'pendiente' | 'tarea' | 'recordatorio';

const DESTINO_LABEL: Record<Destino, string> = {
  pendiente: 'Pendiente',
  tarea: 'Tarea',
  recordatorio: 'Recordatorio',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(232,234,240,0.05)',
  border: '1px solid var(--os-line)',
  borderRadius: 6,
  padding: '7px 11px',
  fontSize: 12,
  color: 'var(--os-text)',
  fontFamily: 'var(--os-font-body)',
  outline: 'none',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontFamily: 'var(--os-font-display)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--os-muted)',
  display: 'block',
  marginBottom: 4,
};

export default function OSNotas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Modal de conversion
  const [modal, setModal] = useState<{ nota: Nota; destino: Destino } | null>(null);
  const [mTitulo, setMTitulo] = useState('');
  const [mProyecto, setMProyecto] = useState('');
  const [mDeadline, setMDeadline] = useState('');
  const [mPrioridad, setMPrioridad] = useState('medium');
  const [mGrupo, setMGrupo] = useState('general');
  const [mRecordarAt, setMRecordarAt] = useState('');
  const [mError, setMError] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/os/notas');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setNotas(data.notas ?? []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function capturar(e: React.FormEvent) {
    e.preventDefault();
    if (!contenido.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/os/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: contenido.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setContenido('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function archivar(id: string) {
    try {
      const res = await fetch(`/api/os/notas?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'archivada' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function abrirModal(nota: Nota, destino: Destino) {
    setMTitulo(nota.contenido.slice(0, 120));
    setMProyecto('');
    setMDeadline('');
    setMPrioridad('medium');
    setMGrupo('general');
    setMRecordarAt('');
    setMError('');
    setModal({ nota, destino });
  }

  async function confirmarConversion() {
    if (!modal) return;
    const { nota, destino } = modal;
    const payload: Record<string, unknown> = {};
    if (destino === 'pendiente') {
      payload.titulo = mTitulo.trim() || undefined;
      payload.proyecto = mProyecto.trim() || undefined;
    } else if (destino === 'tarea') {
      payload.titulo = mTitulo.trim() || undefined;
      payload.proyecto = mProyecto.trim() || undefined;
      payload.deadline = mDeadline || undefined;
      payload.prioridad = mPrioridad;
      payload.grupo = mGrupo.trim() || 'general';
    } else {
      if (!mRecordarAt) { setMError('Fecha y hora requeridas para el recordatorio.'); return; }
      payload.mensaje = mTitulo.trim() || undefined;
      payload.recordar_at = new Date(mRecordarAt).toISOString();
    }
    try {
      const res = await fetch('/api/os/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convertir: { id: nota.id, a: destino, payload } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setModal(null);
      await load();
    } catch (err) {
      setMError(err instanceof Error ? err.message : String(err));
    }
  }

  const activas = notas.filter((n) => n.estado === 'activa');
  const resto = notas.filter((n) => n.estado !== 'activa');

  return (
    <div>
      <form onSubmit={capturar} className="os-card-2" style={{ padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Captura un pensamiento, idea o dato. Luego decides si se vuelve pendiente, tarea o recordatorio."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="os-btn" disabled={busy || !contenido.trim()} style={{ padding: '6px 16px', fontSize: 12 }}>
            {busy ? 'Guardando...' : 'Guardar nota'}
          </button>
        </div>
      </form>

      {error && <p style={{ color: 'var(--os-error)', fontSize: 12, marginBottom: 10 }}>Error: {error}</p>}
      {loading && <div className="os-card-2" style={{ padding: '1rem', color: 'var(--os-muted)', fontSize: 13 }}>Cargando...</div>}

      {!loading && !notas.length && (
        <div className="os-card-2" style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--os-muted)', fontSize: 12 }}>
          Sin notas. Todo empieza con una captura.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...activas, ...resto].map((n) => {
          const activa = n.estado === 'activa';
          return (
            <div key={n.id} style={{
              background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)',
              borderRadius: 10, padding: '0.75rem 0.875rem', opacity: activa ? 1 : 0.6,
            }}>
              <p style={{ fontSize: 13, color: 'var(--os-text)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.contenido}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: 'var(--os-muted)', fontFamily: 'var(--os-font-mono)' }}>
                  {new Date(n.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                </span>
                {n.estado === 'convertida' && (
                  <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'var(--os-font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Convertida a {n.convertida_a}
                  </span>
                )}
                {n.estado === 'archivada' && (
                  <span style={{ fontSize: 10, color: 'var(--os-muted)', fontFamily: 'var(--os-font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Archivada
                  </span>
                )}
                {activa && (
                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
                    {(['pendiente', 'tarea', 'recordatorio'] as Destino[]).map((d) => (
                      <button key={d} onClick={() => abrirModal(n, d)}
                        style={{ background: 'rgba(59,78,217,0.14)', border: '1px solid rgba(59,78,217,0.35)', borderRadius: 6, color: '#6B7AE8', cursor: 'pointer', padding: '3px 9px', fontSize: 10, fontFamily: 'var(--os-font-display)', fontWeight: 700 }}>
                        {'→'} {DESTINO_LABEL[d]}
                      </button>
                    ))}
                    <button onClick={() => archivar(n.id)}
                      style={{ background: 'none', border: '1px solid var(--os-line)', borderRadius: 6, color: 'var(--os-muted)', cursor: 'pointer', padding: '3px 9px', fontSize: 10, fontFamily: 'var(--os-font-display)', fontWeight: 700 }}>
                      Archivar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ width: 420, maxWidth: '100%', background: '#0E1738', border: '1px solid var(--os-line-accent)', borderRadius: 12, boxShadow: 'var(--os-shadow-modal)', padding: '1.25rem' }}>
            <p className="os-eyebrow" style={{ marginBottom: 4 }}>Convertir nota</p>
            <h3 style={{ fontFamily: 'var(--os-font-display)', fontSize: 16, color: 'var(--os-text)', margin: '0 0 12px' }}>
              {'→'} {DESTINO_LABEL[modal.destino]}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={labelStyle}>{modal.destino === 'recordatorio' ? 'Mensaje' : 'Titulo'}</label>
                <input value={mTitulo} onChange={(e) => setMTitulo(e.target.value)} style={inputStyle} />
              </div>

              {modal.destino !== 'recordatorio' && (
                <div>
                  <label style={labelStyle}>Proyecto</label>
                  <input value={mProyecto} onChange={(e) => setMProyecto(e.target.value)} style={inputStyle} placeholder="Opcional" />
                </div>
              )}

              {modal.destino === 'tarea' && (
                <>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Deadline</label>
                      <input type="date" value={mDeadline} onChange={(e) => setMDeadline(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Prioridad</label>
                      <select value={mPrioridad} onChange={(e) => setMPrioridad(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Grupo</label>
                    <input value={mGrupo} onChange={(e) => setMGrupo(e.target.value)} style={inputStyle} placeholder="general" />
                  </div>
                </>
              )}

              {modal.destino === 'recordatorio' && (
                <div>
                  <label style={labelStyle}>Fecha y hora</label>
                  <input type="datetime-local" value={mRecordarAt} onChange={(e) => setMRecordarAt(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              )}

              {mError && <p style={{ color: 'var(--os-error)', fontSize: 12, margin: 0 }}>{mError}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button onClick={() => setModal(null)}
                  style={{ background: 'none', border: '1px solid var(--os-line)', borderRadius: 6, color: 'var(--os-muted)', cursor: 'pointer', padding: '6px 14px', fontSize: 12, fontFamily: 'var(--os-font-display)', fontWeight: 700 }}>
                  Cancelar
                </button>
                <button onClick={confirmarConversion} className="os-btn" style={{ padding: '6px 16px', fontSize: 12 }}>
                  Convertir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
