import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';

const sessions = [
  {
    title: 'Sesión de Diagnóstico',
    price: '$297',
    duration: '90 min · Zoom',
    includes: [
      'Diagnóstico estructurado',
      'Plan de 90 días',
      'Excel configurado',
      'Resumen ejecutivo',
    ],
    cta: 'Aplicar a esta sesión →',
    href: '/contacto?tipo=advisory',
  },
  {
    title: 'Sesión + Seguimiento',
    price: '$497',
    duration: '90 min + 2 check-ins de 30 min',
    includes: [
      'Todo lo de la Sesión de Diagnóstico',
      '2 check-ins de seguimiento',
      'Ajustes en tiempo real',
    ],
    cta: 'Aplicar a esta sesión →',
    href: '/contacto?tipo=advisory',
  },
  {
    title: 'Sistema Completo',
    price: 'Desde $997',
    duration: 'Done-For-You',
    includes: [
      'Para founders que quieren que el sistema esté instalado, no solo explicado',
    ],
    cta: 'Solicitar información →',
    href: '/contacto?tipo=advisory',
  },
];

const speakingTopics = [
  'Systems thinking aplicado',
  'Transformación institucional',
  'Liderazgo y toma de decisiones bajo presión',
  'Ejecución estratégica',
];

const TrabajaConmigo = () => (
  <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
    <Helmet>
      <title>Trabaja Conmigo | Francisco Abad</title>
      <meta name="description" content="Advisory, consultoría estratégica y productos digitales. Sistemas de crecimiento para founders y organizaciones en LATAM." />
    </Helmet>
    <Navbar />

    {/* Hero */}
    <section className="bg-[hsl(var(--bg-primary))] pt-32 pb-12 md:pt-40 md:pb-24">
      <div className="max-w-[760px] mx-auto px-6 lg:px-8">
        <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[40px] md:text-[56px] leading-tight mb-5">
          Trabajemos juntos.
        </h1>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[17px] leading-relaxed mb-5">
          Tres formas de trabajar conmigo, según lo que necesitas resolver ahora.
        </p>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed">
          He liderado organizaciones con 32.000 personas y $10 billones en activos. He construido programas en 15 países con presupuesto casi cero. La diferencia entre los dos contextos no fue el recurso: fue el sistema. Si estás construyendo algo y el crecimiento se siente trabado, probablemente el problema no está donde crees. Eso es lo que diagnostico y lo que diseño.
        </p>
      </div>
    </section>

    {/* Speaking hero image */}
    <div className="relative w-full overflow-hidden" style={{ maxHeight: 480 }}>
      <img
        src="/Speaking/speaking-banner.jpg.png"
        alt="Francisco Abad hablando en Innovaxion 2024"
        style={{
          width: '100%',
          height: 480,
          objectFit: 'cover',
          objectPosition: 'center 30%',
          display: 'block',
          filter: 'brightness(0.85) contrast(1.1) saturate(0.9)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 60%, rgba(20,20,20,0.8) 100%)',
        }}
      />
      <p
        style={{
          position: 'absolute',
          bottom: 20,
          left: 24,
          color: '#fff',
          fontSize: 12,
          fontFamily: 'Montserrat, Arial, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          margin: 0,
        }}
      >
        PONENCIA DE APERTURA, INNOVAXION 2024
      </p>
    </div>

    {/* Sección A — Productos Digitales */}
    <section className="bg-[hsl(var(--bg-primary))] py-12 md:py-20 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <p className="font-montserrat text-[11px] uppercase tracking-[2px] text-[hsl(var(--ember))] mb-3">
          Empieza aquí
        </p>
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[38px] leading-tight mb-10">
          Herramientas que puedes implementar hoy
        </h2>

        {/* Growth OS card */}
        <div className="max-w-[560px] bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--ember))] rounded-lg p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[22px]">
                Growth OS
              </p>
              <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] mt-1 leading-relaxed">
                El sistema operativo personal de 90 días. Excel, manual, brief y prompts de IA incluidos.
              </p>
            </div>
            <span className="font-montserrat font-bold text-[hsl(var(--ember))] text-[22px] flex-shrink-0">
              $47
            </span>
          </div>
          <Link
            to="/growth-os"
            className="inline-block font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] text-white bg-[hsl(var(--ember))] px-7 py-3.5 rounded-md hover:opacity-90 transition-opacity duration-300"
          >
            Ver el Growth OS →
          </Link>
        </div>
      </div>
    </section>

    {/* Sección B — Sesiones 1:1 */}
    <section className="bg-[hsl(var(--bg-elevated))] py-12 md:py-20 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <p className="font-montserrat text-[11px] uppercase tracking-[2px] text-[hsl(var(--ember))] mb-3">
          Para founders y executives
        </p>
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[38px] leading-tight mb-3">
          Trabajemos directamente
        </h2>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[15px] mb-12">
          Aplica primero. Si hay fit, agendamos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessions.map((s) => (
            <div
              key={s.title}
              className="bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--ember))] rounded-lg p-8 flex flex-col transition-colors duration-300"
            >
              <p className="font-montserrat font-bold text-[hsl(var(--ember))] text-[28px] mb-1">
                {s.price}
              </p>
              <p className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[18px] mb-1">
                {s.title}
              </p>
              <p className="font-inter text-[hsl(var(--text-muted))] text-[12px] mb-6">
                {s.duration}
              </p>
              <ul className="space-y-2 mb-8 flex-1">
                {s.includes.map((item) => (
                  <li key={item} className="font-inter text-[hsl(var(--text-secondary))] text-[14px] flex items-start gap-2 leading-snug">
                    <span className="text-[hsl(var(--ember))] flex-shrink-0 mt-[2px]">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={s.href}
                className="font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] text-[hsl(var(--ember))] border border-[hsl(var(--ember))] px-5 py-3 rounded-md text-center hover:bg-[hsl(var(--ember))] hover:text-white transition-all duration-300"
              >
                {s.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-10 border-t border-[hsl(var(--border-subtle))] max-w-[480px]">
          <p className="font-montserrat font-light italic text-[hsl(var(--text-secondary))] text-[15px] leading-relaxed">
            "El trabajo que hacemos juntos no es solo resolver el problema de hoy — es construir la arquitectura para que no vuelva a aparecer."
          </p>
        </div>
      </div>
    </section>

    {/* Sección C — Speaking & Talleres */}
    <section className="bg-[hsl(var(--bg-primary))] py-12 md:py-20 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="font-montserrat text-[11px] uppercase tracking-[2px] text-[hsl(var(--ember))] mb-3">
              Para empresas y eventos
            </p>
            <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[38px] leading-tight mb-6">
              ¿Quieres que hable en tu evento?
            </h2>
            <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed mb-8 max-w-[480px]">
              Keynotes y workshops diseñados para equipos directivos, conferencias y programas corporativos. Sesiones construidas desde la experiencia real de haber transformado instituciones y organizaciones.
            </p>
            <Link
              to="/contacto?tipo=speaking"
              className="inline-block font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] text-[hsl(var(--ember))] border border-[hsl(var(--ember))] px-7 py-3.5 rounded-md hover:bg-[hsl(var(--ember))] hover:text-white transition-all duration-300"
            >
              Cotizar una charla →
            </Link>
          </div>

          <div>
            <p className="font-montserrat font-semibold text-[hsl(var(--text-muted))] text-[11px] uppercase tracking-[2px] mb-6">
              Temas
            </p>
            <div className="space-y-4">
              {speakingTopics.map((topic, i) => (
                <div
                  key={topic}
                  className="flex items-center gap-5 bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))] rounded-md px-6 py-4"
                >
                  <span className="font-montserrat font-bold text-[hsl(var(--ember))] text-[13px] opacity-50 w-5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-inter text-[hsl(var(--text-primary))] text-[15px]">
                    {topic}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="bg-[hsl(var(--bg-elevated))] border-t border-[hsl(var(--border-subtle))] py-12 md:py-20">
      <div className="max-w-[760px] mx-auto px-6 lg:px-8 text-center">
        <h3 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[28px] md:text-[34px] mb-4">
          ¿No sabes por dónde empezar?
        </h3>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed mb-8">
          Escríbeme y te ayudo a encontrar el formato correcto.
        </p>
        <Link
          to="/contacto"
          className="inline-block font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] text-white bg-[hsl(var(--ember))] px-8 py-4 rounded-md hover:opacity-90 transition-opacity duration-300"
        >
          Escríbeme →
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default TrabajaConmigo;
