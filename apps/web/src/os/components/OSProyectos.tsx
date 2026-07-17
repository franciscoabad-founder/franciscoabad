import { useEffect, useMemo, useState } from 'react';

// Vista Proyectos: el Project Stack del canon, en vivo desde /api/os/lineas.
// prioridad_stack es la unica jerarquia que importa: 0 Urgente, 1 Dinero,
// 2 Soporte, 3 Estabilizar, 4 Pausado. Un proyecto pausado no recibe atencion,
// esa es la funcion del stack.

interface Linea {
  id: string;
  nombre: string;
  descripcion: string | null;
  prioridad_stack: number;
  recibe_maker: boolean;
  objetivo_id: string | null;
  siguiente_accion: string | null;
  estado: string | null;
  orden: number | null;
}

const PRIORIDAD_LABEL: Record<number, string> = {
  0: 'Urgente', 1: 'Dinero', 2: 'Soporte', 3: 'Estabilizar', 4: 'Pausado',
};
const PRIORIDAD_HINT: Record<number, string> = {
  0: 'Riesgo activo: legal, financiero o reputacional.',
  1: 'Genera o protege ingresos ahora.',
  2: 'Sostiene lo que ya funciona.',
  3: 'Necesita orden antes de crecer.',
  4: 'Cero atencion a proposito.',
};
const PRIORIDAD_COLOR: Record<number, string> = {
  0: 'var(--os-danger, #D4537E)',
  1: 'var(--os-champagne)',
  2: 'var(--os-accent-light)',
  3: 'var(--os-text-2)',
  4: 'var(--os-muted)',
};
const ORDEN_STACK = [0, 1, 2, 3, 4];

const selectStyle: React.CSSProperties = {
  background: 'var(--os-fill-subtle)',
  border: '1px solid var(--os-line)',
  borderRadius: 6,
  padding: '4px 8px',
  fontSize: 11,
  fontFamily: 'var(--os-font-display)',
  fontWeight: 700,
  cursor: 'pointer',
  outline: 'none',
};

export default function OSProyectos() {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/os/lineas', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setLineas(data.lineas ?? []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function patch(id: string, body: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/os/lineas?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      await load();
    } catch (err) {
      window.alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  function editarSiguienteAccion(l: Linea) {
    const val = window.prompt('Siguiente accion:', l.siguiente_accion || '');
    if (val === null) return;
    patch(l.id, { siguiente_accion: val.trim() || null });
  }

  const porStack = useMemo(() => {
    const grupos: Record<number, Linea[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    for (const l of lineas) {
      const k = grupos[l.prioridad_stack] ? l.prioridad_stack : 4;
      grupos[k].push(l);
    }
    for (const k of ORDEN_STACK) {
      grupos[k].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99) || a.nombre.localeCompare(b.nombre));
    }
    return grupos;
  }, [lineas]);

  if (loading) {
    return <div className="os-card-2" style={{ padding: '1rem', color: 'var(--os-muted)', fontSize: 13 }}>Cargando proyectos...</div>;
  }
  if (error && lineas.length === 0) {
    return (
      <div className="os-card-2" style={{ padding: '1rem' }}>
        <p style={{ color: 'var(--os-error)', fontSize: 13, margin: 0 }}>No se pudo cargar el stack de proyectos: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && <p style={{ color: 'var(--os-error)', fontSize: 12, margin: 0 }}>{error}</p>}

      {lineas.length === 0 && (
        <div className="os-card-2" style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--os-muted)', fontSize: 12 }}>
          Todavia no hay lineas registradas en el stack.
        </div>
      )}

      {ORDEN_STACK.map((stack) => {
        const items = porStack[stack];
        if (items.length === 0) return null;
        return (
          <div key={stack}>
            <p className="os-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: 2, background: PRIORIDAD_COLOR[stack], display: 'inline-block', flexShrink: 0,
              }} />
              {stack} · {PRIORIDAD_LABEL[stack]}
              <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--os-muted)' }}>
                — {PRIORIDAD_HINT[stack]}
              </span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((l) => (
                <div key={l.id} className="os-card-2" style={{
                  borderLeft: `3px solid ${PRIORIDAD_COLOR[stack]}`,
                  opacity: stack === 4 ? 0.7 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'var(--os-font-display)', fontSize: 15, fontWeight: 700, color: 'var(--os-text)', margin: 0 }}>{l.nombre}</h3>
                      {l.recibe_maker && (
                        <span className="os-pill os-pill-accent" title="Recibe tiempo Maker">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>bolt</span>
                          Maker
                        </span>
                      )}
                      {l.estado && <span className="os-tag">{l.estado}</span>}
                    </div>
                    <select
                      value={l.prioridad_stack}
                      onChange={(e) => patch(l.id, { prioridad_stack: Number(e.target.value) })}
                      style={{ ...selectStyle, color: PRIORIDAD_COLOR[l.prioridad_stack] }}
                      title="Cambiar prioridad en el stack"
                    >
                      {ORDEN_STACK.map((s) => (
                        <option key={s} value={s}>{s} · {PRIORIDAD_LABEL[s]}</option>
                      ))}
                    </select>
                  </div>
                  {l.descripcion && (
                    <p style={{ fontSize: 13, color: 'var(--os-muted)', margin: '0 0 0.625rem', lineHeight: 1.45 }}>{l.descripcion}</p>
                  )}
                  <button
                    onClick={() => editarSiguienteAccion(l)}
                    title="Editar siguiente accion"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: PRIORIDAD_COLOR[l.prioridad_stack], flexShrink: 0, marginTop: 1 }}>chevron_right</span>
                    <span style={{ fontSize: 13, color: l.siguiente_accion ? 'var(--os-text)' : 'var(--os-muted)', margin: 0, lineHeight: 1.45 }}>
                      {l.siguiente_accion || '+ definir siguiente accion'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
