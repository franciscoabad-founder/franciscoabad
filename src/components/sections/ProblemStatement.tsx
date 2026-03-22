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
          El problema no es disciplina.<br />El problema es un sistema roto.
        </h2>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[17px] md:text-lg leading-[1.75]">
          Las personas más ambiciosas — founders, executives, operators — son excelentes en su dominio. Pero luchan con el meta-problema: operar a sí mismas, a sus equipos y a sus organizaciones como sistemas coherentes. El resultado es caos operacional, energía dispersa y crecimiento más lento de lo que su potencial permite.
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

      {/* Transition text */}
      <p className="font-inter italic text-[hsl(var(--text-muted))] text-[16px] text-center mt-14" data-reveal>
        Hay una salida. Y no requiere más esfuerzo — requiere mejor diseño.
      </p>
    </div>
  </section>
);

export default ProblemStatement;
