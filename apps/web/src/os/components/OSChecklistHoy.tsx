import { useEffect, useState } from 'react';

interface HabitoDiaria {
  id: string;
  nombre: string;
  tipo: 'habito' | 'diaria';
  hecho_hoy: boolean | null;
  es_core: boolean;
}
interface CheckResponse {
  ok?: boolean;
  xp?: number;
  error?: string;
}

interface Props {
  title?: string;
}

const TZ = 'America/Guayaquil';
function hoyISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

export default function OSChecklistHoy({ title }: Props) {
  const [habitos, setHabitos] = useState<HabitoDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [xpFlash, setXpFlash] = useState<{ id: string; xp: number } | null>(null);
  const [enviando, setEnviando] = useState<Set<string>>(new Set());

  async function cargar(mostrarLoading = true) {
    if (mostrarLoading) setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/os/habitos?vista=hoy');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const diarias: HabitoDiaria[] = (data.habitos ?? []).filter(
        (h: HabitoDiaria) => h.tipo === 'diaria',
      );
      setHabitos(diarias);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function toggle(h: HabitoDiaria) {
    if (enviando.has(h.id)) return;
    setEnviando((cur) => new Set(cur).add(h.id));
    try {
      if (h.hecho_hoy) {
        if (!confirm('¿Deshacer?')) return;
        try {
          const res = await fetch(`/api/os/habitos/checks?habito_id=${h.id}&fecha=${hoyISO()}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('No se pudo deshacer');
          await cargar(false);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error');
        }
        return;
      }

      try {
        const res = await fetch('/api/os/habitos/checks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habito_id: h.id }),
        });
        const data: CheckResponse = await res.json();
        if (res.status === 409) {
          await cargar(false);
          return;
        }
        if (data.error) throw new Error(data.error);
        if (data.xp) {
          setXpFlash({ id: h.id, xp: data.xp });
          setTimeout(() => setXpFlash((cur) => (cur?.id === h.id ? null : cur)), 1500);
        }
        await cargar(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al registrar');
      }
    } finally {
      setEnviando((cur) => {
        const next = new Set(cur);
        next.delete(h.id);
        return next;
      });
    }
  }

  const done = habitos.filter((h) => h.hecho_hoy).length;

  return (
    <div>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', margin: 0 }}>
            {title}
          </p>
          {!loading && !error && habitos.length > 0 && (
            <span style={{ fontSize: '12px', color: done === habitos.length ? '#6B7AE8' : '#6B7280' }}>
              {done}/{habitos.length}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              style={{
                height: '35px',
                borderRadius: '6px',
                background: 'rgba(232,234,240,0.04)',
                opacity: 0.4 + i * 0.15,
                animation: 'os-checklist-pulse 1.2s ease-in-out infinite',
              }}
            />
          ))}
        </ul>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px', color: '#f87171' }}>
          <span>{error}</span>
          <button
            onClick={() => cargar()}
            style={{
              background: 'transparent', color: '#6B7280', border: '1px solid rgba(232,234,240,0.2)',
              borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      ) : habitos.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
          Sin diarias para hoy. <a href="/os/habitos" style={{ color: '#6B7AE8' }}>Configura tus hábitos.</a>
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {habitos.map((h) => {
            const completado = !!h.hecho_hoy;
            const enVuelo = enviando.has(h.id);
            return (
              <li key={h.id}>
                <button
                  onClick={() => toggle(h)}
                  disabled={enVuelo}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    width: '100%', border: 'none', cursor: enVuelo ? 'not-allowed' : 'pointer',
                    padding: '8px 10px', borderRadius: '6px', textAlign: 'left',
                    background: completado ? 'rgba(59,78,217,0.1)' : 'rgba(232,234,240,0.04)',
                    opacity: enVuelo ? 0.5 : 1,
                    transition: 'background 0.16s',
                  }}
                >
                  <span
                    style={{
                      width: '17px', height: '17px', flexShrink: 0, borderRadius: '4px', marginTop: '1px',
                      border: completado ? '2px solid #3B4ED9' : '2px solid rgba(232,234,240,0.2)',
                      background: completado ? '#3B4ED9' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.16s',
                    }}
                  >
                    {completado && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <polyline points="1,3.5 3.5,6 8,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: completado ? '#6B7280' : '#F4F6F8',
                      textDecoration: completado ? 'line-through' : 'none',
                      transition: 'color 0.16s',
                      lineHeight: 1.45,
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {h.nombre}
                    {h.es_core && (
                      <span
                        title="core"
                        style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: '#3B4ED9', flexShrink: 0, display: 'inline-block',
                        }}
                      />
                    )}
                  </span>
                  {xpFlash?.id === h.id && (
                    <span
                      style={{
                        fontSize: '11px', fontWeight: 700, color: '#B5985A',
                        flexShrink: 0, alignSelf: 'center',
                      }}
                    >
                      +{xpFlash.xp} XP
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ marginTop: '0.625rem', textAlign: 'right' }}>
        <a href="/os/habitos" style={{ fontSize: '11px', color: '#6B7280', textDecoration: 'none' }}>
          Gestionar hábitos →
        </a>
      </div>

      <style>{`
        @keyframes os-checklist-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
