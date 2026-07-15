import { useEffect, useMemo, useState } from 'react';

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Porcion { medida: string; gramos: number }
interface Alimento {
  id: string; nombre: string; marca: string | null; fuente: string;
  kcal: number; proteina_g: number; carbos_g: number; grasa_g: number;
  fibra_g: number | null; porciones: Porcion[];
}
interface Comida {
  id: string; fecha: string; momento: string; alimento_id: string | null;
  descripcion_libre: string | null; cantidad_g: number | null;
  kcal: number | null; proteina_g: number | null; carbos_g: number | null;
  grasa_g: number | null; fibra_g: number | null; tipo_dia: string; notas: string | null;
}
interface Target {
  kcal_min: number; kcal_max: number; proteina_g: number;
  carbos_g: number; grasa_g_min: number; grasa_g_max: number;
}
interface Config {
  ajustes_tipo_dia: Record<string, Target>;
  kcal_min: number; kcal_max: number; proteina_g: number;
  carbos_g: number; grasa_g_min: number; grasa_g_max: number;
}

const MOMENTOS = ['desayuno', 'almuerzo', 'cena', 'snack'] as const;
const MOMENTO_LABEL: Record<string, string> = {
  desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snack: 'Snack',
};
const TIPOS_DIA = [
  { key: 'normal', label: 'Normal' },
  { key: 'leg_day', label: 'Leg day' },
  { key: 'refeed', label: 'Refeed' },
  { key: 'keto_light', label: 'Keto light' },
  { key: 'keto', label: 'Keto' },
];

// ── Estilos ────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)',
  borderRadius: 'var(--os-r-card)', padding: '1rem',
};
const inputStyle: React.CSSProperties = {
  background: 'rgba(232,234,240,0.05)', border: '1px solid var(--os-line)',
  borderRadius: 6, padding: '7px 10px', fontSize: 13, color: 'var(--os-text)',
  fontFamily: 'var(--os-font-body)', outline: 'none', width: '100%',
};
const selStyle: React.CSSProperties = { ...inputStyle, background: '#0E1738', colorScheme: 'dark' };
const btn: React.CSSProperties = {
  background: 'var(--os-accent)', color: '#fff', border: 'none', borderRadius: 6,
  padding: '8px 16px', fontSize: 13, fontFamily: 'var(--os-font-display)',
  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
};
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: 'var(--os-muted)', border: '1px solid var(--os-line)',
  borderRadius: 6, padding: '7px 12px', fontSize: 12, cursor: 'pointer',
};

// ── Utilidades de fecha ──────────────────────────────────────────────────────
const TZ = 'America/Guayaquil';
function hoyISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}
function addDias(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}
function fechaLarga(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-EC', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}
const round = (n: number) => Math.round(n * 10) / 10;

// ── Componente barra de macro ────────────────────────────────────────────────
function MacroBar({ label, actual, target, color, unidad = 'g' }: {
  label: string; actual: number; target: number; color: string; unidad?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const over = target > 0 && actual > target;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: 'var(--os-text-2)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: 'var(--os-font-mono)', color: over ? 'var(--os-warn)' : 'var(--os-text)' }}>
          {round(actual)}<span style={{ color: 'var(--os-muted)' }}> / {target}{unidad}</span>
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(232,234,240,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--os-warn)' : color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
    </div>
  );
}

export default function OSSaludNutricion() {
  const [dia, setDia] = useState(hoyISO());
  const [comidas, setComidas] = useState<Comida[]>([]);
  const [totales, setTotales] = useState({ kcal: 0, proteina_g: 0, carbos_g: 0, grasa_g: 0, fibra_g: 0 });
  const [config, setConfig] = useState<Config | null>(null);
  const [tipoDia, setTipoDia] = useState('normal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semana, setSemana] = useState<Comida[]>([]);

  // Búsqueda de alimentos
  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState<Alimento[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [sel, setSel] = useState<Alimento | null>(null);
  const [cantidad, setCantidad] = useState('100');
  const [porcionIdx, setPorcionIdx] = useState(-1); // -1 = gramos directos
  const [momento, setMomento] = useState<string>('desayuno');
  const [libre, setLibre] = useState({ descripcion: '', kcal: '', proteina: '', carbos: '', grasa: '' });
  const [modo, setModo] = useState<'buscar' | 'libre'>('buscar');
  const [guardando, setGuardando] = useState(false);

  const target: Target = useMemo(() => {
    if (!config) return { kcal_min: 2100, kcal_max: 2200, proteina_g: 160, carbos_g: 160, grasa_g_min: 90, grasa_g_max: 95 };
    const base = {
      kcal_min: config.kcal_min, kcal_max: config.kcal_max, proteina_g: config.proteina_g,
      carbos_g: config.carbos_g, grasa_g_min: config.grasa_g_min, grasa_g_max: config.grasa_g_max,
    };
    const aj = config.ajustes_tipo_dia?.[tipoDia] ?? config.ajustes_tipo_dia?.['normal'] ?? {};
    return { ...base, ...aj };
  }, [config, tipoDia]);

  async function cargarDia(d = dia) {
    setLoading(true); setError('');
    try {
      const [resDia, resCfg] = await Promise.all([
        fetch(`/api/os/salud/comidas-log?dia=${d}`),
        config ? Promise.resolve(null) : fetch('/api/os/salud/config'),
      ]);
      const data = await resDia.json();
      if (data.error) throw new Error(data.error);
      setComidas(data.comidas ?? []);
      setTotales(data.totales ?? { kcal: 0, proteina_g: 0, carbos_g: 0, grasa_g: 0, fibra_g: 0 });
      if (data.comidas?.length) setTipoDia(data.comidas[0].tipo_dia || 'normal');
      if (resCfg) {
        const cfg = await resCfg.json();
        if (cfg.config) setConfig(cfg.config);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }

  async function cargarSemana() {
    try {
      const desde = addDias(hoyISO(), -6);
      const res = await fetch(`/api/os/salud/comidas-log?historial=1&desde=${desde}`);
      const data = await res.json();
      if (!data.error) setSemana(data.comidas ?? []);
    } catch { /* silencioso */ }
  }

  useEffect(() => { cargarDia(dia); /* eslint-disable-next-line */ }, [dia]);
  useEffect(() => { cargarSemana(); /* eslint-disable-next-line */ }, []);

  // Buscar alimentos (debounce simple)
  useEffect(() => {
    if (modo !== 'buscar') return;
    const t = setTimeout(async () => {
      if (!q.trim()) { setResultados([]); return; }
      setBuscando(true);
      try {
        const res = await fetch(`/api/os/salud/alimentos?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResultados(data.alimentos ?? []);
      } catch { setResultados([]); }
      finally { setBuscando(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, modo]);

  const gramosEfectivos = useMemo(() => {
    const n = Number(cantidad) || 0;
    if (porcionIdx >= 0 && sel?.porciones?.[porcionIdx]) {
      return round(sel.porciones[porcionIdx].gramos * n);
    }
    return n;
  }, [cantidad, porcionIdx, sel]);

  const preview = useMemo(() => {
    if (!sel) return null;
    const f = gramosEfectivos / 100;
    return {
      kcal: round(sel.kcal * f), proteina_g: round(sel.proteina_g * f),
      carbos_g: round(sel.carbos_g * f), grasa_g: round(sel.grasa_g * f),
    };
  }, [sel, gramosEfectivos]);

  async function agregar() {
    setGuardando(true); setError('');
    try {
      let body: Record<string, unknown> = { momento, fecha: dia, tipo_dia: tipoDia };
      if (modo === 'buscar' && sel) {
        body.alimento_id = sel.id;
        body.cantidad_g = gramosEfectivos;
        body.descripcion_libre = sel.nombre;
      } else {
        if (!libre.descripcion.trim()) { setError('Describe qué comiste'); setGuardando(false); return; }
        body.descripcion_libre = libre.descripcion.trim();
        body.kcal = libre.kcal || null;
        body.proteina_g = libre.proteina || null;
        body.carbos_g = libre.carbos || null;
        body.grasa_g = libre.grasa || null;
      }
      const res = await fetch('/api/os/salud/comidas-log', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // reset
      setSel(null); setQ(''); setResultados([]); setCantidad('100'); setPorcionIdx(-1);
      setLibre({ descripcion: '', kcal: '', proteina: '', carbos: '', grasa: '' });
      await cargarDia(dia); cargarSemana();
      // Integración ayuno: si hay ayuno abierto, ofrecer cerrarlo con esta comida (primera del día).
      ofrecerCerrarAyuno();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function ofrecerCerrarAyuno() {
    try {
      const res = await fetch('/api/os/salud/ayunos?abierto=1');
      const data = await res.json();
      const ayuno = data.ayuno;
      if (ayuno && ayuno.id) {
        if (confirm('Tienes un ayuno abierto. ¿Cerrarlo ahora con esta comida?')) {
          await fetch(`/api/os/salud/ayunos?id=${ayuno.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fin: new Date().toISOString() }),
          });
        }
      }
    } catch { /* silencioso: el módulo de ayuno puede no tener registros */ }
  }

  async function borrar(id: string) {
    if (!confirm('¿Borrar esta entrada?')) return;
    await fetch(`/api/os/salud/comidas-log?id=${id}`, { method: 'DELETE' });
    cargarDia(dia); cargarSemana();
  }

  async function cambiarTipoDia(nuevo: string) {
    setTipoDia(nuevo);
    // Actualiza el tipo_dia de las entradas del día para que el histórico sea coherente.
    await Promise.all(comidas.map((c) =>
      fetch(`/api/os/salud/comidas-log?id=${c.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_dia: nuevo }),
      })
    ));
  }

  const porMomento = useMemo(() => {
    const g: Record<string, Comida[]> = { desayuno: [], almuerzo: [], cena: [], snack: [] };
    for (const c of comidas) (g[c.momento] ?? g.snack).push(c);
    return g;
  }, [comidas]);

  const promedioSemana = useMemo(() => {
    if (!semana.length) return null;
    const porFecha: Record<string, number> = {};
    for (const c of semana) porFecha[c.fecha] = (porFecha[c.fecha] || 0) + (Number(c.kcal) || 0);
    const dias = Object.values(porFecha);
    if (!dias.length) return null;
    return Math.round(dias.reduce((a, b) => a + b, 0) / dias.length);
  }, [semana]);

  const kcalMid = Math.round((target.kcal_min + target.kcal_max) / 2);
  const grasaMid = Math.round((target.grasa_g_min + target.grasa_g_max) / 2);
  const anilloPct = kcalMid > 0 ? Math.min(100, (totales.kcal / kcalMid) * 100) : 0;
  const C = 2 * Math.PI * 52;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Navegación de día + tipo de día */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={btnGhost} onClick={() => setDia(addDias(dia, -1))}>‹</button>
          <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 13, minWidth: 120, textAlign: 'center', textTransform: 'capitalize' }}>
            {dia === hoyISO() ? 'Hoy' : fechaLarga(dia)}
          </span>
          <button style={btnGhost} onClick={() => setDia(addDias(dia, 1))} disabled={dia >= hoyISO()}>›</button>
          {dia !== hoyISO() && <button style={btnGhost} onClick={() => setDia(hoyISO())}>Hoy</button>}
        </div>
        <select style={{ ...selStyle, width: 'auto' }} value={tipoDia} onChange={(e) => cambiarTipoDia(e.target.value)}>
          {TIPOS_DIA.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>

      {error && <div style={{ color: 'var(--os-error)', fontSize: 13 }}>{error}</div>}

      {/* Anillo kcal + barras de macros */}
      <div style={{ ...card, display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg viewBox="0 0 120 120" width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--os-line)" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={totales.kcal > target.kcal_max ? 'var(--os-warn)' : 'var(--os-accent)'}
              strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(anilloPct / 100) * C} ${C}`} style={{ transition: 'stroke-dasharray .4s' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{Math.round(totales.kcal)}</span>
            <span style={{ fontSize: 9, color: 'var(--os-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>de {kcalMid} kcal</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MacroBar label="Proteína" actual={totales.proteina_g} target={target.proteina_g} color="#6B7AE8" />
          <MacroBar label="Carbos" actual={totales.carbos_g} target={target.carbos_g} color="#3B4ED9" />
          <MacroBar label="Grasa" actual={totales.grasa_g} target={grasaMid} color="#B5985A" />
        </div>
      </div>

      {/* Alta rápida */}
      <div style={card}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button style={modo === 'buscar' ? btn : btnGhost} onClick={() => setModo('buscar')}>Buscar alimento</button>
          <button style={modo === 'libre' ? btn : btnGhost} onClick={() => setModo('libre')}>Entrada libre</button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <select style={{ ...selStyle, width: 'auto', flex: '0 0 auto' }} value={momento} onChange={(e) => setMomento(e.target.value)}>
            {MOMENTOS.map((m) => <option key={m} value={m}>{MOMENTO_LABEL[m]}</option>)}
          </select>
        </div>

        {modo === 'buscar' ? (
          <div>
            {!sel ? (
              <>
                <input style={inputStyle} placeholder="Buscar (pollo, arroz, banano...)" value={q} onChange={(e) => setQ(e.target.value)} />
                {buscando && <p style={{ fontSize: 12, color: 'var(--os-muted)', marginTop: 8 }}>Buscando...</p>}
                {!buscando && q && resultados.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--os-muted)', marginTop: 8 }}>
                    Sin resultados. Usa "Entrada libre" o revisa el seed de alimentos.
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {resultados.map((a) => (
                    <button key={a.id} onClick={() => { setSel(a); setPorcionIdx(-1); setCantidad('100'); }}
                      style={{ ...btnGhost, textAlign: 'left', display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                      <span style={{ color: 'var(--os-text)' }}>{a.nombre}{a.marca ? ` · ${a.marca}` : ''}</span>
                      <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 11, color: 'var(--os-muted)' }}>{a.kcal} kcal/100g</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--os-text)' }}>{sel.nombre}</span>
                  <button style={btnGhost} onClick={() => setSel(null)}>Cambiar</button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input style={{ ...inputStyle, width: 90 }} type="number" min="0" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                  <select style={{ ...selStyle, width: 'auto' }} value={porcionIdx} onChange={(e) => setPorcionIdx(Number(e.target.value))}>
                    <option value={-1}>gramos</option>
                    {sel.porciones?.map((p, i) => <option key={i} value={i}>{p.medida} ({p.gramos}g)</option>)}
                  </select>
                  {porcionIdx >= 0 && <span style={{ fontSize: 12, color: 'var(--os-muted)' }}>= {gramosEfectivos} g</span>}
                </div>
                {preview && (
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, fontFamily: 'var(--os-font-mono)', color: 'var(--os-text-2)', flexWrap: 'wrap' }}>
                    <span>{preview.kcal} kcal</span><span>P {preview.proteina_g}g</span>
                    <span>C {preview.carbos_g}g</span><span>G {preview.grasa_g}g</span>
                  </div>
                )}
                <button style={btn} disabled={guardando} onClick={agregar}>{guardando ? 'Guardando...' : 'Agregar'}</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={inputStyle} placeholder="Qué comiste *" value={libre.descripcion} onChange={(e) => setLibre({ ...libre, descripcion: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              <input style={inputStyle} type="number" placeholder="kcal" value={libre.kcal} onChange={(e) => setLibre({ ...libre, kcal: e.target.value })} />
              <input style={inputStyle} type="number" placeholder="P (g)" value={libre.proteina} onChange={(e) => setLibre({ ...libre, proteina: e.target.value })} />
              <input style={inputStyle} type="number" placeholder="C (g)" value={libre.carbos} onChange={(e) => setLibre({ ...libre, carbos: e.target.value })} />
              <input style={inputStyle} type="number" placeholder="G (g)" value={libre.grasa} onChange={(e) => setLibre({ ...libre, grasa: e.target.value })} />
            </div>
            <button style={btn} disabled={guardando} onClick={agregar}>{guardando ? 'Guardando...' : 'Agregar entrada libre'}</button>
          </div>
        )}
      </div>

      {/* Log del día por momento */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Cargando...</p>
        ) : comidas.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--os-muted)' }}>Sin comidas registradas este día.</p>
        ) : (
          MOMENTOS.filter((m) => porMomento[m].length).map((m) => (
            <div key={m} style={card}>
              <p style={{ fontFamily: 'var(--os-font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--os-accent-light)', margin: '0 0 8px' }}>
                {MOMENTO_LABEL[m]}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {porMomento[m].map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--os-line-soft)' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: 'var(--os-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.descripcion_libre || 'Alimento'}{c.cantidad_g ? ` · ${c.cantidad_g}g` : ''}
                      </p>
                      <p style={{ fontSize: 11, fontFamily: 'var(--os-font-mono)', color: 'var(--os-muted)', margin: '2px 0 0' }}>
                        {c.kcal ?? 0} kcal · P{c.proteina_g ?? 0} C{c.carbos_g ?? 0} G{c.grasa_g ?? 0}
                      </p>
                    </div>
                    <button style={{ ...btnGhost, padding: '4px 8px' }} onClick={() => borrar(c.id)} title="Borrar">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historial semanal */}
      {promedioSemana != null && (
        <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--os-text-2)' }}>Promedio últimos 7 días</span>
          <span style={{ fontFamily: 'var(--os-font-mono)', fontSize: 16, color: 'var(--os-champagne)', fontWeight: 700 }}>{promedioSemana} kcal</span>
        </div>
      )}
    </div>
  );
}
