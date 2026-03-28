import { useEffect, useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { MorningBriefing, CalBooking } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsData {
  reach: number | null;
  newFollowers: number | null;
  pipelineCount: number | null;
  pipelineValue: number | null;
  nextBooking: CalBooking | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number | null): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(n);
}

function fmtUSD(n: number | null): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function fmtBookingDate(isoStr: string): string {
  return format(parseISO(isoStr), "EEE d MMM '·' h:mm a");
}

// ─── Briefing parser ──────────────────────────────────────────────────────────

const BRIEFING_SECTIONS = ['ONE PRIORITY', 'PULSE', 'CONTENT', 'BUSINESS', 'CALENDAR'];

function parseBriefing(raw: string): Array<{ label: string; body: string }> {
  const lines = raw.split('\n');
  const result: Array<{ label: string; body: string[] }> = [];
  let current: { label: string; body: string[] } | null = null;

  for (const line of lines) {
    // Strip markdown decorators and normalize
    const cleaned = line
      .trim()
      .replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/^_+|_+$/g, '')
      .replace(/:$/, '')
      .toUpperCase()
      .trim();

    const matched = BRIEFING_SECTIONS.find(
      s => cleaned === s || cleaned.startsWith(s + ':') || cleaned.startsWith(s + ' ')
    );

    if (matched) {
      if (current) result.push({ label: current.label, body: current.body });
      current = { label: matched, body: [] };
      // Capture any text on the same line after the header
      const rest = line
        .trim()
        .replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(new RegExp(matched, 'i'), '')
        .replace(/^[:\s]+/, '')
        .trim();
      if (rest) current.body.push(rest);
    } else if (current) {
      current.body.push(line);
    }
  }

  if (current) result.push({ label: current.label, body: current.body });

  return result.length > 0
    ? result.map(s => ({ label: s.label, body: s.body.join('\n').trim() }))
    : [{ label: '', body: raw }];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, subValue, loading,
}: {
  label: string;
  value: string;
  subValue?: string;
  loading: boolean;
}) {
  return (
    <div
      className="rounded-lg p-5"
      style={{
        backgroundColor: '#1E1E1E',
        border: '1px solid #2A2A2A',
        borderTop: '2px solid #C2654A',
      }}
    >
      <p style={{
        fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
        fontFamily: 'Montserrat, sans-serif', color: '#8A8279', marginBottom: '10px',
      }}>
        {label}
      </p>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-28 bg-[#2A2A2A]" />
          {subValue !== undefined && <Skeleton className="h-4 w-20 bg-[#2A2A2A]" />}
        </div>
      ) : (
        <>
          <p style={{
            fontSize: '2rem', fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
            color: '#C2654A', lineHeight: 1.1,
          }}>
            {value}
          </p>
          {subValue && (
            <p style={{ fontSize: '13px', color: '#8A8279', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
              {subValue}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Briefing Block ───────────────────────────────────────────────────────────

function BriefingContent({ content }: { content: string }) {
  const sections = parseBriefing(content);
  return (
    <div className="flex flex-col gap-5">
      {sections.map((s, i) => (
        <div key={i}>
          {s.label && (
            <p style={{
              fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
              fontFamily: 'Montserrat, sans-serif', color: '#C2654A', fontWeight: 600,
              marginBottom: '6px',
            }}>
              {s.label}
            </p>
          )}
          <p style={{
            color: '#F4EDE6', fontFamily: 'Inter, sans-serif', fontSize: '14px',
            lineHeight: 1.7, whiteSpace: 'pre-wrap',
          }}>
            {s.body}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Overview() {
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [lastBriefing, setLastBriefing] = useState<MorningBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [showLastBriefing, setShowLastBriefing] = useState(false);

  const [stats, setStats] = useState<StatsData>({
    reach: null, newFollowers: null,
    pipelineCount: null, pipelineValue: null,
    nextBooking: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // ── Fetch briefing ────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadBriefing() {
      setBriefingLoading(true);

      const [todayRes, lastRes] = await Promise.allSettled([
        supabase.from('morning_briefings').select('*').eq('date', today).maybeSingle(),
        supabase.from('morning_briefings').select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
      ]);

      if (todayRes.status === 'fulfilled' && todayRes.value.data) {
        setBriefing(todayRes.value.data as MorningBriefing);
      }

      if (lastRes.status === 'fulfilled' && lastRes.value.data) {
        const last = lastRes.value.data as MorningBriefing;
        if (last.date !== today) setLastBriefing(last);
      }

      setBriefingLoading(false);
    }

    loadBriefing();
  }, [today]);

  // ── Fetch stats ───────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);

      const [igRes, liRes, ytRes, pipelineRes, calRes] = await Promise.allSettled([
        supabase.from('ig_daily_metrics').select('reach, new_followers').eq('date', yesterday),
        supabase.from('li_daily_metrics').select('post_impressions').eq('date', yesterday).maybeSingle(),
        supabase.from('yt_daily_metrics').select('new_subscribers').eq('date', yesterday).maybeSingle(),
        supabase.from('opportunities').select('value, status').not('status', 'in', '("closed_won","closed_lost")'),
        supabase.from('cal_bookings')
          .select('*')
          .gt('starts_at', new Date().toISOString())
          .eq('status', 'accepted')
          .order('starts_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      // Reach: sum of ig reach + li impressions
      let igReach = 0;
      let igNewFollowers = 0;
      if (igRes.status === 'fulfilled' && igRes.value.data) {
        for (const row of igRes.value.data) {
          igReach += row.reach ?? 0;
          igNewFollowers += row.new_followers ?? 0;
        }
      }

      let liImpressions = 0;
      if (liRes.status === 'fulfilled' && liRes.value.data) {
        liImpressions = (liRes.value.data as { post_impressions: number }).post_impressions ?? 0;
      }

      let ytNewSubs = 0;
      if (ytRes.status === 'fulfilled' && ytRes.value.data) {
        ytNewSubs = (ytRes.value.data as { new_subscribers: number }).new_subscribers ?? 0;
      }

      let pipelineCount = null;
      let pipelineValue = null;
      if (pipelineRes.status === 'fulfilled' && pipelineRes.value.data) {
        const rows = pipelineRes.value.data as { value: number | null }[];
        pipelineCount = rows.length;
        pipelineValue = rows.reduce((sum, r) => sum + (r.value ?? 0), 0);
      }

      let nextBooking: CalBooking | null = null;
      if (calRes.status === 'fulfilled' && calRes.value.data) {
        nextBooking = calRes.value.data as CalBooking;
      }

      setStats({
        reach: igReach + liImpressions,
        newFollowers: igNewFollowers + ytNewSubs,
        pipelineCount,
        pipelineValue,
        nextBooking,
      });

      setStatsLoading(false);
    }

    loadStats();
  }, [yesterday]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8" style={{ minHeight: '100vh', backgroundColor: '#141414' }}>

      {/* ── Morning Briefing ──────────────────────────────────────────────── */}
      <div
        className="rounded-lg p-6 mb-6"
        style={{ backgroundColor: '#1E1E1E', border: '1px solid #2A2A2A' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{
              fontFamily: 'Montserrat, sans-serif', color: '#F4EDE6',
              fontSize: '15px', fontWeight: 600,
            }}>
              Morning Briefing
            </p>
            <p style={{ fontSize: '12px', color: '#6B6B6B', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
              {format(new Date(), 'EEEE d MMMM, yyyy')}
            </p>
          </div>
        </div>

        {briefingLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-[#2A2A2A]" />
            <Skeleton className="h-4 w-4/5 bg-[#2A2A2A]" />
            <Skeleton className="h-4 w-3/4 bg-[#2A2A2A]" />
            <Skeleton className="h-4 w-5/6 bg-[#2A2A2A]" />
          </div>
        ) : briefing ? (
          <BriefingContent content={briefing.content} />
        ) : (
          <div>
            <p style={{ color: '#8A8279', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
              El briefing de hoy se genera a las 7:00 AM.
            </p>

            {lastBriefing && (
              <div className="mt-4">
                <button
                  onClick={() => setShowLastBriefing(v => !v)}
                  className="flex items-center gap-1.5 text-sm transition-colors hover:text-[#B09A7B]"
                  style={{ color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}
                >
                  {showLastBriefing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Último briefing ({format(parseISO(lastBriefing.date), 'dd MMM yyyy')})
                </button>
                {showLastBriefing && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
                    <BriefingContent content={lastBriefing.content} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Reach total ayer"
          value={fmtNum(stats.reach)}
          loading={statsLoading}
        />

        <StatCard
          label="Nuevos seguidores"
          value={fmtNum(stats.newFollowers)}
          loading={statsLoading}
        />

        <StatCard
          label="Pipeline activo"
          value={stats.pipelineCount !== null ? String(stats.pipelineCount) : '—'}
          subValue={stats.pipelineValue !== null ? `${fmtUSD(stats.pipelineValue)} USD` : undefined}
          loading={statsLoading}
        />

        <StatCard
          label="Próxima sesión"
          value={
            stats.nextBooking
              ? stats.nextBooking.attendee_name
              : statsLoading ? '' : 'Sin sesiones próximas'
          }
          subValue={
            stats.nextBooking
              ? fmtBookingDate(stats.nextBooking.starts_at)
              : undefined
          }
          loading={statsLoading}
        />
      </div>
    </div>
  );
}
