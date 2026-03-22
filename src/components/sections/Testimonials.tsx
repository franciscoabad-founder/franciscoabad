const testimonials = [
  {
    name: 'María González',
    title: 'Directora de Operaciones, Empresa Nacional',
    quote: 'Transformó completamente nuestra forma de operar. En 6 meses pasamos del caos a tener un sistema que funciona solo.',
  },
  {
    name: 'Carlos Mendoza',
    title: 'Founder, Tech Startup',
    quote: 'La claridad que me dio en una sola sesión de advisory me ahorró meses de trabajo mal dirigido.',
  },
  {
    name: 'Ana Lucía Torres',
    title: 'Coordinadora, Organismo Internacional',
    quote: 'Francisco no solo entiende sistemas — los construye. Su trabajo con nuestro equipo fue transformador.',
  },
];

const Testimonials = () => (
  <section className="bg-[hsl(var(--bg-primary))] py-32">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[36px] text-center mb-16" data-reveal>
        Lo que dicen quienes han trabajado conmigo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            className="bg-[hsl(var(--bg-elevated))] rounded-lg p-8 border border-[hsl(var(--border-subtle))] flex flex-col"
            data-reveal
            data-reveal-delay={String(i + 1)}
          >
            {/* Decorative quote mark */}
            <span className="font-montserrat text-[hsl(var(--ember))] text-[64px] leading-[0.8] mb-4 select-none">
              "
            </span>

            <p className="font-inter italic text-[hsl(var(--text-secondary))] text-[15px] leading-relaxed flex-1 mb-8">
              {t.quote}
            </p>

            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--border-subtle))] flex-shrink-0" />
              <div>
                <p className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[15px]">
                  {t.name}
                </p>
                <p className="font-inter text-[hsl(var(--text-muted))] text-[12px] mt-0.5">
                  {t.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
