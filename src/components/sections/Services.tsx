const services = [
  {
    eyebrow: 'Empieza aquí',
    title: 'Productos Digitales',
    description: 'Herramientas y sistemas que puedes aplicar desde hoy.',
    items: [
      '90-Day Reset System · $37',
      'Purpose & Serendipity OS · $47',
      'Network Strategy Dashboard · $67',
      'Founder Execution Dashboard · $97',
    ],
    cta: 'Ver todos los productos →',
    href: '#productos',
  },
  {
    eyebrow: 'Para founders y executives',
    title: 'Advisory & Consultoría',
    description: 'Acompañamiento estratégico 1:1 para líderes que quieren operar con más claridad y mejores resultados.',
    items: [
      'Diagnóstico Estratégico',
      'Sesiones de advisory ejecutivo',
      'Growth Partner trimestral',
    ],
    cta: 'Aplicar a una sesión →',
    href: '#advisory',
  },
  {
    eyebrow: 'Para empresas y eventos',
    title: 'Speaking & Talleres',
    description: 'Keynotes y workshops sobre systems thinking, transformación institucional, liderazgo y ejecución.',
    items: [
      'Keynotes para conferencias',
      'Workshops para equipos directivos',
      'Programas corporativos',
    ],
    cta: 'Cotizar una charla →',
    href: '#speaking',
  },
];

const Services = () => (
  <section id="servicios" className="bg-[hsl(var(--bg-primary))] py-32">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[36px] text-center mb-16" data-reveal>
        ¿En qué puedo ayudarte?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <div
            key={s.title}
            className="bg-[hsl(var(--bg-elevated))] rounded-lg p-10 border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--ember))] transition-colors duration-300 flex flex-col"
            data-reveal
            data-reveal-delay={String(i + 1)}
          >
            <p className="font-montserrat text-[11px] uppercase tracking-[1.5px] text-[hsl(var(--ember))] mb-3">
              {s.eyebrow}
            </p>
            <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[22px] mb-3">
              {s.title}
            </h3>
            <p className="font-inter text-[hsl(var(--text-secondary))] text-[15px] leading-relaxed mb-6">
              {s.description}
            </p>
            <ul className="space-y-2 mb-8 flex-1">
              {s.items.map((item) => (
                <li key={item} className="font-inter text-[hsl(var(--text-muted))] text-[13px] flex items-start gap-2">
                  <span className="text-[hsl(var(--ember))] mt-[2px] flex-shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={s.href}
              className="font-inter font-medium text-[hsl(var(--ember))] text-[14px] hover:underline mt-auto"
            >
              {s.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;
