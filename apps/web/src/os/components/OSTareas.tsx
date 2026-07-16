import { useEffect, useMemo, useState } from 'react';

interface Tarea {
  id: string;
  titulo: string;
  proyecto: string | null;
  estado: string;
  urgente: boolean;
  deadline: string | null;
  prioridad: 'low' | 'medium' | 'high' | 'critical' | null;
  tipo: string | null;
  grupo: string | null;
  parent_id: string | null;
  orden: number | null;
  created_at: string;
}

const PRIORIDAD_META: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: '#F87171', bg: 'rgba(248,113,113,0.16)' },
  high:     { label: 'High',     color: '#FB923C', bg: 'rgba(251,146,60,0.16)' },
  medium:   { label: 'Medium',   color: '#6B7AE8', bg: 'rgba(107,122,232,0.16)' },
  low:      { label: 'Low',      color: '#6B7280', bg: 'rgba(107,114,128,0.16)' },
};

const ESTADO_META: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:   { label: 'Pendiente',   color: '#C5C5D7', bg: 'rgba(197,197,215,0.10)' },
  en_progreso: { label: 'En progreso', color: '#6B7AE8', bg: 'rgba(107,122,232,0.16)' },
  hecho:       { label: 'Hecho',       color: 'var(--os-champagne)', bg: 'rgba(181,152,90,0.14)' },
};

const GRUPO_ACCENT: Record<string, string> = {
  'URGENTE ASAP': '#F87171',
  'URGENTE!': '#FB923C',
  general: '#3B4ED9',
};

function estadoValue(estado: string) {
  return estado === 'en progreso' ? 'en_progreso' : (estado || 'pendiente');
}

function grupoRank(g: string) {
  if (g === 'URGENTE ASAP') return 0;
  if (g === 'URGENTE!') return 1;
  if (g === 'general') return 99;
  return 50;
}

const pillStyle = (meta: { color: string; bg: string }): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: 10,
  fontFamily: 'var(--os-font-display)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: meta.color,
  background: meta.bg,
  borderRadius: 999,
  padding: '3px 10px',
  whiteSpace: 'nowrap',
});

const selectStyle: React.CSSProperties = {
  background: '#0E1738',
  border: '1px solid var(--os-line)',
  borderRadius: 6,
  padding: '3px 6px',
  fontSize: 11,
  fontFamily: 'var(--os-font-display)',
  fontWeight: 700,
  cursor: 'pointer',
  outline: 'none',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(232,234,240,0.05)',
  border: '1px solid var(--os-line)',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 12,
  color: 'var(--os-text)',
  fontFamily: 'var(--os-font-body)',
  outline: 'none',
};

export default function OSTareas() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [colapsados, setColapsados] = useState<Record<string, boolean>>({});
  const [expandidas, setExpandidas] = useState<Record<string, boolean>>({});
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});
  const [mostrarHechas, setMostrarHechas] = useState(false);

  // Alta rapida
  const [nTitulo, setNTitulo] = useState('');
  const [nProyecto, setNProyecto] = useState('');
  const [nDeadline, setNDeadline] = useState('');
  const [nPrioridad, setNPrioridad] = useState('medium');
  const [nGrupo, setNGrupo] = useState('general');
  const [nTipo, setNTipo] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/os/tareas');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setTareas(data.tareas ?? []);
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
      const res = await fetch(`/api/os/tareas?id=${encodeURIComponent(id)}`, {
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

  async function eliminar(id: string) {
    if (!window.confirm('Eliminar esta tarea (y sus subtareas)?')) return;
    try {
      const res = await fetch(`/api/os/tareas?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(String(res.status));
      await load();
    } catch (err) {
      window.alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  function editarTitulo(t: Tarea) {
    const titulo = window.prompt('Titulo:', t.titulo);
    if (titulo === null || !titulo.trim()) return;
    patch(t.id, { titulo: titulo.trim() });
  }

  function editarDeadline(t: Tarea) {
    const val = window.prompt('Deadline (YYYY-MM-DD, vacio = quitar):', t.deadline || '');
    if (val === null) return;
    const v = val.trim();
    if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) { window.alert('Formato invalido. Usa YYYY-MM-DD'); return; }
    patch(t.id, { deadline: v || null });
  }

  function editarProyecto(t: Tarea) {
    const val = window.prompt('Proyecto:', t.proyecto || '');
    if (val === null) return;
    patch(t.id, { proyecto: val.trim() || null });
  }

  function editarTipo(t: Tarea) {
    const val = window.prompt('Tipo (ej. deep work, llamada, tramite):', t.tipo || '');
    if (val === null) return;
    patch(t.id, { tipo: val.trim() || null });
  }

  function editarGrupo(t: Tarea) {
    const val = window.prompt('Grupo (ej. URGENTE ASAP, URGENTE!, general):', t.grupo || 'general');
    if (val === null) return;
    patch(t.id, { grupo: val.trim() || 'general' });
  }

  async function crear(body: Record<string, unknown>) {
    const res = await fetch('/api/os/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || String(res.status));
  }

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!nTitulo.trim() || busy) return;
    setBusy(true);
    try {
      await crear({
        titulo: nTitulo.trim(),
        proyecto: nProyecto.trim() || null,
        deadline: nDeadline || null,
        prioridad: nPrioridad,
        grupo: nGrupo.trim() || 'general',
        tipo: nTipo.trim() || null,
      });
      setNTitulo(''); setNProyecto(''); setNDeadline(''); setNTipo('');
      await load();
    } catch (err) {
      window.alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  async function agregarSubtarea(padre: Tarea) {
    const titulo = (subInputs[padre.id] || '').trim();
    if (!titulo) return;
    try {
      await crear({ titulo, parent_id: padre.id, grupo: padre.grupo || 'general', proyecto: padre.proyecto });
      setSubInputs((prev) => ({ ...prev, [padre.id]: '' }));
      setExpandidas((prev) => ({ ...prev, [padre.id]: true }));
      await load();
    } catch (err) {
      window.alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  const { grupos, hijosPor } = useMemo(() => {
    const hijosPor: Record<string, Tarea[]> = {};
    const padres: Tarea[] = [];
    for (const t of tareas) {
      if (t.parent_id) {
        (hijosPor[t.parent_id] ??= []).push(t);
      } else {
        padres.push(t);
      }
    }
    for (const k of Object.keys(hijosPor)) {
      hijosPor[k].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.created_at.localeCompare(b.created_at));
    }
    const visibles = padres.filter((t) => mostrarHechas || estadoValue(t.estado) !== 'hecho' || (hijosPor[t.id] ?? []).some((h) => estadoValue(h.estado) !== 'hecho'));
    const porGrupo: Record<string, Tarea[]> = {};
    for (const t of visibles) {
      const g = t.grupo || 'general';
      (porGrupo[g] ??= []).push(t);
    }
    const grupos = Object.keys(porGrupo)
      .sort((a, b) => grupoRank(a) - grupoRank(b) || a.localeCompare(b))
      .map((g) => ({
        nombre: g,
        items: porGrupo[g].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || (a.deadline || '9999').localeCompare(b.deadline || '9999')),
      }));
    return { grupos, hijosPor };
  }, [tareas, mostrarHechas]);

  const pendientesCount = tareas.filter((t) => estadoValue(t.estado) !== 'hecho').length;

  function filaTarea(t: Tarea, esSub = false) {
    const est = estadoValue(t.estado);
    const isDone = est === 'hecho';
    const pr = PRIORIDAD_META[t.prioridad || 'medium'] ?? PRIORIDAD_META.medium;
    const em = ESTADO_META[est] ?? ESTADO_META.pendiente;
    const hijos = hijosPor[t.id] ?? [];
    const abierta = !!expandidas[t.id];
    const today = new Date().toISOString().slice(0, 10);
    const vencida = !!(t.deadline && t.deadline < today && !isDone);

    return (
      <div key={t.id}>
        <div className="wr-row" style={{ paddingLeft: esSub ? 34 : 0, opacity: isDone ? 0.55 : 1 }}>
          {/* Item */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            {!esSub && (
              <button
                onClick={() => setExpandidas((prev) => ({ ...prev, [t.id]: !abierta }))}
                title={abierta ? 'Colapsar subtareas' : 'Expandir subtareas'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: hijos.length ? 'var(--os-accent-light)' : 'rgba(107,114,128,0.4)', padding: 0, fontSize: 12, width: 16, flexShrink: 0 }}
              >
                {abierta ? '▾' : '▸'}
              </button>
            )}
            <button
              onClick={() => patch(t.id, { estado: isDone ? 'pendiente' : 'hecho' })}
              title={isDone ? 'Reabrir' : 'Marcar hecha'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: isDone ? 'var(--os-champagne)' : 'rgba(107,114,128,0.6)' }}>
                {isDone ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </button>
            <span
              onClick={() => editarTitulo(t)}
              title="Editar titulo"
              style={{ fontSize: 13, color: isDone ? 'var(--os-muted)' : 'var(--os-text)', textDecoration: isDone ? 'line-through' : 'none', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {t.titulo}
            </span>
            {!esSub && hijos.length > 0 && (
              <span className="os-mono" style={{ fontSize: 10, color: 'var(--os-muted)', flexShrink: 0 }}>
                {hijos.filter((h) => estadoValue(h.estado) === 'hecho').length}/{hijos.length}
              </span>
            )}
          </div>

          {/* Due date */}
          <button onClick={() => editarDeadline(t)} title="Cambiar deadline"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            <span className="os-mono" style={{ fontSize: 11, color: vencida ? '#F87171' : t.deadline === today ? '#FB923C' : 'var(--os-muted)' }}>
              {t.deadline ? new Date(t.deadline + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' }) : '+ fecha'}
            </span>
          </button>

          {/* Prioridad */}
          <select
            value={t.prioridad || 'medium'}
            onChange={(e) => patch(t.id, { prioridad: e.target.value })}
            style={{ ...selectStyle, color: pr.color }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Proyecto */}
          <button onClick={() => editarProyecto(t)} title="Cambiar proyecto" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            {t.proyecto
              ? <span style={pillStyle({ color: '#6B7AE8', bg: 'rgba(59,78,217,0.14)' })}>{t.proyecto}</span>
              : <span style={{ fontSize: 10, color: 'rgba(107,114,128,0.5)' }}>+ proyecto</span>}
          </button>

          {/* Tipo */}
          <button onClick={() => editarTipo(t)} title="Cambiar tipo" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            <span style={{ fontSize: 11, color: t.tipo ? 'var(--os-text-2)' : 'rgba(107,114,128,0.5)' }}>{t.tipo || '+ tipo'}</span>
          </button>

          {/* Estado */}
          <select
            value={est}
            onChange={(e) => patch(t.id, { estado: e.target.value })}
            style={{ ...selectStyle, color: em.color }}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="hecho">Hecho</option>
          </select>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {!esSub && (
              <button onClick={() => editarGrupo(t)} title="Mover de grupo"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(107,114,128,0.6)', padding: 0, lineHeight: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>swap_vert</span>
              </button>
            )}
            <button onClick={() => eliminar(t.id)} title="Eliminar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(107,114,128,0.45)', padding: 0, lineHeight: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
            </button>
          </div>
        </div>

        {!esSub && abierta && (
          <div style={{ borderLeft: '2px solid rgba(59,78,217,0.25)', marginLeft: 7 }}>
            {hijos.map((h) => filaTarea(h, true))}
            <div style={{ display: 'flex', gap: 6, padding: '5px 0 7px 34px' }}>
              <input
                value={subInputs[t.id] || ''}
                onChange={(e) => setSubInputs((prev) => ({ ...prev, [t.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarSubtarea(t); } }}
                placeholder="+ subtarea (Enter para agregar)"
                style={{ ...inputStyle, flex: 1, fontSize: 11, padding: '4px 9px' }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .wr-row {
          display: grid;
          grid-template-columns: minmax(200px, 1fr) 74px 96px minmax(90px, 130px) minmax(70px, 100px) 110px 48px;
          gap: 10px;
          align-items: center;
          padding: 7px 10px;
          border-bottom: 1px solid rgba(232,234,240,0.05);
        }
        .wr-row:hover { background: rgba(232,234,240,0.03); }
        .wr-head {
          display: grid;
          grid-template-columns: minmax(200px, 1fr) 74px 96px minmax(90px, 130px) minmax(70px, 100px) 110px 48px;
          gap: 10px;
          padding: 4px 10px 6px;
          font-family: var(--os-font-display);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--os-muted);
        }
        .wr-table { overflow-x: auto; }
        .wr-table-inner { min-width: 760px; }
      `}</style>

      {/* Alta rapida */}
      <form onSubmit={agregar} className="os-card-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
        <input value={nTitulo} onChange={(e) => setNTitulo(e.target.value)} placeholder="Titulo de la tarea *" required style={{ ...inputStyle, flex: 2, minWidth: 170 }} />
        <input value={nProyecto} onChange={(e) => setNProyecto(e.target.value)} placeholder="Proyecto" style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
        <input type="date" value={nDeadline} onChange={(e) => setNDeadline(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
        <select value={nPrioridad} onChange={(e) => setNPrioridad(e.target.value)} style={{ ...selectStyle, color: (PRIORIDAD_META[nPrioridad] ?? PRIORIDAD_META.medium).color, padding: '6px 8px' }}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <input value={nGrupo} onChange={(e) => setNGrupo(e.target.value)} placeholder="Grupo (general)" list="wr-grupos" style={{ ...inputStyle, width: 140 }} />
        <datalist id="wr-grupos">
          <option value="URGENTE ASAP" />
          <option value="URGENTE!" />
          <option value="general" />
        </datalist>
        <input value={nTipo} onChange={(e) => setNTipo(e.target.value)} placeholder="Tipo" style={{ ...inputStyle, width: 100 }} />
        <button type="submit" className="os-btn" disabled={busy} style={{ padding: '6px 16px', fontSize: 12 }}>
          {busy ? '...' : 'Agregar'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <p className="os-num" style={{ fontSize: 12, margin: 0 }}>{pendientesCount} pendientes</p>
        <button onClick={() => setMostrarHechas((v) => !v)}
          style={{ background: 'none', border: '1px solid var(--os-line)', borderRadius: 6, cursor: 'pointer', color: mostrarHechas ? 'var(--os-text)' : 'var(--os-muted)', fontSize: 11, padding: '3px 10px', fontFamily: 'var(--os-font-display)', fontWeight: 700 }}>
          {mostrarHechas ? 'Ocultar hechas' : 'Ver hechas'}
        </button>
      </div>

      {error && <p style={{ color: 'var(--os-error)', fontSize: 12, marginBottom: 10 }}>Error: {error}</p>}
      {loading && <div className="os-card-2" style={{ padding: '1rem', color: 'var(--os-muted)', fontSize: 13 }}>Cargando...</div>}
      {!loading && !grupos.length && (
        <div className="os-card-2" style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--os-muted)', fontSize: 12 }}>
          Sin tareas activas. El war room esta despejado.
        </div>
      )}

      {grupos.map(({ nombre, items }) => {
        const accent = GRUPO_ACCENT[nombre] ?? '#6B7AE8';
        const colapsado = !!colapsados[nombre];
        const abiertasCount = items.filter((t) => estadoValue(t.estado) !== 'hecho').length;
        return (
          <div key={nombre} className="os-card-2" style={{ padding: 0, marginBottom: '1rem', borderLeft: `3px solid ${accent}`, overflow: 'hidden' }}>
            <button
              onClick={() => setColapsados((prev) => ({ ...prev, [nombre]: !colapsado }))}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem', textAlign: 'left' }}
            >
              <span style={{ color: accent, fontSize: 11 }}>{colapsado ? '▸' : '▾'}</span>
              <span style={{ fontFamily: 'var(--os-font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent }}>
                {nombre}
              </span>
              <span className="os-mono" style={{ fontSize: 11, color: 'var(--os-muted)' }}>
                {abiertasCount} abiertas · {items.length} total
              </span>
            </button>
            {!colapsado && (
              <div className="wr-table">
                <div className="wr-table-inner">
                  <div className="wr-head">
                    <span>Item</span>
                    <span>Due date</span>
                    <span>Prioridad</span>
                    <span>Proyecto</span>
                    <span>Tipo</span>
                    <span>Estado</span>
                    <span></span>
                  </div>
                  {items.map((t) => filaTarea(t))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
