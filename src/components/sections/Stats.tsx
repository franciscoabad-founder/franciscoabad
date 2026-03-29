import { useRef, useState, useEffect } from 'react';
import useCountUp from '@/hooks/useCountUp';

const stats = [
  { value: 10, suffix: 'B+', prefix: '$', label: 'Fondos administrados liderados' },
  { value: 32000, suffix: '', prefix: '', label: 'Personas bajo liderazgo directo e indirecto' },
  { value: 15, suffix: '', prefix: '', label: 'Países con presencia de programas' },
  { value: 12000, suffix: '+', prefix: '', label: 'Emprendedores impactados directamente' },
];

const StatItem = ({
  value, suffix, prefix, label, start,
}: {
  value: number; suffix: string; prefix: string; label: string; start: boolean;
}) => {
  const count = useCountUp(value, 2000, start);
  const display = count >= 1000 ? count.toLocaleString() : count;

  return (
    <div className="text-center space-y-2">
      <p className="font-montserrat font-bold text-[hsl(var(--ember))] text-[clamp(2rem,8vw,4rem)] md:text-[64px] leading-none tabular-nums">
        {prefix}{display}{suffix}
      </p>
      <p className="font-inter text-[hsl(var(--text-secondary))] text-[13px] leading-snug max-w-[180px] mx-auto">
        {label}
      </p>
    </div>
  );
};

const Stats = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[hsl(var(--bg-elevated))] py-12 md:py-20" data-reveal>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} start={started} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
