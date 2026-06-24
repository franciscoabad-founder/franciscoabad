import type { KPICard, KPITrend } from '../data/types';

interface Props {
  kpis: KPICard[];
}

const TrendArrow = ({ t }: { t: KPITrend }) => {
  if (t === 'up')
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7AE8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    );
  if (t === 'down')
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5985A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  return <span style={{ color: '#6B7280', fontSize: '12px', lineHeight: 1 }}>--</span>;
};

export default function OSKPIGrid({ kpis }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
      gap: '10px',
    }}>
      {kpis.map((k) => (
        <div
          key={k.id}
          style={{
            background: '#131F4A',
            border: '1px solid rgba(232,234,240,0.09)',
            borderRadius: '12px',
            padding: '1.125rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <p style={{
              margin: 0, fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#6B7280', fontFamily: 'Montserrat, sans-serif',
            }}>
              {k.label}
            </p>
            <TrendArrow t={k.tendencia} />
          </div>
          <p style={{
            margin: 0, fontSize: '1.625rem', fontWeight: 700,
            color: '#B5985A', fontFamily: 'Montserrat, sans-serif', lineHeight: 1.1,
          }}>
            {k.valor}
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '11px', color: '#6B7280' }}>
            {k.cambio} · {k.periodo}
          </p>
        </div>
      ))}
    </div>
  );
}
