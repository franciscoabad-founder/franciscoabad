import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
    event: 'Founder · Partner · Presidente del Directorio',
    detail:
      'Construyo Fulcra (workertech startup), dirijo estrategia en Kronek (consultoría de crecimiento y revenue), y presido el directorio de CODEIS en su transición a empresa social sostenible.',
  },
  {
    period: 'Jun 2025 · Dic 2025',
    event: 'Director General, IESS',
    detail:
      'Máxima autoridad de la institución pública más grande del Ecuador: $10 billones en fondos gestionados, 32.000 colaboradores, 13 millones de beneficiarios. Ejecución presupuestaria: 36% a 78% en seis meses.',
  },
  {
    period: '2022',
    event: 'Young Leaders of the Americas Initiative Fellow',
    detail:
      'Seleccionado por el Departamento de Estado de Estados Unidos entre emprendedores de 37 países de América Latina y el Caribe. El programa YLAI es el flagship del State Department para líderes empresariales y sociales emergentes del hemisferio occidental.',
  },
  {
    period: '2016 · 2025',
    event: 'Fundador y Director Ejecutivo, CODEIS',
    detail:
      'Construí desde cero una organización de innovación social en 15 países. 12.000 emprendedores capacitados. Alianzas con BID Lab, USAID, GIZ, Banco Mundial. El programa World Change Makers ganó el desafío internacional Better Together del BID Lab y fue reconocido por Naciones Unidas entre los 50 mejores proyectos jóvenes del mundo.',
  },
  {
    period: 'Ene 2019 · Abr 2019',
    event: 'Global Competitiveness Leadership Program, Georgetown University',
    detail:
      'Beca completa. Top 10 proyectos del programa entre participantes de más de 40 países. Materias de liderazgo adaptativo, finanzas, innovación abierta y negociación ejecutiva.',
  },
  {
    period: '2014 · 2016',
    event: 'MPA Desarrollo Internacional, London School of Economics',
    detail:
      'Mérito académico. Econometría aplicada, evaluación de impacto, políticas públicas y finanzas del desarrollo. Fundador de la Sociedad de Innovación Social en LSE.',
  },
  {
    period: '2011',
    event: 'One Young World · Delegate Speaker y Ambassador, Zurich',
    detail:
      'Primer ecuatoriano en representar al país en One Young World, el encuentro anual de los jóvenes líderes más destacados del mundo. El Summit de Zurich 2011 reunió delegados de 190 países bajo la tutoría de figuras como Desmond Tutu, Bob Geldof y Kofi Annan. El proceso de selección recibe más de 50.000 aplicaciones por año.',
  },
  {
    period: '2012',
    event: 'Egresado con Máximos Honores, East Texas Baptist University',
    detail:
      'Double major: Ciencias Políticas y Estudios Internacionales. Minor en Liderazgo. Promedio 3.87/4.0 Summa Cum Laude con Distinción en Ciencias Políticas. Primer latino en presidir el Student Government Association. Top 5 Speakers en el Torneo de Debate Nacional. Starting Block Fellow.',
  },
  {
    period: '2007',
    event: 'Youth Ambassador, Programa del Departamento de Estado de EE.UU.',
    detail:
      'Seleccionado entre estudiantes de secundaria de Ecuador para el programa de intercambio de liderazgo del Bureau of Educational and Cultural Affairs del Departamento de Estado de EE.UU. El programa selecciona jóvenes de alto potencial de liderazgo en toda América Latina y el Caribe.',
  },
];

const SobreMi = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleItem = (i: number) => {
    setOpenIndex((prev) => (prev === i ? -1 : i));
  };

  return (
  <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
    <Helmet>
      <title>Sobre Mí | Francisco Abad</title>
      <meta name="description" content="Mi historia: de fundar CODEIS en 15 países a dirigir el IESS. Diseño sistemas para que founders y organizaciones operen mejor." />
    </Helmet>
    <Navbar />

    {/* Photo + Bio */}
    <section className="pt-32 pb-16">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <img
            src="/francisco-abad-about.jpg"
            alt="Francisco Abad, Founder, Operator, Strategist"
            className="w-full max-w-[360px] aspect-[3/4] object-cover rounded-lg shadow-2xl"
          />

          <div className="space-y-8 pt-4">
            <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[44px]">
              Mi historia
            </h1>
            <div className="space-y-4 font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed">
              <p>
                Fundé{' '}
                <strong className="text-[hsl(var(--text-primary))]">CODEIS</strong> hace 10 años
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
    <section className="py-12 md:py-16 border-t border-[hsl(var(--border-subtle))]">
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
    <section className="py-12 md:py-20 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] mb-14">
          Trayectoria
        </h2>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--border-subtle))] hidden md:block" />
          <div className="space-y-0 md:space-y-10">
            {timeline.map((item, i) => (
              <div key={i} className="relative">
                {/* Mobile: accordion */}
                <div className="md:hidden border-b border-[hsl(var(--border-subtle))]">
                  <button
                    className="w-full flex items-center justify-between py-3 text-left"
                    onClick={() => toggleItem(i)}
                  >
                    <div className="pr-4">
                      <span className="font-montserrat font-bold text-[hsl(var(--ember))] text-[11px] block mb-0.5">
                        {item.period}
                      </span>
                      <span className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[14px] leading-snug">
                        {item.event}
                      </span>
                    </div>
                    <span className="text-[hsl(var(--ember))] flex-shrink-0 text-[10px]">
                      {openIndex === i ? '▲' : '▼'}
                    </span>
                  </button>
                  {openIndex === i && (
                    <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-relaxed pb-4 pr-4">
                      {item.detail}
                    </p>
                  )}
                </div>

                {/* Desktop: full timeline row */}
                <div className="hidden md:flex gap-8 pl-8">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
  );
};

export default SobreMi;
