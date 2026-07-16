// GFIT — objetos de estilo compartidos (clay, tokens --os-* exclusivamente).
import type { CSSProperties } from 'react';

export const card: CSSProperties = {
  background: 'var(--os-surface)', border: 'none', borderRadius: 'var(--os-r-card)',
  boxShadow: 'var(--os-shadow-card)', padding: '1rem',
};
export const card2: CSSProperties = {
  ...card, background: 'var(--os-surface-2)', boxShadow: 'none', border: '1px solid var(--os-line-soft)',
};
export const input: CSSProperties = {
  background: 'var(--os-fill-subtle)', border: '1px solid var(--os-line)', borderRadius: 'var(--os-r-sm)',
  padding: '9px 11px', fontSize: 13, color: 'var(--os-text)', fontFamily: 'var(--os-font-body)',
  outline: 'none', width: '100%', minHeight: 40,
};
export const sel: CSSProperties = { ...input };
export const btn: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: 'var(--os-accent)', color: '#fff', border: 'none', borderRadius: 'var(--os-r-sm)',
  padding: '10px 16px', minHeight: 44, fontSize: 13, fontFamily: 'var(--os-font-display)', fontWeight: 700,
  cursor: 'pointer', whiteSpace: 'nowrap',
};
export const btnGhost: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: 'var(--os-fill-subtle)', color: 'var(--os-text-2)', border: '1px solid var(--os-line)',
  borderRadius: 'var(--os-r-sm)', padding: '9px 13px', minHeight: 44, fontSize: 12.5, cursor: 'pointer',
  whiteSpace: 'nowrap',
};
export const btnIcon: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', color: 'var(--os-muted)', border: 'none', borderRadius: 'var(--os-r-sm)',
  width: 40, height: 40, cursor: 'pointer', flexShrink: 0,
};
export const pill = (activo: boolean): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  padding: '8px 16px', minHeight: 40, borderRadius: 'var(--os-r-full)',
  fontFamily: 'var(--os-font-display)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.01em',
  cursor: 'pointer', whiteSpace: 'nowrap', border: 'none', transition: 'background .15s, color .15s',
  background: activo ? 'var(--os-accent)' : 'var(--os-fill-subtle)',
  color: activo ? '#fff' : 'var(--os-text-2)',
  boxShadow: activo ? 'var(--os-shadow-accent)' : 'none',
});
export const chip: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--os-accent-light)',
  background: 'rgba(59,78,217,0.12)', padding: '3px 9px', borderRadius: 'var(--os-r-full)',
  fontFamily: 'var(--os-font-display)', fontWeight: 700, whiteSpace: 'nowrap',
};
export const eyebrow: CSSProperties = {
  fontFamily: 'var(--os-font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--os-muted)', margin: 0,
};
export const overlay: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(20,20,20,0.42)', zIndex: 300,
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
};
export const sheet: CSSProperties = {
  background: 'var(--os-surface)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
  boxShadow: 'var(--os-shadow-modal)', width: '100%', maxWidth: 560, maxHeight: '80vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};
export const sheetBody: CSSProperties = { overflowY: 'auto', padding: '0.25rem 1rem 1rem' };
export const sheetHandle: CSSProperties = {
  width: 40, height: 4, borderRadius: 999, background: 'var(--os-line)', margin: '10px auto',
};
export const thumb = (size: number): CSSProperties => ({
  width: size, height: size, borderRadius: 14, objectFit: 'cover', flexShrink: 0,
  background: 'var(--os-surface-3)', border: '1px solid var(--os-line-soft)',
});
