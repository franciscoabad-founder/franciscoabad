import { useState } from 'react';
import type { ItemBandeja } from '../data/types';

interface Props {
  items: ItemBandeja[];
}

const catColor: Record<string, string> = {
  articulo: '#3B4ED9',
  tarea: '#6B7AE8',
  decision: '#B5985A',
  recurso: '#6B7280',
  link: '#3B4ED9',
};

const catLabel: Record<string, string> = {
  articulo: 'Articulo',
  tarea: 'Tarea',
  decision: 'Decision',
  recurso: 'Recurso',
  link: 'Link',
};

export default function OSBandeja({ items: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [showLeidos, setShowLeidos] = useState(false);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, leido: !i.leido } : i)));

  const visible = showLeidos ? items : items.filter((i) => !i.leido);
  const pendientes = items.filter((i) => !i.leido).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShowLeidos(!showLeidos)}
          style={{ fontSize: '12px', color: '#6B7AE8', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {showLeidos ? 'Ocultar leidos' : 'Ver todos'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visible.length === 0 && (
          <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center', padding: '2rem 0' }}>
            Sin pendientes.
          </p>
        )}
        {visible.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'rgba(232,234,240,0.04)',
              border: '1px solid rgba(232,234,240,0.09)',
              borderRadius: '8px', padding: '12px 14px',
              opacity: item.leido ? 0.45 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: catColor[item.categoria] ?? '#6B7280',
                    fontFamily: 'Montserrat, sans-serif',
                  }}>
                    {catLabel[item.categoria] ?? item.categoria}
                  </span>
                  {item.deadline && (
                    <span style={{ fontSize: '11px', color: '#B5985A' }}>vence {item.deadline}</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#F4F6F8', fontWeight: 500, marginBottom: '3px' }}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#F4F6F8', textDecoration: 'none' }}>
                      {item.titulo}
                    </a>
                  ) : item.titulo}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.4 }}>{item.descripcion}</p>
              </div>
              <button
                onClick={() => toggle(item.id)}
                title={item.leido ? 'Marcar pendiente' : 'Marcar leido'}
                style={{
                  flexShrink: 0, width: '28px', height: '28px', borderRadius: '6px',
                  background: item.leido ? 'rgba(59,78,217,0.15)' : 'rgba(232,234,240,0.06)',
                  border: '1px solid rgba(232,234,240,0.12)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.leido ? '#6B7AE8' : '#6B7280',
                }}
              >
                {item.leido ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
