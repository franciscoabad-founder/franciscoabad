import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';

const products = [
  { name: '90-Day Reset System', price: '$37' },
  { name: 'Purpose & Serendipity OS', price: '$47' },
  { name: 'Network Strategy Dashboard', price: '$67' },
  { name: 'Founder Execution Dashboard', price: '$97' },
];

const advisoryItems = [
  'Diagnóstico Estratégico (vía Kronek)',
  'Sesiones de advisory ejecutivo',
  'Growth Partner trimestral',
];

const speakingTopics = [
  'Systems thinking aplicado',
  'Transformación institucional',
  'Liderazgo y toma de decisiones bajo presión',
  'Ejecución estratégica',
];

const TrabajaConmigo = () => (
  <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
    <Navbar />

    {/* Hero */}
    <section className="bg-[hsl(var(--bg-primary))] pt-40 pb-24">
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
        src="/Speaking/speaking-1.jpg.jpg"
        alt="Francisco Abad, Hult Prize Regional Finals, Quito"
        style={{
          width: '100%',
          height: 480,
          objectFit: 'cover',
          objectPosition: 'center 20%',
          display: 'block',
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
        Hult Prize Regional Finals, Quito, Ecuador
      </p>
    </div>

    {/* Block 1 — Productos Digitales */}
    <section className="bg-[hsl(var(--bg-primary))] py-24 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="font-montserrat text-[11px] uppercase tracking-[2px] text-[hsl(var(--ember))] mb-3">
              Empieza aquí · Desde $37
            </p>
            <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[42px] leading-tight mb-6">
              Productos Digitales
            </h2>
            <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed mb-8 max-w-[480px]">
              Herramientas y sistemas listos para usar — sin calls, sin procesos. Si necesitas
              claridad o estructura ahora mismo, empieza aquí. Cada producto es un sistema probado
              que puedes implementar desde hoy.
            </p>
            <a
              href="#productos"
              className="inline-block font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] text-[hsl(var(--ember))] border border-[hsl(var(--ember))] px-7 py-3.5 rounded-md hover:bg-[hsl(var(--ember))] hover:text-white transition-all duration-300"
            >
              Ver todos los productos →
            </a>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {products.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))] rounded-md px-6 py-4 hover:border-[hsl(var(--ember))] transition-colors duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[hsl(var(--ember))]">—</span>
                  <span className="font-inter text-[hsl(var(--text-primary))] text-[15px]">
                    {p.name}
                  </span>
                </div>
                <span className="font-montserrat font-bold text-[hsl(var(--ember))] text-[15px] flex-shrink-0 ml-4">
                  {p.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Block 2 — Advisory & Consultoría */}
    <section className="bg-[hsl(var(--bg-elevated))] py-24 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="font-montserrat text-[11px] uppercase tracking-[2px] text-[hsl(var(--ember))] mb-3">
              Para founders y executives
            </p>
            <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[42px] leading-tight mb-6">
              Advisory &<br />Consultoría
            </h2>
            <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed mb-10 max-w-[480px]">
              Acompañamiento estratégico 1:1 para líderes que operan en entornos de alta
              complejidad. No es coaching genérico: es trabajo real con alguien que ha construido,
              dirigido y transformado organizaciones desde adentro.
            </p>
            <div className="space-y-3">
              <a
                href="#advisory"
                className="block w-fit font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] text-white bg-[hsl(var(--ember))] px-8 py-4 rounded-md hover:opacity-90 transition-opacity duration-300"
              >
                Aplicar a una sesión →
              </a>
              <p className="font-inter text-[hsl(var(--text-muted))] text-[12px] leading-relaxed max-w-[340px]">
                Proceso de aplicación con preguntas de calificación. No es Calendly directo.
              </p>
            </div>
          </div>

          {/* Right */}
          <div>
            <p className="font-montserrat font-semibold text-[hsl(var(--text-muted))] text-[11px] uppercase tracking-[2px] mb-6">
              Qué incluye
            </p>
            <div className="space-y-6">
              {advisoryItems.map((item) => (
                <div key={item} className="flex gap-4 items-start">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--ember))] flex-shrink-0" />
                  <p className="font-inter text-[hsl(var(--text-primary))] text-[16px] leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-[hsl(var(--border-subtle))]">
              <p className="font-montserrat font-light italic text-[hsl(var(--text-secondary))] text-[15px] leading-relaxed">
                "El trabajo que hacemos juntos no es solo resolver el problema de hoy — es
                construir la arquitectura para que no vuelva a aparecer."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Block 3 — Speaking & Talleres */}
    <section className="bg-[hsl(var(--bg-primary))] py-24 border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="font-montserrat text-[11px] uppercase tracking-[2px] text-[hsl(var(--ember))] mb-3">
              Para empresas y eventos
            </p>
            <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[42px] leading-tight mb-6">
              Speaking &<br />Talleres
            </h2>
            <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed mb-8 max-w-[480px]">
              Keynotes y workshops diseñados para equipos directivos, conferencias y programas
              corporativos. No son presentaciones genéricas: son sesiones construidas desde la
              experiencia real de haber transformado instituciones y organizaciones.
            </p>
            <a
              href="#speaking"
              className="inline-block font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] text-[hsl(var(--ember))] border border-[hsl(var(--ember))] px-7 py-3.5 rounded-md hover:bg-[hsl(var(--ember))] hover:text-white transition-all duration-300"
            >
              Cotizar una charla →
            </a>
          </div>

          {/* Right */}
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
    <section className="bg-[hsl(var(--bg-elevated))] border-t border-[hsl(var(--border-subtle))] py-20">
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
