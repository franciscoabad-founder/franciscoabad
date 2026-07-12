import { useEffect, useState } from 'react';

interface Answers {
  foco_90_dias: string;
  objetivos: string;
  proyectos_activos: string;
  ritmo_revision: string;
}

const EMPTY: Answers = {
  foco_90_dias: '',
  objetivos: '',
  proyectos_activos: '',
  ritmo_revision: '',
};

const STEPS = [
  {
    key: 'intro',
    titulo: 'Como funciona el sistema',
    cuerpo: (
      <>
        <p style={{ margin: '0 0 10px', color: 'var(--os-text-2)', fontSize: 14, lineHeight: 1.6 }}>
          Cuatro tipos de registro, cuatro momentos distintos:
        </p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li style={{ display: 'flex', gap: 10 }}>
            <span className="os-pill os-pill-accent">Nota</span>
            <span style={{ fontSize: 13, color: 'var(--os-text-2)', lineHeight: 1.5 }}>Un pensamiento capturado sin procesar. No compromete a nada todavia.</span>
          </li>
          <li style={{ display: 'flex', gap: 10 }}>
            <span className="os-pill os-pill-accent">Pendiente</span>
            <span style={{ fontSize: 13, color: 'var(--os-text-2)', lineHeight: 1.5 }}>Una intencion clara, sin fecha comprometida todavia.</span>
          </li>
          <li style={{ display: 'flex', gap: 10 }}>
            <span className="os-pill os-pill-accent">Tarea</span>
            <span style={{ fontSize: 13, color: 'var(--os-text-2)', lineHeight: 1.5 }}>Operativa: tiene proyecto, prioridad y a veces deadline. Vive en el war room.</span>
          </li>
          <li style={{ display: 'flex', gap: 10 }}>
            <span className="os-pill os-pill-accent">Recordatorio</span>
            <span style={{ fontSize: 13, color: 'var(--os-text-2)', lineHeight: 1.5 }}>Un aviso con fecha que Hermes empuja al celular. No es trabajo, es memoria.</span>
          </li>
        </ul>
        <p style={{ margin: '14px 0 0', color: 'var(--os-muted)', fontSize: 12, lineHeight: 1.5 }}>
          Una nota se puede convertir en pendiente, tarea o recordatorio cuando decides que hacer con ella.
        </p>
      </>
    ),
  },
  { key: 'foco_90_dias', titulo: 'Foco de 90 dias', pregunta: 'En una frase: en que te vas a enfocar los proximos 90 dias?' },
  { key: 'objetivos', titulo: 'Tres objetivos', pregunta: 'Los 3 objetivos que definen si estos 90 dias fueron un exito.' },
  { key: 'proyectos_activos', titulo: 'Proyectos activos', pregunta: 'Que proyectos tienes activos ahora mismo?' },
  { key: 'ritmo_revision', titulo: 'Ritmo de revision', pregunta: 'Con que frecuencia quieres revisar este sistema? (diario, semanal, etc.)' },
] as const;

export default function OSOnboarding() {
  const [visible, setVisible] = useState(false);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Answers>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch('/api/os/system');
        const data = await res.json();
        if (!cancelled && data.onboarding_completed === false) {
          setVisible(true);
          if (data.onboarding_answers && typeof data.onboarding_answers === 'object') {
            setRespuestas((prev) => ({ ...prev, ...data.onboarding_answers }));
          }
        }
      } catch {
        // Si falla la carga, no forzamos el wizard.
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  if (!visible) return null;

  const total = STEPS.length;
  const step = STEPS[paso];
  const esUltimo = paso === total - 1;
  const progreso = Math.round(((paso + 1) / total) * 100);

  function actualizar(key: keyof Answers, value: string) {
    setRespuestas((prev) => ({ ...prev, [key]: value }));
  }

  function saltar() {
    setVisible(false);
  }

  async function siguiente() {
    if (!esUltimo) {
      setPaso((p) => p + 1);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/os/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_completed: true, onboarding_answers: respuestas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  function anterior() {
    if (paso > 0) setPaso((p) => p - 1);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(6,12,30,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="os-card" style={{ width: '100%', maxWidth: 560, boxShadow: 'var(--os-shadow-modal)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p className="os-eyebrow" style={{ margin: 0 }}>Onboarding del sistema · {paso + 1} de {total}</p>
            <button onClick={saltar} style={{ background: 'none', border: 'none', color: 'var(--os-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--os-font-display)', letterSpacing: '0.04em' }}>
              Saltar por ahora
            </button>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: 'rgba(232,234,240,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progreso}%`, background: 'var(--os-accent)', transition: 'width 0.25s ease' }} />
          </div>
        </div>

        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: 'var(--os-text)', fontFamily: 'var(--os-font-display)' }}>{step.titulo}</h2>

        {'cuerpo' in step ? (
          step.cuerpo
        ) : (
          <div>
            <p style={{ margin: '0 0 10px', color: 'var(--os-text-2)', fontSize: 13, lineHeight: 1.5 }}>{step.pregunta}</p>
            <textarea
              className="os-input"
              rows={3}
              autoFocus
              value={respuestas[step.key as keyof Answers]}
              onChange={(e) => actualizar(step.key as keyof Answers, e.target.value)}
              style={{ width: '100%', fontSize: 13 }}
            />
          </div>
        )}

        {error && <p style={{ color: 'var(--os-error)', fontSize: 12, margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="os-btn os-btn-ghost"
            onClick={anterior}
            disabled={paso === 0}
            style={{ visibility: paso === 0 ? 'hidden' : 'visible' }}
          >
            Atras
          </button>
          <button className="os-btn" onClick={siguiente} disabled={saving}>
            {saving ? 'Guardando...' : esUltimo ? 'Completar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
