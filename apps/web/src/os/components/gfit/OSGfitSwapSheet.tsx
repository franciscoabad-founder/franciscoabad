import { useEffect, useState } from 'react';
import type { Ejercicio } from './tipos';
import { nombreEjercicio, chipsGrupo } from './tipos';
import { overlay, sheet, sheetBody, sheetHandle, thumb, chip } from './estilos';

interface Props {
  ejercicioActualId: string;
  onCerrar: () => void;
  onElegir: (ejercicio: Ejercicio) => void;
}

// Bottom sheet de swap: alternativas del mismo patrón/grupo muscular (?alternativas=id).
export default function OSGfitSwapSheet({ ejercicioActualId, onCerrar, onElegir }: Props) {
  const [alternativas, setAlternativas] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    fetch(`/api/os/gfit/catalogo?alternativas=${ejercicioActualId}`)
      .then((r) => r.json())
      .then((d) => { if (vivo) setAlternativas(d.alternativas ?? []); })
      .finally(() => { if (vivo) setLoading(false); });
    return () => { vivo = false; };
  }, [ejercicioActualId]);

  return (
    <div style={overlay} onClick={onCerrar}>
      <div style={sheet} onClick={(e) => e.stopPropagation()}>
        <div style={sheetHandle} />
        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--os-text)', margin: 0 }}>Cambiar ejercicio</p>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', color: 'var(--os-muted)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div style={sheetBody}>
          {loading && <p style={{ fontSize: 12, color: 'var(--os-muted)' }}>Buscando alternativas...</p>}
          {!loading && !alternativas.length && <p style={{ fontSize: 12, color: 'var(--os-muted)' }}>Sin alternativas para este ejercicio.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alternativas.map((alt) => (
              <button
                key={alt.id}
                onClick={() => onElegir(alt)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', width: '100%',
                  background: 'var(--os-surface-2)', border: '1px solid var(--os-line-soft)', borderRadius: 14,
                  padding: '8px 10px', cursor: 'pointer', minHeight: 56,
                }}
              >
                {alt.imagenes?.[0]
                  ? <img src={alt.imagenes[0]} alt="" loading="lazy" style={{ ...thumb(44), borderRadius: 999 }} />
                  : <div style={{ ...thumb(44), borderRadius: 999 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--os-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nombreEjercicio(alt)}
                  </p>
                  <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                    {chipsGrupo(alt).slice(0, 2).map((g) => <span key={g} style={chip}>{g}</span>)}
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--os-accent-light)', flexShrink: 0 }}>swap_horiz</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
