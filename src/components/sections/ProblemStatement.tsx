const painPoints = [
  'Ocupado pero sin dirección clara',
  'Energía dispersa en demasiados frentes',
  'Ejecución que no sigue a la estrategia',
];

const ProblemStatement = () => (
  <section className="bg-[hsl(var(--bg-primary))] py-32" id="problema">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      {/* Text block */}
      <div className="max-w-[800px] mx-auto text-center space-y-6" data-reveal>
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[40px] leading-[1.2]">
          El problema que nadie nombra
        </h2>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[17px] md:text-lg leading-[1.75]">
          Las personas más ambiciosas (founders, executives, operators) son excelentes en su trabajo y mediocres en diseñar cómo trabajan. No porque les falte disciplina. Porque nadie les enseñó a construir el sistema detrás del resultado.
        </p>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[17px] md:text-lg leading-[1.75]">
          Operar sin un sistema claro tiene un costo directo: decisiones lentas, energía dispersa, y equipos que funcionan a medias porque el diseño del trabajo es deficiente. No requiere más esfuerzo: requiere mejor diseño.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16" data-reveal>
        {painPoints.map((point, i) => (
          <div
            key={i}
            className="bg-[hsl(var(--bg-elevated))] rounded-lg p-8 border-t-2 border-[hsl(var(--ember))]"
          >
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--ember))] mb-5" />
            <p className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[16px] leading-snug">
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemStatement;
