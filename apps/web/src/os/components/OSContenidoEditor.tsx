import { useState } from 'react';

interface Borrador {
  id: string;
  titulo: string;
  cuerpo: string;
  plataforma: string;
  fecha: string;
}

const PLATAFORMAS = ['linkedin', 'instagram', 'blog'] as const;
type Plataforma = typeof PLATAFORMAS[number];

const PLAT_COLOR: Record<string, string> = {
  linkedin:  '#3B4ED9',
  instagram: '#B5985A',
  blog:      '#6B7AE8',
};

export default function OSContenidoEditor() {
  const [borradores, setBorradores] = useState<Borrador[]>([]);
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [plataforma, setPlataforma] = useState<Plataforma>('linkedin');
  const [flash, setFlash] = useState(false);

  const guardar = () => {
    if (!titulo.trim() && !cuerpo.trim()) return;
    const nuevo: Borrador = {
      id: Date.now().toString(),
      titulo: titulo.trim() || '(sin titulo)',
      cuerpo: cuerpo.trim(),
      plataforma,
      fecha: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setBorradores(prev => [nuevo, ...prev]);
    setTitulo('');
    setCuerpo('');
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  };

  const eliminar = (id: string) => setBorradores(prev => prev.filter(b => b.id !== id));

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(232,234,240,0.04)',
    border: '1px solid rgba(232,234,240,0.1)',
    borderRadius: 7,
    padding: '0.625rem 0.75rem',
    color: '#F4F6F8',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div>
      {/* Editor */}
      <div style={{ background: '#131F4A', border: '1px solid rgba(232,234,240,0.09)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
        <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', margin: '0 0 0.875rem' }}>
          Nuevo borrador
        </p>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {PLATAFORMAS.map(p => (
            <button
              key={p}
              onClick={() => setPlataforma(p)}
              style={{
                padding: '3px 10px',
                borderRadius: 5,
                border: `1px solid ${plataforma === p ? PLAT_COLOR[p] : 'rgba(232,234,240,0.12)'}`,
                background: plataforma === p ? `${PLAT_COLOR[p]}22` : 'transparent',
                color: plataforma === p ? PLAT_COLOR[p] : '#6B7280',
                fontFamily: "'Montserrat',sans-serif",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.14s',
              }}
            >{p}</button>
          ))}
        </div>

        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Titulo o hook..."
          style={{ ...inputStyle, fontSize: 14, marginBottom: 8 }}
        />
        <textarea
          value={cuerpo}
          onChange={e => setCuerpo(e.target.value)}
          placeholder="Contenido del post..."
          rows={6}
          style={{ ...inputStyle, fontSize: 13, resize: 'vertical', lineHeight: 1.5, marginBottom: 10 }}
        />
        {/* TODO: AI assist - generar variantes, mejorar hook */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
            {cuerpo.length} car
          </span>
          <button
            onClick={guardar}
            style={{
              padding: '0.5rem 1.125rem',
              background: flash ? 'rgba(59,78,217,0.35)' : '#3B4ED9',
              border: 'none',
              borderRadius: 7,
              color: '#F4F6F8',
              fontFamily: "'Montserrat',sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >{flash ? 'Guardado' : 'Guardar borrador'}</button>
        </div>
      </div>

      {/* Lista de borradores */}
      {borradores.length > 0 && (
        <div style={{ background: '#131F4A', border: '1px solid rgba(232,234,240,0.09)', borderRadius: 12, padding: '1.25rem' }}>
          <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', margin: '0 0 0.75rem' }}>
            Borradores en sesion ({borradores.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {borradores.map(b => (
              <div key={b.id} style={{ padding: '0.625rem 0.75rem', borderRadius: 7, background: 'rgba(232,234,240,0.03)', border: '1px solid rgba(232,234,240,0.06)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F4F6F8' }}>{b.titulo}</span>
                    <span style={{ fontSize: 9, color: PLAT_COLOR[b.plataforma] ?? '#6B7280', fontFamily: "'Montserrat',sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>{b.plataforma}</span>
                    <span style={{ fontSize: 10, color: '#6B7280', flexShrink: 0 }}>{b.fecha}</span>
                  </div>
                  {b.cuerpo && (
                    <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {b.cuerpo}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => eliminar(b.id)}
                  aria-label="Eliminar borrador"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '2px 4px', flexShrink: 0, lineHeight: 1 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
