import { useEffect, useState } from 'react';

interface Pendiente {
  id: string;
  titulo: string;
  detalle: string | null;
  proyecto: string | null;
  estado: 'abierto' | 'convertido' | 'descartado' | 'hecho';
  convertido_a: string | null;
  created_at: string;
}

const ESTADO_META: Record<string, { label: string; color: string; bg: string }> = {
  abierto:    { label: 'Abierto',    color: '#6B7AE8', bg: 'rgba(107,122,232,0.14)' },
  convertido: { label: 'Convertido', color: 'var(--os-champagne)', bg: 'rgba(181,152,90,0.12)' },
  descartado: { label: 'Descartado', color: '#6B7280', bg: 'rgba(107,114,128,0.14)' },
  hecho:      { label: 'Hecho',      color: 'var(--os-champagne)', bg: 'rgba(181,152,90,0.12)' },
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
};

export default function OSPendientes() {
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [titulo, setTitulo] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mostrarCerrados, setMostrarCerrados] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/os/pendientes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setPendientes(data.pendientes ?? []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/os/pendientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: titulo.trim(), proyecto: proyecto.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setTitulo('');
      setProyecto('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function marcar(id: string, estado: Pendiente['estado']) {
    try {
      const res = await fetch(`/api/os/pendientes?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function convertirATarea(p: Pendiente) {
    const deadline = window.prompt('Deadline de la tarea (YYYY-MM-DD, vacio = sin deadline):', '');
    if (deadline === null) return;
    if (deadline.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(deadline.trim())) {
      window.alert('Formato invalido. Usa YYYY-MM-DD');
      return;
    }
    try {
      const res = await fetch('/api/os/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: p.titulo,
          proyecto: p.proyecto,
          deadline: deadline.trim() || null,
          notas: p.detalle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      await fetch(`/api/os/pendientes?id=${encodeURIComponent(p.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'convertido', convertido_a: 'tarea', convertido_id: data.tarea?.id ?? null }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const visibles = pendientes.filter((p) => mostrarCerrados || p.estado === 'abierto');
  const abiertos = pendientes.filter((p) => p.estado === 'abierto').length;

  return (
    <div>
      <form onSubmit={agregar} className="os-card-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Que quieres hacer? *"
          required
          style={{ ...inputStyle, flex: 2, minWidth: 180 }}
        />
        <input
          value={proyecto}
          onChange={(e) => setProyecto(e.target.value)}
          placeholder="Proyecto"
          style={{ ...inputStyle, flex: 1, minWidth: 110 }}
        />
        <button type="submit" className="os-btn" disabled={busy} style={{ padding: '6px 16px', fontSize: 12 }}>
          {busy ? 'Guardando...' : 'Agregar'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <p className="os-num" style={{ fontSize: 12, margin: 0 }}>{abiertos} abiertos</p>
        <button
          onClick={() => setMostrarCerrados((v) => !v)}
          style={{
            background: 'none', border: '1px solid var(--os-line)', borderRadius: 6, cursor: 'pointer',
            color: mostrarCerrados ? 'var(--os-text)' : 'var(--os-muted)', fontSize: 11, padding: '3px 10px',
            fontFamily: 'var(--os-font-display)', fontWeight: 700,
          }}
        >
          {mostrarCerrados ? 'Ocultar cerrados' : 'Ver cerrados'}
        </button>
      </div>

      {error && <p style={{ color: 'var(--os-error)', fontSize: 12, marginBottom: 10 }}>Error: {error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading && <div className="os-card-2" style={{ padding: '1rem', color: 'var(--os-muted)', fontSize: 13 }}>Cargando...</div>}
        {!loading && !visibles.length && (
          <div className="os-card-2" style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--os-muted)', fontSize: 12 }}>
            Nada pendiente. Captura lo que quieras hacer sin comprometerte a una fecha.
          </div>
        )}
        {visibles.map((p) => {
          const meta = ESTADO_META[p.estado] ?? ESTADO_META.abierto;
          const cerrado = p.estado !== 'abierto';
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap',
              background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)',
              borderRadius: 10, padding: '0.625rem 0.875rem', opacity: cerrado ? 0.65 : 1,
            }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 13, color: 'var(--os-text)', margin: 0, lineHeight: 1.4, textDecoration: p.estado === 'hecho' ? 'line-through' : 'none' }}>
                  {p.titulo}
                </p>
                {p.proyecto && <p style={{ fontSize: 11, color: 'var(--os-accent-light)', margin: '2px 0 0' }}>{p.proyecto}</p>}
              </div>
              <span style={{
                fontSize: 10, fontFamily: 'var(--os-font-display)', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: meta.color, background: meta.bg, borderRadius: 999, padding: '3px 10px',
              }}>
                {meta.label}
              </span>
              {!cerrado && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => convertirATarea(p)} title="Convertir a tarea"
                    style={{ background: 'rgba(59,78,217,0.16)', border: '1px solid rgba(59,78,217,0.4)', borderRadius: 6, color: '#6B7AE8', cursor: 'pointer', padding: '3px 9px', fontSize: 10, fontFamily: 'var(--os-font-display)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Tarea
                  </button>
                  <button onClick={() => marcar(p.id, 'hecho')} title="Marcar hecho"
                    style={{ background: 'rgba(59,78,217,0.12)', border: '1px solid rgba(59,78,217,0.35)', borderRadius: 6, color: 'var(--os-accent)', cursor: 'pointer', padding: '3px 9px', fontSize: 10, fontFamily: 'var(--os-font-display)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Hecho
                  </button>
                  <button onClick={() => marcar(p.id, 'descartado')} title="Descartar"
                    style={{ background: 'none', border: '1px solid var(--os-line)', borderRadius: 6, color: 'var(--os-muted)', cursor: 'pointer', padding: '3px 9px', fontSize: 10, fontFamily: 'var(--os-font-display)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Descartar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
