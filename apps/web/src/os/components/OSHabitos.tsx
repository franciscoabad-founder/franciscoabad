import { useEffect, useMemo, useState } from 'react';
import OSHabitoForm from './OSHabitoForm';

// ── Tipos (contrato del API construido en paralelo) ─────────────────────────
export interface Racha { actual: number; mejor: number }
export interface Nivel { nivel: number; xpEnNivel: number; xpSiguiente: number; progreso: number }
export interface Perfil { xp_total: number; nivel: Nivel }
export interface Habito {
  id: string; nombre: string; descripcion: string | null;
  tipo: 'habito' | 'diaria'; dificultad: string; dias_semana: number[];
  intencion: string | null; hora_recordatorio: string | null;
  es_core: boolean; en_checklist: boolean; orden: number;
  estado: 'activo' | 'pausado' | 'archivado';
  valor: number;
  hecho_hoy: boolean | null;
  conteo_hoy: { mas: number; menos: number } | null;
  racha: Racha | null; ema: number | null; falloAyer: boolean; ultimos7: boolean[];
  // NOTA: no vienen listados explícitamente en el contrato del GET, pero la UI
  // los necesita para saber qué botones mostrar en hábitos +/-. Se asumen
  // presentes en la fila (mismas columnas que persiste el POST de creación).
  permite_mas?: boolean;
  permite_menos?: boolean;
}
interface CheckResponse {
  ok?: boolean; xp?: number; oro?: number; valor?: number;
  racha?: Racha; nivel?: Nivel; subioNivel?: boolean; error?: string;
}

const TZ = 'America/Guayaquil';
function hoyISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}
function isoWeekdayHoy(): number {
  const d = new Date().getDay(); // 0=domingo..6=sabado
  return d === 0 ? 7 : d;
}
const DIA_LABEL: Record<number, string> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 7: 'D' };

// ── Estilos (mismo molde que OSSaludAyuno / OSSaludNutricion) ───────────────
const card: React.CSSProperties = {
  background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)',
  borderRadius: 'var(--os-r-card)', padding: '1rem',
};
const btn: React.CSSProperties = {
  background: 'var(--os-accent)', color: '#fff', border: 'none', borderRadius: 6,
  padding: '10px 18px', fontSize: 14, fontFamily: 'var(--os-font-display)', fontWeight: 700, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: 'var(--os-muted)', border: '1px solid var(--os-line)',
  borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
};
const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--os-font-display)', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--os-muted)', margin: '0 0 10px',
};
const circleBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--os-line)',
  background: 'rgba(232,234,240,0.05)', color: 'var(--os-text)', fontSize: 20, fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

// ── Anillo EMA mini (mismo patrón SVG que OSSaludAyuno:151-161) ─────────────
function AnilloEma({ valor, size = 30 }: { valor: number | null; size?: number }) {
  const r = (size - 6) / 2;
  const C = 2 * Math.PI * r;
  const pct = valor == null ? 0 : Math.max(0, Math.min(1, valor));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--os-line)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--os-accent)" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${pct * C} ${C}`} style={{ transition: 'stroke-dasharray .4s' }} />
    </svg>
  );
}

export default function OSHabitos() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formAbierto, setFormAbierto] = useState<'nuevo' | Habito | null>(null);
  const [mostrarOtras, setMostrarOtras] = useState(false);
  const [mostrarPausados, setMostrarPausados] = useState(false);
  const [toast, setToast] = useState<{ id: number; texto: string } | null>(null);
  const [nivelUp, setNivelUp] = useState<number | null>(null);

  async function cargar(mostrarLoading = true) {
    if (mostrarLoading) setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/os/habitos');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHabitos(data.habitos ?? []);
      setPerfil(data.perfil ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  function mostrarToast(xp?: number, oro?: number) {
    if (!xp && !oro) return;
    const partes = [xp ? `+${xp} XP` : null, oro ? `+${oro} oro` : null].filter(Boolean);
    const id = Date.now();
    setToast({ id, texto: partes.join(' · ') });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 1500);
  }
  function mostrarNivelUp(n: number) {
    setNivelUp(n);
    setTimeout(() => setNivelUp((cur) => (cur === n ? null : cur)), 2400);
  }

  async function registrarCheck(habitoId: string, signo?: 'mas' | 'menos') {
    setError('');
    try {
      const res = await fetch('/api/os/habitos/checks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signo ? { habito_id: habitoId, signo } : { habito_id: habitoId }),
      });
      const data: CheckResponse = await res.json();
      if (res.status === 409) { setError('Esta diaria ya fue registrada hoy.'); await cargar(false); return; }
      if (data.error) throw new Error(data.error);
      mostrarToast(data.xp, data.oro);
      if (data.subioNivel && data.nivel) mostrarNivelUp(data.nivel.nivel);
      await cargar(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrar');
    }
  }

  async function toggleDiaria(h: Habito) {
    if (h.hecho_hoy) {
      if (!confirm('¿Deshacer este check de hoy?')) return;
      try {
        const res = await fetch(`/api/os/habitos/checks?habito_id=${h.id}&fecha=${hoyISO()}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('No se pudo deshacer');
        await cargar(false);
      } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
      return;
    }
    await registrarCheck(h.id);
  }

  async function reactivar(h: Habito) {
    try {
      await fetch(`/api/os/habitos?id=${h.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'activo' }),
      });
      await cargar(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al reactivar'); }
  }

  const hoyIso = isoWeekdayHoy();
  const activos = useMemo(() => habitos.filter((h) => h.estado === 'activo'), [habitos]);
  const pausados = useMemo(() => habitos.filter((h) => h.estado === 'pausado'), [habitos]);
  const diariasHoy = useMemo(
    () => activos.filter((h) => h.tipo === 'diaria' && h.dias_semana?.includes(hoyIso)),
    [activos, hoyIso],
  );
  const diariasOtras = useMemo(
    () => activos.filter((h) => h.tipo === 'diaria' && !h.dias_semana?.includes(hoyIso)),
    [activos, hoyIso],
  );
  const habitosMasMenos = useMemo(() => activos.filter((h) => h.tipo === 'habito'), [activos]);

  const alertaFalloAyer = useMemo(() => {
    const fallados = habitos.filter((h) => h.falloAyer);
    if (!fallados.length) return null;
    const extra = fallados.length > 1 ? ` y ${fallados.length - 1} más` : '';
    return `Ayer fallaste ${fallados[0].nombre}${extra}. Hoy no se falla dos veces.`;
  }, [habitos]);

  const progresoPct = useMemo(() => {
    const p = perfil?.nivel.progreso ?? 0;
    const pct = p <= 1 ? p * 100 : p;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [perfil]);

  if (formAbierto) {
    return (
      <OSHabitoForm
        habito={formAbierto === 'nuevo' ? null : formAbierto}
        onCerrar={() => setFormAbierto(null)}
        onGuardado={() => { setFormAbierto(null); cargar(false); }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header: nivel + XP */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="os-pill os-pill-gold">Nv {perfil?.nivel.nivel ?? 1}</span>
            <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 15, color: 'var(--os-champagne)', fontWeight: 700 }}>
              {perfil?.xp_total ?? 0} XP
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--os-muted)' }}>
            {perfil ? `${perfil.nivel.xpEnNivel} / ${perfil.nivel.xpSiguiente} XP` : '—'}
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(232,234,240,0.08)', borderRadius: 3, overflow: 'hidden', marginTop: 10 }}>
          <div style={{ height: '100%', width: `${progresoPct}%`, background: 'var(--os-accent)', borderRadius: 3, transition: 'width .3s' }} />
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--os-error)', fontSize: 13 }}>
          <span>{error}</span>
          <button style={{ ...btnGhost, padding: '3px 10px', fontSize: 11 }} onClick={() => cargar()}>Reintentar</button>
        </div>
      )}

      {alertaFalloAyer && (
        <div style={{ ...card, borderColor: 'rgba(255,180,171,0.3)', background: 'rgba(147,0,10,0.08)', padding: '10px 12px' }}>
          <p style={{ fontSize: 12, color: 'var(--os-warn)', margin: 0 }}>⚠️ {alertaFalloAyer}</p>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Cargando...</p>
      ) : habitos.length === 0 ? (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
          <p style={{ fontSize: 14, color: 'var(--os-text-2)', margin: 0 }}>
            Sin hábitos aún. Crea el primero o{' '}
            <a href="/os/habitos/journeys" style={{ color: 'var(--os-accent-light)' }}>inicia un journey</a>.
          </p>
          <button style={btn} onClick={() => setFormAbierto('nuevo')}>+ Crear primer hábito</button>
        </div>
      ) : (
        <>
          {/* Diarias de hoy */}
          <div>
            <p style={sectionTitle}>Diarias de hoy</p>
            {diariasHoy.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Nada programado para hoy.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {diariasHoy.map((h) => {
                  const hecho = !!h.hecho_hoy;
                  return (
                    <div key={h.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem' }}>
                      <button
                        onClick={() => toggleDiaria(h)}
                        aria-label={hecho ? 'Deshacer' : 'Marcar hecho'}
                        style={{
                          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                          border: hecho ? 'none' : '2px solid var(--os-line)',
                          background: hecho ? 'var(--os-ok)' : 'transparent',
                          color: hecho ? '#06210f' : 'transparent',
                          fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'background .15s, border-color .15s',
                        }}
                      >✓</button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--os-text)' }}>{h.nombre}</span>
                          {h.es_core && <span className="os-pill os-pill-accent" style={{ fontSize: 9, padding: '1px 7px' }}>core</span>}
                          {h.racha && h.racha.actual >= 2 && (
                            <span style={{ fontSize: 12, fontFamily: 'var(--os-font-mono)', color: 'var(--os-champagne)' }}>🔥{h.racha.actual}</span>
                          )}
                        </div>
                        {h.intencion && <p style={{ fontSize: 11, color: 'var(--os-muted)', margin: '2px 0 0' }}>{h.intencion}</p>}
                      </div>
                      <AnilloEma valor={h.ema} size={30} />
                      <button style={{ ...btnGhost, padding: '4px 8px', flexShrink: 0 }} onClick={() => setFormAbierto(h)} title="Editar">✎</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hábitos +/- */}
          <div>
            <p style={sectionTitle}>Hábitos</p>
            {habitosMasMenos.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Sin hábitos +/- activos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {habitosMasMenos.map((h) => {
                  const contadores = h.conteo_hoy ?? { mas: 0, menos: 0 };
                  const permiteMas = h.permite_mas ?? true;
                  const permiteMenos = h.permite_menos ?? false;
                  return (
                    <div key={h.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--os-text)' }}>{h.nombre}</span>
                          {h.racha && h.racha.actual >= 2 && (
                            <span style={{ fontSize: 12, fontFamily: 'var(--os-font-mono)', color: 'var(--os-champagne)' }}>🔥{h.racha.actual}</span>
                          )}
                        </div>
                        {h.intencion && <p style={{ fontSize: 11, color: 'var(--os-muted)', margin: '2px 0 0' }}>{h.intencion}</p>}
                      </div>
                      <AnilloEma valor={h.ema} size={28} />
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                        {permiteMenos && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <button style={{ ...circleBtn, borderColor: 'rgba(248,113,113,0.4)' }} onClick={() => registrarCheck(h.id, 'menos')} aria-label="Registrar fallo/menos">−</button>
                            <span style={{ fontSize: 10, fontFamily: 'var(--os-font-mono)', color: 'var(--os-muted)' }}>{contadores.menos}</span>
                          </div>
                        )}
                        {permiteMas && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <button style={{ ...circleBtn, borderColor: 'rgba(34,197,94,0.4)' }} onClick={() => registrarCheck(h.id, 'mas')} aria-label="Registrar hecho">+</button>
                            <span style={{ fontSize: 10, fontFamily: 'var(--os-font-mono)', color: 'var(--os-muted)' }}>{contadores.mas}</span>
                          </div>
                        )}
                      </div>
                      <button style={{ ...btnGhost, padding: '4px 8px', flexShrink: 0 }} onClick={() => setFormAbierto(h)} title="Editar">✎</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Diarias de otros días (colapsado) */}
          {diariasOtras.length > 0 && (
            <div>
              <button style={{ ...btnGhost, width: '100%', textAlign: 'left' }} onClick={() => setMostrarOtras(!mostrarOtras)}>
                {mostrarOtras ? '▾' : '▸'} Diarias de otros días ({diariasOtras.length})
              </button>
              {mostrarOtras && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {diariasOtras.map((h) => (
                    <div key={h.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', opacity: 0.6 }}>
                      <span style={{ fontSize: 13, color: 'var(--os-text-2)' }}>{h.nombre}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--os-font-mono)', color: 'var(--os-muted)' }}>
                        {h.dias_semana.map((d) => DIA_LABEL[d]).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pausados */}
          {pausados.length > 0 && (
            <div>
              <button style={{ ...btnGhost, width: '100%', textAlign: 'left' }} onClick={() => setMostrarPausados(!mostrarPausados)}>
                {mostrarPausados ? '▾' : '▸'} Pausados ({pausados.length})
              </button>
              {mostrarPausados && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {pausados.map((h) => (
                    <div key={h.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', opacity: 0.6 }}>
                      <span style={{ fontSize: 13, color: 'var(--os-text-2)' }}>{h.nombre}</span>
                      <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => reactivar(h)}>Reactivar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <button style={btn} onClick={() => setFormAbierto('nuevo')}>+ Nuevo hábito</button>

      {/* Feedback flotante de XP/oro */}
      {toast && (
        <div key={toast.id} className="habito-toast" style={{ position: 'fixed', left: '50%', bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))', zIndex: 180, pointerEvents: 'none' }}>
          <div style={{ background: 'var(--os-accent)', color: '#fff', fontFamily: 'var(--os-font-display)', fontWeight: 700, fontSize: 14, padding: '8px 18px', borderRadius: 999, boxShadow: 'var(--os-shadow-accent)', whiteSpace: 'nowrap' }}>
            {toast.texto}
          </div>
        </div>
      )}

      {/* Celebración de subida de nivel */}
      {nivelUp != null && (
        <div className="habito-levelup" style={{ position: 'fixed', left: '50%', top: '90px', zIndex: 190, pointerEvents: 'none' }}>
          <div style={{ background: 'var(--os-champagne)', color: '#1A1A1A', fontFamily: 'var(--os-font-display)', fontWeight: 800, fontSize: 16, padding: '10px 24px', borderRadius: 12, boxShadow: 'var(--os-shadow-modal)', whiteSpace: 'nowrap' }}>
            ¡Nivel {nivelUp}!
          </div>
        </div>
      )}

      <style>{`
        @keyframes habito-toast-float {
          0%   { opacity: 0; transform: translate(-50%, 10px); }
          15%  { opacity: 1; transform: translate(-50%, 0); }
          80%  { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -14px); }
        }
        .habito-toast { animation: habito-toast-float 1.5s ease-out forwards; }
        @keyframes habito-levelup-pop {
          0%   { opacity: 0; transform: translate(-50%, -10px) scale(0.9); }
          12%  { opacity: 1; transform: translate(-50%, 0) scale(1.04); }
          20%  { transform: translate(-50%, 0) scale(1); }
          85%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -8px) scale(0.96); }
        }
        .habito-levelup { animation: habito-levelup-pop 2.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
