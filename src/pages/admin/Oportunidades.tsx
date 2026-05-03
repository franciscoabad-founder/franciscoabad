import { useCallback, useEffect, useState } from 'react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { Pencil, CreditCard, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type {
  Opportunity, OpportunityPayment,
  OpportunityStatus, OpportunityType, PaymentStatus,
} from '@/lib/supabase';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Constants ────────────────────────────────────────────────────────────────

const PIPELINE_STAGES: { value: OpportunityStatus; label: string }[] = [
  { value: 'prospecting',   label: 'Prospecting' },
  { value: 'in_talks',      label: 'En conversación' },
  { value: 'proposal_sent', label: 'Propuesta enviada' },
  { value: 'negotiating',   label: 'Negociando' },
  { value: 'closed_won',    label: 'Cerrado ganado' },
  { value: 'closed_lost',   label: 'Cerrado perdido' },
];

const OPP_TYPES: { value: OpportunityType; label: string }[] = [
  { value: 'brand_deal',  label: 'Brand Deal' },
  { value: 'consulting',  label: 'Consultoría' },
  { value: 'speaking',    label: 'Speaking' },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'pending',  label: 'Pendiente' },
  { value: 'received', label: 'Recibido' },
  { value: 'overdue',  label: 'Vencido' },
];

const ACTIVE_STATUSES: OpportunityStatus[] = [
  'prospecting', 'in_talks', 'proposal_sent', 'negotiating',
];

const STATUS_BADGE_COLORS: Record<OpportunityStatus, { bg: string; text: string }> = {
  prospecting:   { bg: 'rgba(138,130,121,0.15)', text: '#8A8279' },
  in_talks:      { bg: 'rgba(90,122,154,0.2)',   text: '#5A7A9A' },
  proposal_sent: { bg: 'rgba(176,154,123,0.2)',  text: '#B09A7B' },
  negotiating:   { bg: 'rgba(155, 61, 40,0.15)',  text: '#9B3D28' },
  closed_won:    { bg: 'rgba(74,138,90,0.2)',    text: '#4A8A5A' },
  closed_lost:   { bg: 'rgba(107,107,107,0.15)', text: '#6B6B6B' },
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  pending:  '#B09A7B',
  received: '#4A8A5A',
  overdue:  '#9B3D28',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number | null, currency = 'USD'): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

function isUrgent(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = parseISO(dateStr);
  return isToday(d) || isPast(d);
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface OppForm {
  title: string; company: string; contact_name: string; contact_email: string;
  type: OpportunityType; status: OpportunityStatus;
  value: string; currency: string;
  next_action: string; next_action_date: string; notes: string;
}

const EMPTY_OPP: OppForm = {
  title: '', company: '', contact_name: '', contact_email: '',
  type: 'consulting', status: 'prospecting',
  value: '', currency: 'USD', next_action: '', next_action_date: '', notes: '',
};

interface PaymentForm {
  amount: string; currency: string; due_date: string;
  status: PaymentStatus; notes: string;
}

const EMPTY_PAYMENT: PaymentForm = {
  amount: '', currency: 'USD', due_date: '', status: 'pending', notes: '',
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputSx: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px',
  backgroundColor: '#141414', border: '1px solid #2A2A2A',
  color: '#F4EDE6', fontSize: '14px', fontFamily: 'Inter, sans-serif',
  outline: 'none', boxSizing: 'border-box',
};

const labelSx: React.CSSProperties = {
  display: 'block', marginBottom: '4px',
  fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
  fontFamily: 'Montserrat, sans-serif', color: '#8A8279',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OpportunityStatus }) {
  const { bg, text } = STATUS_BADGE_COLORS[status];
  const label = PIPELINE_STAGES.find(s => s.value === status)?.label ?? status;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      backgroundColor: bg, color: text, fontSize: '12px',
      fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: OpportunityType }) {
  const label = OPP_TYPES.find(t => t.value === type)?.label ?? type;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      backgroundColor: 'rgba(138,130,121,0.1)', color: '#8A8279',
      fontSize: '12px', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Oportunidades() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Opportunity sheet
  const [oppOpen, setOppOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [oppForm, setOppForm] = useState<OppForm>(EMPTY_OPP);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Payments sheet
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [payments, setPayments] = useState<OpportunityPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(EMPTY_PAYMENT);
  const [savingPayment, setSavingPayment] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setOpportunities(data as Opportunity[]);
    setLoading(false);
  }, []);

  const fetchPayments = useCallback(async (oppId: string) => {
    setPaymentsLoading(true);
    const { data, error } = await supabase
      .from('opportunity_payments')
      .select('*')
      .eq('opportunity_id', oppId)
      .order('created_at', { ascending: false });
    if (!error && data) setPayments(data as OpportunityPayment[]);
    setPaymentsLoading(false);
  }, []);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const pipelineStats = PIPELINE_STAGES.map(stage => {
    const opps = opportunities.filter(o => o.status === stage.value);
    return {
      ...stage,
      count: opps.length,
      total: opps.reduce((sum, o) => sum + (o.value ?? 0), 0),
    };
  });

  const activeOpps = opportunities.filter(o => ACTIVE_STATUSES.includes(o.status));

  // ── Handlers ───────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingOpp(null);
    setOppForm(EMPTY_OPP);
    setFormError('');
    setOppOpen(true);
  }

  function openEdit(opp: Opportunity) {
    setEditingOpp(opp);
    setOppForm({
      title: opp.title,
      company: opp.company ?? '',
      contact_name: opp.contact_name ?? '',
      contact_email: opp.contact_email ?? '',
      type: opp.type,
      status: opp.status,
      value: opp.value != null ? String(opp.value) : '',
      currency: opp.currency,
      next_action: opp.next_action ?? '',
      next_action_date: opp.next_action_date ?? '',
      notes: opp.notes ?? '',
    });
    setFormError('');
    setOppOpen(true);
  }

  function openPayments(opp: Opportunity) {
    setSelectedOpp(opp);
    setPayments([]);
    setShowPaymentForm(false);
    setPaymentForm(EMPTY_PAYMENT);
    setPaymentsOpen(true);
    fetchPayments(opp.id);
  }

  function setField<K extends keyof OppForm>(key: K, value: OppForm[K]) {
    setOppForm(f => ({ ...f, [key]: value }));
  }

  async function saveOpportunity() {
    if (!oppForm.title.trim()) { setFormError('El título es requerido.'); return; }
    setSaving(true);
    setFormError('');

    const payload = {
      title: oppForm.title.trim(),
      company: oppForm.company.trim() || null,
      contact_name: oppForm.contact_name.trim() || null,
      contact_email: oppForm.contact_email.trim() || null,
      type: oppForm.type,
      status: oppForm.status,
      value: oppForm.value ? parseFloat(oppForm.value) : null,
      currency: oppForm.currency || 'USD',
      next_action: oppForm.next_action.trim() || null,
      next_action_date: oppForm.next_action_date || null,
      notes: oppForm.notes.trim() || null,
    };

    const { error } = editingOpp
      ? await supabase.from('opportunities').update(payload).eq('id', editingOpp.id)
      : await supabase.from('opportunities').insert(payload);

    if (error) {
      setFormError('Error al guardar. Intenta de nuevo.');
    } else {
      setOppOpen(false);
      fetchOpportunities();
    }
    setSaving(false);
  }

  async function savePayment() {
    if (!selectedOpp || !paymentForm.amount) return;
    setSavingPayment(true);
    const { error } = await supabase.from('opportunity_payments').insert({
      opportunity_id: selectedOpp.id,
      amount: parseFloat(paymentForm.amount),
      currency: paymentForm.currency || 'USD',
      status: paymentForm.status,
      due_date: paymentForm.due_date || null,
      notes: paymentForm.notes.trim() || null,
    });
    if (!error) {
      setPaymentForm(EMPTY_PAYMENT);
      setShowPaymentForm(false);
      fetchPayments(selectedOpp.id);
    }
    setSavingPayment(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8" style={{ minHeight: '100vh', backgroundColor: '#141414' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', color: '#F4EDE6', fontSize: '22px', fontWeight: 600 }}>
          Oportunidades
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#9B3D28', color: '#F4EDE6', fontFamily: 'Inter, sans-serif' }}
        >
          <Plus size={15} />
          Nueva oportunidad
        </button>
      </div>

      {/* ── Pipeline summary ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {pipelineStats.map(stage => (
          <div
            key={stage.value}
            className="rounded-lg p-4"
            style={{
              backgroundColor: '#1E1E1E',
              border: stage.value === 'closed_won'
                ? '1px solid rgba(155, 61, 40,0.3)'
                : '1px solid #2A2A2A',
            }}
          >
            <p style={{
              fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#8A8279', fontFamily: 'Montserrat, sans-serif', marginBottom: '8px',
            }}>
              {stage.label}
            </p>
            <p style={{
              fontSize: '18px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
              color: stage.value === 'closed_won' ? '#9B3D28' : '#B09A7B',
              lineHeight: 1,
            }}>
              {fmt(stage.total)}
            </p>
            <p style={{ fontSize: '12px', color: '#6B6B6B', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
              {stage.count} {stage.count === 1 ? 'oportunidad' : 'oportunidades'}
            </p>
          </div>
        ))}
      </div>

      {/* ── Active pipeline table ──────────────────────────────────────────── */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2A2A2A', backgroundColor: '#1E1E1E' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A2A2A' }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#F4EDE6', fontSize: '14px', fontWeight: 600 }}>
            Pipeline activo
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-[#9B3D28] border-t-transparent animate-spin" />
          </div>
        ) : activeOpps.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p style={{ color: '#6B6B6B', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
              No hay oportunidades activas
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                {['Título', 'Empresa', 'Tipo', 'Status', 'Valor', 'Próxima acción', 'Fecha', ''].map((h, i) => (
                  <TableHead
                    key={i}
                    className="h-10"
                    style={{
                      color: '#8A8279', fontSize: '11px', letterSpacing: '0.08em',
                      textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
                      borderBottom: '1px solid #2A2A2A',
                    }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeOpps.map(opp => (
                <TableRow
                  key={opp.id}
                  className="border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: '1px solid #232323' }}
                >
                  <TableCell style={{ color: '#F4EDE6', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500 }}>
                    {opp.title}
                  </TableCell>
                  <TableCell style={{ color: '#B09A7B', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                    {opp.company ?? '—'}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={opp.type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={opp.status} />
                  </TableCell>
                  <TableCell style={{ color: '#B09A7B', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600 }}>
                    {fmt(opp.value, opp.currency)}
                  </TableCell>
                  <TableCell
                    style={{ color: '#8A8279', fontFamily: 'Inter, sans-serif', fontSize: '13px', maxWidth: '200px' }}
                  >
                    <span className="line-clamp-2">{opp.next_action ?? '—'}</span>
                  </TableCell>
                  <TableCell>
                    {opp.next_action_date ? (
                      <span style={{
                        color: isUrgent(opp.next_action_date) ? '#9B3D28' : '#8A8279',
                        fontFamily: 'Inter, sans-serif', fontSize: '13px',
                        fontWeight: isUrgent(opp.next_action_date) ? 600 : 400,
                        whiteSpace: 'nowrap',
                      }}>
                        {format(parseISO(opp.next_action_date), 'dd MMM yyyy')}
                      </span>
                    ) : (
                      <span style={{ color: '#6B6B6B' }}>—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(opp)}
                        className="p-1.5 rounded transition-colors hover:bg-white/10"
                        style={{ color: '#8A8279' }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => openPayments(opp)}
                        className="p-1.5 rounded transition-colors hover:bg-white/10"
                        style={{ color: '#8A8279' }}
                        title="Ver pagos"
                      >
                        <CreditCard size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Opportunity Sheet ─────────────────────────────────────────────── */}
      <Sheet open={oppOpen} onOpenChange={setOppOpen}>
        <SheetContent
          side="right"
          className="overflow-y-auto sm:max-w-[440px] bg-[#1E1E1E] border-l-[#2A2A2A]"
          style={{ borderLeft: '1px solid #2A2A2A' }}
        >
          <SheetHeader className="mb-6">
            <SheetTitle style={{ fontFamily: 'Montserrat, sans-serif', color: '#F4EDE6', fontSize: '18px' }}>
              {editingOpp ? 'Editar oportunidad' : 'Nueva oportunidad'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4">
            <div>
              <label style={labelSx}>Título *</label>
              <input
                type="text"
                value={oppForm.title}
                onChange={e => setField('title', e.target.value)}
                style={inputSx}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelSx}>Empresa</label>
                <input type="text" value={oppForm.company} onChange={e => setField('company', e.target.value)} style={inputSx} />
              </div>
              <div>
                <label style={labelSx}>Contacto</label>
                <input type="text" value={oppForm.contact_name} onChange={e => setField('contact_name', e.target.value)} style={inputSx} />
              </div>
            </div>

            <div>
              <label style={labelSx}>Email de contacto</label>
              <input type="email" value={oppForm.contact_email} onChange={e => setField('contact_email', e.target.value)} style={inputSx} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelSx}>Tipo</label>
                <Select value={oppForm.type} onValueChange={v => setField('type', v as OpportunityType)}>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-[#F4EDE6] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                    {OPP_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-[#F4EDE6] focus:bg-white/10">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label style={labelSx}>Status</label>
                <Select value={oppForm.status} onValueChange={v => setField('status', v as OpportunityStatus)}>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-[#F4EDE6] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                    {PIPELINE_STAGES.map(s => (
                      <SelectItem key={s.value} value={s.value} className="text-[#F4EDE6] focus:bg-white/10">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelSx}>Valor</label>
                <input
                  type="number" min="0" step="0.01"
                  value={oppForm.value}
                  onChange={e => setField('value', e.target.value)}
                  style={inputSx}
                />
              </div>
              <div>
                <label style={labelSx}>Moneda</label>
                <input
                  type="text" maxLength={3}
                  value={oppForm.currency}
                  onChange={e => setField('currency', e.target.value.toUpperCase())}
                  style={inputSx}
                />
              </div>
            </div>

            <div>
              <label style={labelSx}>Próxima acción</label>
              <input type="text" value={oppForm.next_action} onChange={e => setField('next_action', e.target.value)} style={inputSx} />
            </div>

            <div>
              <label style={labelSx}>Fecha próxima acción</label>
              <input
                type="date"
                value={oppForm.next_action_date}
                onChange={e => setField('next_action_date', e.target.value)}
                style={{ ...inputSx, colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label style={labelSx}>Notas</label>
              <textarea
                rows={3}
                value={oppForm.notes}
                onChange={e => setField('notes', e.target.value)}
                style={{ ...inputSx, resize: 'vertical' }}
              />
            </div>

            {formError && (
              <p style={{ color: '#E05C3A', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                {formError}
              </p>
            )}

            <button
              onClick={saveOpportunity}
              disabled={saving}
              className="w-full py-2.5 rounded-md text-sm font-semibold tracking-wide transition-opacity disabled:opacity-50 hover:opacity-80"
              style={{ backgroundColor: '#9B3D28', color: '#F4EDE6', fontFamily: 'Montserrat, sans-serif' }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Payments Sheet ────────────────────────────────────────────────── */}
      <Sheet open={paymentsOpen} onOpenChange={setPaymentsOpen}>
        <SheetContent
          side="right"
          className="overflow-y-auto sm:max-w-[400px] bg-[#1E1E1E] border-l-[#2A2A2A]"
          style={{ borderLeft: '1px solid #2A2A2A' }}
        >
          <SheetHeader className="mb-6">
            <SheetTitle style={{ fontFamily: 'Montserrat, sans-serif', color: '#F4EDE6', fontSize: '18px' }}>
              Pagos
            </SheetTitle>
            {selectedOpp && (
              <p style={{ color: '#8A8279', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                {selectedOpp.title}
              </p>
            )}
          </SheetHeader>

          {/* Existing payments list */}
          {paymentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-[#9B3D28] border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              {payments.length === 0 && (
                <p style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
                  No hay pagos registrados.
                </p>
              )}
              {payments.map(p => (
                <div
                  key={p.id}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A' }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#F4EDE6', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600 }}>
                      {fmt(p.amount, p.currency)}
                    </span>
                    <span style={{ fontSize: '12px', color: PAYMENT_COLORS[p.status], fontFamily: 'Inter, sans-serif' }}>
                      {PAYMENT_STATUSES.find(s => s.value === p.status)?.label}
                    </span>
                  </div>
                  {p.due_date && (
                    <p style={{ color: '#8A8279', fontSize: '12px', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
                      Vence: {format(parseISO(p.due_date), 'dd MMM yyyy')}
                    </p>
                  )}
                  {p.received_date && (
                    <p style={{ color: '#4A8A5A', fontSize: '12px', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                      Recibido: {format(parseISO(p.received_date), 'dd MMM yyyy')}
                    </p>
                  )}
                  {p.notes && (
                    <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                      {p.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add payment form */}
          {showPaymentForm ? (
            <div
              className="flex flex-col gap-3 rounded-lg p-4"
              style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A' }}
            >
              <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#F4EDE6', fontSize: '13px', fontWeight: 600 }}>
                Nuevo pago
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelSx}>Monto *</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                    style={inputSx}
                  />
                </div>
                <div>
                  <label style={labelSx}>Moneda</label>
                  <input
                    type="text" maxLength={3}
                    value={paymentForm.currency}
                    onChange={e => setPaymentForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
                    style={inputSx}
                  />
                </div>
              </div>

              <div>
                <label style={labelSx}>Fecha de vencimiento</label>
                <input
                  type="date"
                  value={paymentForm.due_date}
                  onChange={e => setPaymentForm(f => ({ ...f, due_date: e.target.value }))}
                  style={{ ...inputSx, colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label style={labelSx}>Status</label>
                <Select
                  value={paymentForm.status}
                  onValueChange={v => setPaymentForm(f => ({ ...f, status: v as PaymentStatus }))}
                >
                  <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-[#F4EDE6] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                    {PAYMENT_STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value} className="text-[#F4EDE6] focus:bg-white/10">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label style={labelSx}>Notas</label>
                <textarea
                  rows={2}
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ ...inputSx, resize: 'vertical' }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={savePayment}
                  disabled={savingPayment || !paymentForm.amount}
                  className="flex-1 py-2 rounded-md text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-80"
                  style={{ backgroundColor: '#9B3D28', color: '#F4EDE6', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {savingPayment ? 'Guardando...' : 'Guardar pago'}
                </button>
                <button
                  onClick={() => { setShowPaymentForm(false); setPaymentForm(EMPTY_PAYMENT); }}
                  className="px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/10"
                  style={{ color: '#8A8279', border: '1px solid #2A2A2A', fontFamily: 'Inter, sans-serif' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm transition-colors hover:bg-white/5"
              style={{ border: '1px dashed #3A3A3A', color: '#8A8279', fontFamily: 'Inter, sans-serif' }}
            >
              <Plus size={14} />
              Agregar pago
            </button>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
