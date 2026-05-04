const painPoints = [
  { emoji: '⏱', text: 'Ocupado siempre pero sin resultados' },
  { emoji: '⚡', text: 'Energía dispersa mal enfocada' },
  { emoji: '🧭', text: 'Ejecución improvisada, estrategia insuficiente' },
];

const ProblemStatement = () => (
  <section className="bg-[hsl(var(--bg-primary))] py-12 md:py-20" id="problema">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      {/* Text block */}
      <div className="max-w-[800px] mx-auto text-center space-y-6" data-reveal>
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[40px] leading-[1.2]">
          El problema que nadie nombra
        </h2>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[17px] md:text-lg leading-[1.75]">
          Las personas más ambiciosas (fundadores, ejecutivos, innovadores, emprendedores, directivos) son excelentes en su trabajo y mediocres en diseñar cómo trabajan. No porque les falte disciplina. Porque nadie les enseñó a construir el sistema detrás del resultado.
        </p>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[17px] md:text-lg leading-[1.75]">
          Operar sin un sistema claro tiene un costo directo: decisiones lentas, energía dispersa, y equipos que funcionan a medias porque el diseño del trabajo es deficiente. No necesitamos más esfuerzo. Necesitamos mejor diseño.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16" data-reveal>
        {painPoints.map((point) => (
          <div
            key={point.text}
            style={{
              backgroundColor: '#1A1A1A',
              borderLeft: '3px solid #9B3D28',
              borderTop: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              borderRadius: 8,
              padding: '28px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              transition: 'border-color 200ms ease, transform 200ms ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#D97A5E';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#9B3D28';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>
              {point.emoji}
            </div>
            <p className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[16px] leading-snug">
              {point.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemStatement;
