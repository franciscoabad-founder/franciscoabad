import { useState } from 'react';
import type { Habito } from './OSHabitos';

interface Props {
  habito?: Habito | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

const DIAS = [
  { iso: 1, label: 'L' }, { iso: 2, label: 'M' }, { iso: 3, label: 'X' }, { iso: 4, label: 'J' },
  { iso: 5, label: 'V' }, { iso: 6, label: 'S' }, { iso: 7, label: 'D' },
];
const DIFICULTADES = [
  { key: 'trivial', label: 'Trivial' }, { key: 'facil', label: 'Fácil' },
  { key: 'media', label: 'Media' }, { key: 'dificil', label: 'Difícil' },
];
const TIPO_EXPL: Record<string, string> = {
  diaria: 'Se hace todos los días programados; fallar un día programado cuenta como fallo.',
  habito: 'Se registra cuantas veces quieras con + o −, sin horario fijo.',
};

// ── Estilos (Telemetria Tactica: tokens --m-* del modulo Habitos) ───────────
const card: React.CSSProperties = {
  background: 'var(--m-surface)', border: '1px solid var(--m-line)', borderRadius: 0, padding: '1rem',
};
const input: React.CSSProperties = {
  background: 'var(--m-surface)', border: '1px solid var(--m-line)',
  borderRadius: 0, padding: '0.65rem 0.7rem', minHeight: 44, fontSize: 14, color: 'var(--m-fg)',
  fontFamily: 'var(--os-font-body)', outline: 'none', width: '100%',
};
const inputTime: React.CSSProperties = { ...input, colorScheme: 'dark' };
const btn: React.CSSProperties = {
  background: 'var(--m-fg)', color: 'var(--m-bg)', border: 'none', borderRadius: 0,
  padding: '0.75rem 1.1rem', minHeight: 44, fontSize: 12, fontFamily: 'var(--m-font-mono)', fontWeight: 700,
  letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: 'var(--m-muted)', border: '1px solid var(--m-line)',
  borderRadius: 0, padding: '0.6rem 0.9rem', minHeight: 44, fontSize: 11, fontFamily: 'var(--m-font-mono)',
  letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
};
const label: React.CSSProperties = {
  fontFamily: 'var(--m-font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--m-muted)', marginBottom: 6, display: 'block',
};
function pill(activo: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44,
    padding: '0.5rem 0.9rem', borderRadius: 0, fontSize: 12, fontFamily: 'var(--m-font-mono)', fontWeight: 700,
    letterSpacing: '0.04em', textTransform: 'uppercase',
    cursor: 'pointer', border: activo ? '1px solid var(--m-accent)' : '1px solid var(--m-line)',
    background: activo ? 'var(--m-accent)' : 'transparent',
    color: activo ? 'var(--m-fg)' : 'var(--m-muted)', transition: 'background .14s, color .14s, border-color .14s',
  };
}

function Toggle({ checked, onChange, titulo, hint }: { checked: boolean; onChange: (v: boolean) => void; titulo: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }} onClick={() => onChange(!checked)}>
      <span style={{
        width: 44, height: 24, flexShrink: 0, marginTop: 1, position: 'relative', border: '1px solid var(--m-line)',
        background: checked ? 'var(--m-accent)' : 'transparent', transition: 'background .15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? 21 : 2, width: 19, height: 19,
          background: 'var(--m-fg)', transition: 'left .15s',
        }} />
      </span>
      <span>
        <span style={{ fontSize: 13, color: 'var(--m-fg)', fontWeight: 700, textTransform: 'uppercase' }}>{titulo}</span>
        {hint && <p style={{ fontSize: 11, color: 'var(--m-muted)', margin: '2px 0 0', lineHeight: 1.4, fontFamily: 'var(--m-font-mono)' }}>{hint}</p>}
      </span>
    </div>
  );
}

export default function OSHabitoForm({ habito, onCerrar, onGuardado }: Props) {
  const [nombre, setNombre] = useState(habito?.nombre ?? '');
  const [tipo, setTipo] = useState<'diaria' | 'habito'>(habito?.tipo ?? 'diaria');
  const [permiteMas, setPermiteMas] = useState(habito?.permite_mas ?? true);
  const [permiteMenos, setPermiteMenos] = useState(habito?.permite_menos ?? false);
  const [dificultad, setDificultad] = useState(habito?.dificultad ?? 'facil');
  const [dias, setDias] = useState<number[]>(habito?.dias_semana ?? [1, 2, 3, 4, 5, 6, 7]);
  const [intencion, setIntencion] = useState(habito?.intencion ?? '');
  const [horaRecordatorio, setHoraRecordatorio] = useState(habito?.hora_recordatorio ?? '');
  const [esCore, setEsCore] = useState(habito?.es_core ?? false);
  const [enChecklist, setEnChecklist] = useState(habito?.en_checklist ?? true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  function toggleDia(iso: number) {
    setDias((prev) => prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso].sort((a, b) => a - b));
  }

  async function guardar() {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    setGuardando(true); setError('');
    const body: Record<string, unknown> = {
      nombre: nombre.trim(), tipo, dificultad, dias_semana: dias,
      intencion: intencion.trim() || null,
      hora_recordatorio: horaRecordatorio || null,
      es_core: esCore, en_checklist: enChecklist,
    };
    if (tipo === 'habito') { body.permite_mas = permiteMas; body.permite_menos = permiteMenos; }
    try {
      const url = habito ? `/api/os/habitos?id=${habito.id}` : '/api/os/habitos';
      const res = await fetch(url, {
        method: habito ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onGuardado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function archivar() {
    if (!habito || !confirm('¿Archivar este hábito? Puedes verlo luego en pausados/archivados.')) return;
    try {
      await fetch(`/api/os/habitos?id=${habito.id}`, { method: 'DELETE' });
      onGuardado();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al archivar'); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="m-h1" style={{ fontSize: 'clamp(1.1rem, 5vw, 1.5rem)' }}>{habito ? 'Editar hábito' : 'Nuevo hábito'}</span>
        <button style={btnGhost} onClick={onCerrar}>[ ← Volver ]</button>
      </div>

      {error && <div style={{ color: 'var(--m-accent)', fontSize: 13, fontFamily: 'var(--m-font-mono)' }}>{error}</div>}

      <div>
        <span style={label}>Nombre *</span>
        <input style={input} placeholder="Ej. Agua al despertar" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <div>
        <span style={label}>Tipo</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={pill(tipo === 'diaria')} onClick={() => setTipo('diaria')}>Diaria</button>
          <button style={pill(tipo === 'habito')} onClick={() => setTipo('habito')}>Hábito +/-</button>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--os-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>{TIPO_EXPL[tipo]}</p>
      </div>

      {tipo === 'habito' && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={permiteMas} onChange={setPermiteMas} titulo="Permite +" hint="Suma cuando lo haces bien (ej. leer, ahorrar)." />
          <Toggle checked={permiteMenos} onChange={setPermiteMenos} titulo="Permite −" hint="Registra cuando recaes (ej. fumar, procrastinar)." />
        </div>
      )}

      <div>
        <span style={label}>Dificultad</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DIFICULTADES.map((d) => (
            <button key={d.key} style={pill(dificultad === d.key)} onClick={() => setDificultad(d.key)}>{d.label}</button>
          ))}
        </div>
      </div>

      <div>
        <span style={label}>Días de la semana</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {DIAS.map((d) => (
            <button key={d.iso} style={{ ...pill(dias.includes(d.iso)), width: 38, padding: '7px 0' }} onClick={() => toggleDia(d.iso)}>{d.label}</button>
          ))}
        </div>
      </div>

      <div>
        <span style={label}>Intención (cuándo y dónde)</span>
        <input style={input} placeholder="Cuándo y dónde: ej. después del café, en el escritorio" value={intencion} onChange={(e) => setIntencion(e.target.value)} />
      </div>

      <div>
        <span style={label}>Hora de recordatorio</span>
        <input style={{ ...inputTime, maxWidth: 160 }} type="time" value={horaRecordatorio} onChange={(e) => setHoraRecordatorio(e.target.value)} />
        <p style={{ fontSize: 11, color: 'var(--os-muted)', margin: '6px 0 0' }}>Opcional. Te llega por Telegram.</p>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle checked={esCore} onChange={setEsCore} titulo="Es core" hint="Las core te harán daño si las fallas. Elige máximo 3-5." />
          <Toggle checked={enChecklist} onChange={setEnChecklist} titulo="En checklist del home" hint="Aparece en el checklist del home." />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={btn} disabled={guardando} onClick={guardar}>{guardando ? 'Guardando...' : 'Guardar hábito'}</button>
        <button style={btnGhost} onClick={onCerrar}>Cancelar</button>
        {habito && (
          <button style={{ ...btnGhost, color: 'var(--m-accent)', borderColor: 'var(--m-accent)' }} onClick={archivar}>Archivar</button>
        )}
      </div>
    </div>
  );
}
