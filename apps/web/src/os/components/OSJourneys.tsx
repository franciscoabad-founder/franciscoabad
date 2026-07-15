import { useEffect, useMemo, useState } from 'react';

// ── Tipos (contrato del endpoint api/os/habitos/journeys.ts) ────────────────
export interface Etapa {
  id: string;
  journey_id: string;
  orden: number;
  nombre: string;
  contenido_slug: string;
  completada_at: string | null;
}
export interface ProgresoEtapa {
  cumplida: boolean;
  progreso: number; // 0..1
  hechos: number;
  meta: number;
}
export interface Journey {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  montana: 'foundations' | 'struggle' | 'mastery';
  orden: number;
  estado: 'bloqueado' | 'disponible' | 'en_curso' | 'completado';
  etapa_actual: number;
  etapas: Etapa[];
  progresoEtapa?: ProgresoEtapa;
}

// NOTA de diseño (ver comentario en pages/os/habitos/journeys.astro): esta isla NO
// recibe el HTML compilado de las cartas MDX. Astro renderiza las cartas completas de
// forma estática debajo, dentro de <details id="carta-<id>">. Aquí solo llega el
// resumen (para mostrar un preview en la etapa en curso) y el id para armar el enlace
// de anchor hacia la carta completa.
export interface CartaResumen {
  id: string; // '<journey>/<etapa-slug>', igual a etapa.contenido_slug
  title: string;
  resumen: string;
}

interface Props {
  cartas: CartaResumen[];
}

const MONTANAS: Array<{ key: Journey['montana']; label: string }> = [
  { key: 'foundations', label: 'Montaña 1 · Foundations' },
  { key: 'struggle', label: 'Montaña 2 · Struggle' },
  { key: 'mastery', label: 'Montaña 3 · Mastery' },
];

// ── Estilos (mismo molde que OSHabitos.tsx) ─────────────────────────────────
const card: React.CSSProperties = {
  background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)',
  borderRadius: 'var(--os-r-card)', padding: '1rem',
};
const btn: React.CSSProperties = {
  background: 'var(--os-accent)', color: '#fff', border: 'none', borderRadius: 6,
  padding: '10px 18px', fontSize: 14, fontFamily: 'var(--os-font-display)', fontWeight: 700, cursor: 'pointer',
};
const btnDisabled: React.CSSProperties = {
  ...btn, background: 'rgba(232,234,240,0.08)', color: 'var(--os-muted)', cursor: 'not-allowed',
};
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: 'var(--os-muted)', border: '1px solid var(--os-line)',
  borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
};
const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--os-font-display)', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--os-muted)', margin: '0 0 10px',
};

function Badge({ estado }: { estado: Journey['estado'] }) {
  if (estado === 'en_curso') return <span className="os-pill os-pill-accent">En curso</span>;
  if (estado === 'completado') return <span className="os-pill os-pill-gold">✓ Completado</span>;
  if (estado === 'bloqueado') {
    return (
      <span className="os-pill" style={{ background: 'rgba(232,234,240,0.06)', color: 'var(--os-muted)' }}>
        🔒 Bloqueado
      </span>
    );
  }
  return (
    <span className="os-pill" style={{ background: 'rgba(232,234,240,0.08)', color: 'var(--os-text-2)' }}>
      Disponible
    </span>
  );
}

export default function OSJourneys({ cartas }: Props) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accionando, setAccionando] = useState<string | null>(null); // journey.id o slug en curso de acción
  const [avisoAvance, setAvisoAvance] = useState<Record<string, string>>({});

  const cartasPorId = useMemo(() => {
    const mapa = new Map<string, CartaResumen>();
    for (const c of cartas) mapa.set(c.id, c);
    return mapa;
  }, [cartas]);

  async function cargar(mostrarLoading = true) {
    if (mostrarLoading) setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/os/habitos/journeys');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setJourneys(data.journeys ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  async function iniciar(slug: string) {
    setAccionando(slug);
    setError('');
    try {
      const res = await fetch('/api/os/habitos/journeys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'iniciar', slug }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await cargar(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar el journey');
    } finally {
      setAccionando(null);
    }
  }

  async function avanzar(journeyId: string) {
    setAccionando(journeyId);
    setError('');
    setAvisoAvance((prev) => ({ ...prev, [journeyId]: '' }));
    try {
      const res = await fetch('/api/os/habitos/journeys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'avanzar', journey_id: journeyId }),
      });
      const data = await res.json();
      if (res.status === 409) {
        const faltan = Math.max(0, (data.progreso?.meta ?? 0) - (data.progreso?.hechos ?? 0));
        setAvisoAvance((prev) => ({ ...prev, [journeyId]: `Te faltan ${faltan} check${faltan === 1 ? '' : 's'} para poder avanzar.` }));
        return;
      }
      if (data.error) throw new Error(data.error);
      await cargar(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo avanzar de etapa');
    } finally {
      setAccionando(null);
    }
  }

  if (loading) return <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Cargando journeys...</p>;

  if (!journeys.length && !error) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '2rem 1rem' }}>
        <p style={{ fontSize: 14, color: 'var(--os-text-2)', margin: 0 }}>
          Aún no hay journeys sembrados. Vuelve luego de aplicar el seed inicial.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--os-error)', fontSize: 13 }}>
          <span>{error}</span>
          <button style={{ ...btnGhost, padding: '3px 10px', fontSize: 11 }} onClick={() => cargar()}>Reintentar</button>
        </div>
      )}

      {MONTANAS.map(({ key, label }) => {
        const grupo = journeys.filter((j) => j.montana === key);
        if (!grupo.length) return null;
        return (
          <div key={key}>
            <p style={sectionTitle}>{label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grupo.map((j) => {
                const etapaActual = j.etapas.find((e) => e.orden === j.etapa_actual);
                const progreso = j.progresoEtapa;
                const pct = progreso ? Math.max(0, Math.min(100, Math.round(progreso.progreso * 100))) : 0;
                const carta = etapaActual ? cartasPorId.get(etapaActual.contenido_slug) : undefined;
                const enAccion = accionando === j.slug || accionando === j.id;
                const aviso = avisoAvance[j.id];

                return (
                  <div key={j.id} style={{ ...card, opacity: j.estado === 'bloqueado' ? 0.65 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--os-text)', fontFamily: 'var(--os-font-display)' }}>{j.nombre}</span>
                          <Badge estado={j.estado} />
                        </div>
                        {j.descripcion && (
                          <p style={{ fontSize: 12.5, color: 'var(--os-text-2)', margin: '6px 0 0', maxWidth: 560 }}>{j.descripcion}</p>
                        )}
                      </div>
                      {j.estado === 'disponible' && (
                        <button style={enAccion ? btnDisabled : btn} disabled={enAccion} onClick={() => iniciar(j.slug)}>
                          {enAccion ? 'Iniciando...' : '▶ Iniciar'}
                        </button>
                      )}
                    </div>

                    {j.estado === 'en_curso' && etapaActual && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--os-line-soft)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--os-text)' }}>
                            Etapa {j.etapa_actual} de {j.etapas.length}: {etapaActual.nombre}
                          </span>
                          {progreso && (
                            <span style={{ fontSize: 11, fontFamily: 'var(--os-font-mono)', color: 'var(--os-champagne)' }}>
                              {progreso.hechos} / {progreso.meta}
                            </span>
                          )}
                        </div>

                        {progreso && (
                          <div style={{ height: 6, background: 'rgba(232,234,240,0.08)', borderRadius: 3, overflow: 'hidden', margin: '8px 0 10px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--os-accent)', borderRadius: 3, transition: 'width .3s' }} />
                          </div>
                        )}

                        {carta && (
                          <div style={{ background: 'rgba(232,234,240,0.04)', border: '1px solid var(--os-line-soft)', borderRadius: 8, padding: '10px 12px', margin: '4px 0 10px' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--os-accent-light)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{carta.title}</p>
                            <p style={{ fontSize: 12.5, color: 'var(--os-text-2)', margin: '0 0 6px' }}>{carta.resumen}</p>
                            <a href={`#carta-${carta.id}`} style={{ fontSize: 11.5, color: 'var(--os-accent-light)', textDecoration: 'none', fontWeight: 600 }}>
                              Leer carta completa ↓
                            </a>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <button
                            style={progreso?.cumplida && !enAccion ? btn : btnDisabled}
                            disabled={!progreso?.cumplida || enAccion}
                            onClick={() => avanzar(j.id)}
                          >
                            {enAccion ? 'Avanzando...' : 'Avanzar de etapa'}
                          </button>
                          {!progreso?.cumplida && (
                            <span style={{ fontSize: 11.5, color: 'var(--os-muted)' }}>
                              {aviso || `Te faltan ${Math.max(0, (progreso?.meta ?? 0) - (progreso?.hechos ?? 0))} checks.`}
                            </span>
                          )}
                        </div>

                        <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {j.etapas.map((e) => (
                            <li key={e.id} style={{ fontSize: 12, color: e.completada_at ? 'var(--os-text-2)' : 'var(--os-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: e.completada_at ? 'var(--os-ok)' : 'var(--os-muted)' }}>{e.completada_at ? '✓' : '○'}</span>
                              {e.orden}. {e.nombre}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {j.estado === 'completado' && (
                      <p style={{ fontSize: 11.5, color: 'var(--os-muted)', margin: '10px 0 0' }}>
                        {j.etapas.length} etapa{j.etapas.length === 1 ? '' : 's'} completadas.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
