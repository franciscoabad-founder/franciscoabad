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
    year: '2026',
    event: 'Fundador y CEO, Fulcra · Partner, Kronek · Presidente del Directorio, CODEIS',
    detail:
      'Construyo Fulcra, una startup de workertech que diagnostica cómo trabajan realmente las organizaciones antes de que automaticer cualquier cosa. Paralelamente, dirijo estrategia de crecimiento y revenue en Kronek junto a mi socio Robinson, y presido el directorio de CODEIS.',
  },
  {
    year: '2025',
    event: 'Director General, IESS',
    detail:
      'Lideré la institución pública más grande del Ecuador: $10 billones en fondos administrados, 32.000 colaboradores, 13 millones de beneficiarios. Elevé la ejecución presupuestaria del 36% al 78% en menos de seis meses. Implementé tableros de inteligencia de negocios y lideré la transformación digital de servicios clave.',
  },
  {
    year: '2016',
    event: 'Fundador y Director Ejecutivo, CODEIS',
    detail:
      'Construí desde cero una organización de innovación social presente en 15 países. 12.000 emprendedores capacitados. Alianzas con BID Lab, USAID, GIZ, Banco Mundial, Georgetown. El programa World Change Makers ganó el desafío internacional Better Together del BID Lab y fue reconocido por Naciones Unidas entre los 50 mejores proyectos jóvenes globales.',
  },
  {
    year: '2019',
    event: 'Global Competitiveness Leadership Program, Georgetown University',
    detail:
      'Beca completa. Top 10 proyectos del programa. Materias de liderazgo adaptativo, finanzas, innovación abierta y negociación ejecutiva.',
  },
  {
    year: '2014',
    event: 'MPA Desarrollo Internacional, London School of Economics',
    detail:
      'Méritos académicos. Econometría aplicada, evaluación de impacto, políticas públicas, finanzas del desarrollo. Fundador de la Sociedad de Innovación Social en LSE.',
  },
];

const SobreMi = () => (
  <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
    <Navbar />

    {/* Main content */}
    <section className="pt-32 pb-20">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Photo */}
          <img
            src="/francisco-abad.png"
            alt="Francisco Abad, Founder, Operator, Strategist"
            className="w-full max-w-[480px] aspect-[3/4] object-cover rounded-lg shadow-2xl"
          />

          {/* Right side */}
          <div className="space-y-16 pt-4">
            {/* Mi historia */}
            <div>
              <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[44px] mb-6">
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

            {/* Lo que creo */}
            <div>
              <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[28px] mb-8">
                Lo que creo
              </h2>
              <div className="space-y-6">
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


          </div>
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
                <div className="flex-shrink-0 font-montserrat font-bold text-[hsl(var(--ember))] text-[14px] w-12 pt-0.5">
                  {item.year}
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
