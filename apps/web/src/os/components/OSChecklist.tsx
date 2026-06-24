import { useState } from 'react';
import type { CheckItem } from '../data/types';

interface Props {
  items: CheckItem[];
  title?: string;
}

export default function OSChecklist({ items: initial, title }: Props) {
  const [items, setItems] = useState(initial);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completado: !i.completado } : i)));

  const done = items.filter((i) => i.completado).length;

  return (
    <div>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', margin: 0 }}>
            {title}
          </p>
          <span style={{ fontSize: '12px', color: done === items.length ? '#6B7AE8' : '#6B7280' }}>
            {done}/{items.length}
          </span>
        </div>
      )}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                width: '100%', border: 'none', cursor: 'pointer',
                padding: '8px 10px', borderRadius: '6px', textAlign: 'left',
                background: item.completado ? 'rgba(59,78,217,0.1)' : 'rgba(232,234,240,0.04)',
                transition: 'background 0.16s',
              }}
            >
              <span style={{
                width: '17px', height: '17px', flexShrink: 0, borderRadius: '4px', marginTop: '1px',
                border: item.completado ? '2px solid #3B4ED9' : '2px solid rgba(232,234,240,0.2)',
                background: item.completado ? '#3B4ED9' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.16s',
              }}>
                {item.completado && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <polyline points="1,3.5 3.5,6 8,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span style={{
                fontSize: '14px',
                color: item.completado ? '#6B7280' : '#F4F6F8',
                textDecoration: item.completado ? 'line-through' : 'none',
                transition: 'color 0.16s',
                lineHeight: 1.45,
              }}>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
