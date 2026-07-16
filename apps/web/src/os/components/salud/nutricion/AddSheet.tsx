// Bottom sheet de captura estilo Yazio: tiles de icono (Buscar/Recetas/Meals/Mas,
// Foto y Barcode deshabilitados con chip "proximamente") + el contenido del tab activo.
import { useState } from 'react';
import type { Comida, Momento, TabAgregar } from './tipos';
import { MOMENTOS, MOMENTO_LABEL } from './tipos';
import { overlay, sheet, sheetBody, sheetHandle, sel, tile, tileActivo, chipMuted } from './estilos';
import TabBuscar from './TabBuscar';
import TabRecetas from './TabRecetas';
import TabMeals from './TabMeals';
import TabMas from './TabMas';

interface Props {
  momentoInicial: Momento;
  dia: string;
  tipoDia: string;
  comidasHoy: Comida[];
  onCerrar: () => void;
  onAgregado: () => void;
}

const TILES: { key: TabAgregar; icon: string; label: string }[] = [
  { key: 'buscar', icon: 'search', label: 'Buscar' },
  { key: 'recetas', icon: 'menu_book', label: 'Recetas' },
  { key: 'meals', icon: 'dining', label: 'Meals' },
  { key: 'mas', icon: 'more_horiz', label: 'Mas' },
];

export default function AddSheet({ momentoInicial, dia, tipoDia, comidasHoy, onCerrar, onAgregado }: Props) {
  const [tab, setTab] = useState<TabAgregar>('buscar');
  const [momento, setMomento] = useState<Momento>(momentoInicial);

  function agregado() {
    onAgregado();
    onCerrar();
  }

  return (
    <div style={overlay} onClick={onCerrar}>
      <div style={sheet} onClick={(e) => e.stopPropagation()}>
        <div style={sheetHandle} />
        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <select style={{ ...sel, width: 'auto' }} value={momento} onChange={(e) => setMomento(e.target.value as Momento)}>
            {MOMENTOS.map((m) => <option key={m} value={m}>{MOMENTO_LABEL[m]}</option>)}
          </select>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', color: 'var(--os-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '0 1rem 0.75rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {TILES.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ ...tile(false), ...(tab === t.key ? tileActivo : {}) }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: tab === t.key ? 'var(--os-accent-light)' : 'var(--os-text-2)' }}>{t.icon}</span>
              <span style={{ fontSize: 9.5, color: tab === t.key ? 'var(--os-accent-light)' : 'var(--os-muted)', fontWeight: 700 }}>{t.label}</span>
            </button>
          ))}
          <div style={tile(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--os-muted)' }}>photo_camera</span>
            <span style={{ fontSize: 9.5, color: 'var(--os-muted)', fontWeight: 700 }}>Foto</span>
            <span style={{ ...chipMuted, position: 'absolute', top: -6, right: -6, fontSize: 8, padding: '2px 5px' }}>pronto</span>
          </div>
          <div style={tile(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--os-muted)' }}>qr_code_scanner</span>
            <span style={{ fontSize: 9.5, color: 'var(--os-muted)', fontWeight: 700 }}>Codigo</span>
            <span style={{ ...chipMuted, position: 'absolute', top: -6, right: -6, fontSize: 8, padding: '2px 5px' }}>pronto</span>
          </div>
        </div>

        <div style={sheetBody}>
          {tab === 'buscar' && <TabBuscar momento={momento} dia={dia} tipoDia={tipoDia} onAgregado={agregado} />}
          {tab === 'recetas' && <TabRecetas momento={momento} dia={dia} tipoDia={tipoDia} onAgregado={agregado} />}
          {tab === 'meals' && <TabMeals momento={momento} dia={dia} onAgregado={agregado} />}
          {tab === 'mas' && <TabMas momento={momento} dia={dia} tipoDia={tipoDia} comidasHoy={comidasHoy} onAgregado={agregado} />}
        </div>
      </div>
    </div>
  );
}
