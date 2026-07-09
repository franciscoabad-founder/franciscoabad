import { useEffect, useState } from 'react';
import type { ApprovalItem } from '../data/types';

interface Props {
  initialApprovals: ApprovalItem[];
}

const LOCAL_KEY = 'pancho-os-approvals';

const labels: Record<string, string> = {
  approve: 'Aprobar',
  reject: 'Rechazar',
  execute: 'Ejecutar',
};

function nextStatus(action: string): ApprovalItem['estado'] {
  if (action === 'approve') return 'aprobado';
  if (action === 'reject') return 'rechazado';
  return 'ejecutado';
}

export default function OSAprobaciones({ initialApprovals }: Props) {
  const [items, setItems] = useState<ApprovalItem[]>(initialApprovals);
  const [message, setMessage] = useState('Listo.');

  useEffect(() => {
    const local = localStorage.getItem(LOCAL_KEY);
    if (local) {
      try { setItems(JSON.parse(local)); } catch { localStorage.removeItem(LOCAL_KEY); }
    }
    fetch('/api/os/aprobaciones')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.approvals)) setItems(data.approvals);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }, [items]);

  async function act(id: string, action: string) {
    setMessage(`${labels[action]}...`);
    try {
      const res = await fetch('/api/os/aprobaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || String(res.status));
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, estado: nextStatus(action) } : item));
      setMessage(data.queued ? 'Enviado a n8n.' : (data.message ?? 'Actualizado localmente.'));
    } catch (err) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, estado: nextStatus(action) } : item));
      setMessage(`Actualizado local. Pendiente remoto: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const pendientes = items.filter((item) => item.estado === 'pendiente').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="os-kpi-grid">
        <div className="os-kpi">
          <p className="os-kpi-label">Pendientes</p>
          <p className="os-kpi-value">{pendientes}</p>
          <span style={{ fontSize: 10, color: '#6B7280' }}>Requieren decision</span>
        </div>
        <div className="os-kpi">
          <p className="os-kpi-label">Total</p>
          <p className="os-kpi-value">{items.length}</p>
          <span style={{ fontSize: 10, color: '#6B7280' }}>En bandeja</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => (
          <div key={item.id} className="os-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                <span className="os-eyebrow">{item.tipo}</span>
                <span className="os-tag">{item.estado}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--os-font-display)', fontSize: 15, color: '#E8EAF0', margin: '0 0 5px' }}>{item.titulo}</h2>
              <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{item.descripcion}</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="os-btn" type="button" disabled={item.estado !== 'pendiente'} onClick={() => act(item.id, 'approve')}>Aprobar</button>
              <button className="os-btn os-btn-ghost" type="button" disabled={item.estado !== 'pendiente'} onClick={() => act(item.id, 'execute')}>Ejecutar</button>
              <button className="os-btn os-btn-ghost" type="button" disabled={item.estado !== 'pendiente'} onClick={() => act(item.id, 'reject')}>Rechazar</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: '#6B7280', fontSize: 12, margin: 0 }}>{message}</p>
    </div>
  );
}
