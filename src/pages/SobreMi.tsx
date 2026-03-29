import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';

const values = [
  {
    label: 'Claridad sobre complejidad',
    desc: 'Los sistemas simples y claros superan siempre a los complejos. Si no puedes explicarlo en una oración, no está listo.',
  },
  {
    label: 'Experiencia sobre teoría',
    desc: 'Construyo desde lo que he vivido, no desde lo que he leído. La experiencia deja marcas que la teoría no puede replicar.',
  },
  {
    label: 'Sistemas sobre hacks',
    desc: 'Los hacks resuelven el problema de hoy. Los sistemas previenen el problema de mañana.',
  },
  {
    label: 'Franqueza con calidez',
    desc: 'La verdad dicha con respeto es el regalo más valioso que puedes darle a alguien.',
  },
  {
    label: 'Construcción visible',
    desc: 'Construir en público acelera el aprendizaje y construye confianza real.',
  },
];

const timeline = [
  {
    period: '2026 · Presente',
    event: 'Fulcra (CEO) · Kronek (Partner) · CODEIS (Presidente del Directorio)',
    detail:
      'Construcción simultánea de tres vehículos: Fulcra (workertech), Kronek (consultoría de crecimiento y revenue), y CODEIS en transición a empresa social sostenible.',
  },
  {
    period: 'Jun 2025 · Dic 2025',
    event: 'Director General, IESS',
    detail:
      'Máxima autoridad de la institución pública más grande del Ecuador. $10 billones en fondos gestionados, 32.000 colaboradores, 13 millones de beneficiarios. Ejecución presupuestaria: 36% a 78% en seis meses.',
  },
  {
    period: '2022',
    event: 'Young Leader of the Americas Initiative Fellow',
    detail:
      'Programa de liderazgo del Departamento de Estado de Estados Unidos.',
  },
  {
    period: 'Sep 2016 · Abr 2025',
    event: 'Fundador y Director Ejecutivo, CODEIS',
    detail:
      'Construí desde cero una organización de innovación social en 15 países. 12.000 emprendedores, alianzas con BID Lab, USAID, GIZ, Banco Mundial, Georgetown.',
  },
  {
    period: 'Ene 2019 · Abr 2019',
    event: 'Global Competitiveness Leadership Program, Georgetown University',
    detail:
      'Beca completa. Top 10 proyectos del programa.',
  },
  {
    period: 'Sep 2014 · Jul 2016',
    event: 'MPA Desarrollo Internacional, London School of Economics',
    detail:
      'Mérito académico. Fundador de la Sociedad de Innovación Social en LSE.',
  },
  {
    period: '2012',
    event: 'Graduación, East Texas Baptist University',
    detail:
      'Double major Political Science + International Studies. Minor en Liderazgo. Summa Cum Laude, 3.87/4.0, Distinción en Ciencias Políticas. Primer latino en presidir el Student Government Association. Top 5 Speakers en el Torneo de Debate Nacional. Starting Block Fellow.',
  },
  {
    period: '2007',
    event: 'Youth Ambassador Ecuador',
    detail:
      'Programa de intercambio del Departamento de Estado de Estados Unidos.',
  },
];

const SobreMi = () => (
  <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
    <Navbar />

    {/* Photo + Bio */}
    <section className="pt-32 pb-16">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <img
            src="/francisco-abad.png"
            alt="Francisco Abad, Founder, Operator, Strategist"
            className="w-full max-w-[480px] aspect-[3/4] object-cover rounded-lg shadow-2xl"
          />

          <div className="space-y-8 pt-4">
            <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[44px]">
              Mi historia
            </h1>
            <div className="space-y-4 font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed">
              <p>
                Fundé{' '}
                <strong className="text-[hsl(var(--text-primary))]">CODEIS</strong> hace 9 años
                con una convicción: la tecnología bien aplicada puede transformar cualquier
                organización, no solo las grandes corporaciones.
              </p>
              <p>
                Esa convicción me llevó a liderar el{' '}
                <strong className="text-[hsl(var(--text-primary))]">IESS</strong>{' '}
                (la institución pública más grande del Ecuador), gestionando más de{' '}
                <strong className="text-[hsl(var(--text-primary))]">$10 billones en activos</strong>{' '}
                y un equipo de{' '}
                <strong className="text-[hsl(var(--text-primary))]">32,000 personas</strong>.
              </p>
              <p>
                A lo largo de mi carrera he construido iniciativas en{' '}
                <strong className="text-[hsl(var(--text-primary))]">15 países</strong>, en
                sectores tan distintos como fintech, educación, salud pública y consultoría
                estratégica.
              </p>
              <p>
                Hoy diseño sistemas para que founders, executives y organizaciones operen con más
                claridad, ejecución y resultados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Lo que creo — full width, 2-column grid */}
    <section className="py-16 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[28px] mb-10">
          Lo que creo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <div key={i} className="flex gap-4">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--ember))] flex-shrink-0" />
              <div>
                <p className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[15px] mb-1">
                  {v.label}
                </p>
                <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="py-20 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] mb-14">
          Trayectoria
        </h2>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--border-subtle))]" />
          <div className="space-y-10">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-8 pl-8 relative">
                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[hsl(var(--ember))] border-2 border-[hsl(var(--bg-primary))]" />
                <div className="flex-shrink-0 font-montserrat font-bold text-[hsl(var(--ember))] text-[13px] w-36 pt-0.5 leading-snug">
                  {item.period}
                </div>
                <div>
                  <p className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[16px] mb-1">
                    {item.event}
                  </p>
                  <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default SobreMi;
