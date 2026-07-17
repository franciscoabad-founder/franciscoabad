import { useEffect, useState } from 'react';

// Vista Bandeja ("por revisar"): fetch en vivo desde /api/os/bandeja.

interface ItemBandeja {
  id: string;
  titulo: string;
  url: string | null;
  descripcion: string | null;
  categoria: string;
  leido: boolean;
  created_at?: string;
}

const CAT_COLOR: Record<string, string> = {
  articulo: 'var(--os-accent-light)',
  tarea: 'var(--os-accent-light)',
  decision: 'var(--os-champagne)',
  recurso: 'var(--os-muted)',
  link: 'var(--os-accent-light)',
};
const CAT_LABEL: Record<string, string> = {
  articulo: 'Articulo', tarea: 'Tarea', decision: 'Decision', recurso: 'Recurso', link: 'Link',
};
const CATEGORIAS = Object.keys(CAT_LABEL);

const inputStyle: React.CSSProperties = {
  background: 'var(--os-fill-subtle)',
  border: '1px solid var(--os-line)',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 12,
  color: 'var(--os-text)',
  fontFamily: 'var(--os-font-body)',
  outline: 'none',
};

export default function OSBandeja() {
  const [items, setItems] = useState<ItemBandeja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLeidos, setShowLeidos] = useState(false);

  const [creando, setCreando] = useState(false);
  const [nTitulo, setNTitulo] = useState('');
  const [nUrl, setNUrl] = useState('');
  const [nDescripcion, setNDescripcion] = useState('');
  const [nCategoria, setNCategoria] = useState('articulo');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/os/bandeja', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setItems(data.bandeja ?? []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function toggleLeido(item: ItemBandeja) {
    try {
      const res = await fetch(`/api/os/bandeja?id=${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leido: !item.leido }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      await load();
    } catch (err) {
      window.alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function eliminar(id: string) {
    if (!window.confirm('Eliminar este item de la bandeja?')) return;
    try {
      const res = await fetch(`/api/os/bandeja?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(String(res.status));
      await load();
    } catch (err) {
      window.alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!nTitulo.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/os/bandeja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nTitulo.trim(),
          url: nUrl.trim() || null,
          descripcion: nDescripcion.trim() || null,
          categoria: nCategoria,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setNTitulo(''); setNUrl(''); setNDescripcion('');
      setCreando(false);
      await load();
    } catch (err) {
      window.alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="os-card-2" style={{ padding: '1rem', color: 'var(--os-muted)', fontSize: 13 }}>Cargando bandeja...</div>;
  }
  if (error && items.length === 0) {
    return (
      <div className="os-card-2" style={{ padding: '1rem' }}>
        <p style={{ color: 'var(--os-error)', fontSize: 13, margin: 0 }}>No se pudo cargar la bandeja: {error}</p>
      </div>
    );
  }

  const visibles = showLeidos ? items : items.filter((i) => !i.leido);
  const pendientes = items.filter((i) => !i.leido).length;

  return (
    <div>
      {error && <p style={{ color: 'var(--os-error)', fontSize: 12, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <span className="os-num" style={{ fontSize: 13 }}>
          {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setShowLeidos((v) => !v)} className="os-btn-ghost" style={{ borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'var(--os-font-display)', fontWeight: 700, cursor: 'pointer' }}>
            {showLeidos ? 'Ocultar leidos' : 'Ver todos'}
          </button>
          <button onClick={() => setCreando((v) => !v)} className="os-btn" style={{ padding: '5px 12px', fontSize: 11 }}>
            {creando ? 'Cancelar' : '+ Agregar'}
          </button>
        </div>
      </div>

      {creando && (
        <form onSubmit={agregar} className="os-card-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <input value={nTitulo} onChange={(e) => setNTitulo(e.target.value)} placeholder="Titulo *" required style={{ ...inputStyle, flex: 2, minWidth: 160 }} />
          <input value={nUrl} onChange={(e) => setNUrl(e.target.value)} placeholder="URL (opcional)" style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
          <select value={nCategoria} onChange={(e) => setNCategoria(e.target.value)} style={{ ...inputStyle, width: 130 }}>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
          </select>
          <input value={nDescripcion} onChange={(e) => setNDescripcion(e.target.value)} placeholder="Descripcion" style={{ ...inputStyle, flexBasis: '100%' }} />
          <button type="submit" className="os-btn" disabled={busy}>{busy ? '...' : 'Guardar'}</button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visibles.length === 0 && (
          <div className="os-card-2" style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--os-muted)', fontSize: 12 }}>
            Sin pendientes.
          </div>
        )}
        {visibles.map((item) => (
          <div key={item.id} className="os-card-2" style={{ opacity: item.leido ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span className="os-tag" style={{ color: CAT_COLOR[item.categoria] ?? 'var(--os-muted)', background: 'none', padding: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--os-font-display)' }}>
                    {CAT_LABEL[item.categoria] ?? item.categoria}
                  </span>
                </div>
                <p style={{ margin: '0 0 3px', fontSize: 14, color: 'var(--os-text)', fontWeight: 500 }}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--os-text)', textDecoration: 'none' }}>
                      {item.titulo}
                    </a>
                  ) : item.titulo}
                </p>
                {item.descripcion && (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--os-muted)', lineHeight: 1.4 }}>{item.descripcion}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => toggleLeido(item)}
                  title={item.leido ? 'Marcar pendiente' : 'Marcar leido'}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: item.leido ? 'rgba(59,78,217,0.15)' : 'var(--os-fill-subtle)',
                    border: '1px solid var(--os-line)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.leido ? 'var(--os-accent-light)' : 'var(--os-muted)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                    {item.leido ? 'check' : 'radio_button_unchecked'}
                  </span>
                </button>
                <button
                  onClick={() => eliminar(item.id)}
                  title="Eliminar"
                  style={{ width: 28, height: 28, borderRadius: 6, background: 'none', border: '1px solid var(--os-line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--os-muted)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
