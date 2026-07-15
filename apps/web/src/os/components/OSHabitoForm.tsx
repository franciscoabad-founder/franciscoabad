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

const card: React.CSSProperties = {
  background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)',
  borderRadius: 'var(--os-r-card)', padding: '1rem',
};
const input: React.CSSProperties = {
  background: 'rgba(232,234,240,0.05)', border: '1px solid var(--os-line)',
  borderRadius: 6, padding: '9px 11px', fontSize: 14, color: 'var(--os-text)',
  fontFamily: 'var(--os-font-body)', outline: 'none', width: '100%',
};
const inputTime: React.CSSProperties = { ...input, colorScheme: 'dark' };
const btn: React.CSSProperties = {
  background: 'var(--os-accent)', color: '#fff', border: 'none', borderRadius: 6,
  padding: '10px 18px', fontSize: 14, fontFamily: 'var(--os-font-display)', fontWeight: 700, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: 'var(--os-muted)', border: '1px solid var(--os-line)',
  borderRadius: 6, padding: '9px 16px', fontSize: 13, cursor: 'pointer',
};
const label: React.CSSProperties = {
  fontFamily: 'var(--os-font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--os-muted)', marginBottom: 6, display: 'block',
};
function pill(activo: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontFamily: 'var(--os-font-display)', fontWeight: 700,
    cursor: 'pointer', border: activo ? '1px solid var(--os-accent)' : '1px solid var(--os-line)',
    background: activo ? 'var(--os-accent)' : 'rgba(232,234,240,0.04)',
    color: activo ? '#fff' : 'var(--os-muted)', transition: 'background .14s, color .14s, border-color .14s',
  };
}

function Toggle({ checked, onChange, titulo, hint }: { checked: boolean; onChange: (v: boolean) => void; titulo: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }} onClick={() => onChange(!checked)}>
      <span style={{
        width: 40, height: 23, borderRadius: 999, flexShrink: 0, marginTop: 1, position: 'relative',
        background: checked ? 'var(--os-accent)' : 'rgba(232,234,240,0.14)', transition: 'background .15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? 19 : 2, width: 19, height: 19, borderRadius: '50%',
          background: '#fff', transition: 'left .15s',
        }} />
      </span>
      <span>
        <span style={{ fontSize: 13, color: 'var(--os-text)', fontWeight: 600 }}>{titulo}</span>
        {hint && <p style={{ fontSize: 11, color: 'var(--os-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>{hint}</p>}
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
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--os-text)' }}>{habito ? 'Editar hábito' : 'Nuevo hábito'}</span>
        <button style={btnGhost} onClick={onCerrar}>← Volver</button>
      </div>

      {error && <div style={{ color: 'var(--os-error)', fontSize: 13 }}>{error}</div>}

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
          <button style={{ ...btnGhost, color: 'var(--os-error)', borderColor: 'rgba(248,113,113,0.4)' }} onClick={archivar}>Archivar</button>
        )}
      </div>
    </div>
  );
}
