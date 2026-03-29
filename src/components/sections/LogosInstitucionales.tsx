const groups = [
  {
    label: 'FORMACIÓN',
    items: [
      { src: '/logos-institucionales/lse-logo.png',            alt: 'London School of Economics', legend: 'MPA · London School of Economics', blend: false },
      { src: '/logos-institucionales/georgetown-logo.png.png', alt: 'Georgetown University',       legend: 'Global Competitiveness Leadership', blend: false },
      { src: '/logos-institucionales/upenn-logo.png',          alt: 'Wharton / UPenn',             legend: 'Social Impact House · Wharton', blend: false },
    ],
  },
  {
    label: 'ALIADOS Y PROGRAMAS',
    items: [
      { src: '/logos-institucionales/bidlab-logo.png',         alt: 'BID Lab',    legend: 'Grant · World Change Makers', blend: false },
      { src: '/logos-institucionales/PNUD_logo.png',           alt: 'PNUD',       legend: 'Programa de Naciones Unidas', blend: false },
      { src: '/logos-institucionales/giz-logo.png',            alt: 'GIZ',        legend: 'Cooperación Alemana GIZ', blend: false },
      { src: '/logos-institucionales/iess-logo.png',           alt: 'IESS',       legend: 'Director General 2025', blend: false },
      { src: '/logos-institucionales/codeis-logo.png',         alt: 'CODEIS',     legend: 'Fundador · 15 países', blend: false },
      { src: '/logos-institucionales/hult-prize-logo.png',     alt: 'Hult Prize', legend: 'Director Nacional Ecuador', blend: true },
    ],
  },
  {
    label: 'SPEAKER Y DOCENTE',
    items: [
      { src: '/logos-institucionales/oyw-logo.png',  alt: 'One Young World', legend: 'One Young World · Ambassador', blend: false },
      { src: '/logos-institucionales/sg-logo.avif',  alt: 'Startup Grind',   legend: 'Startup Grind · Speaker', blend: false },
      { src: '/logos-institucionales/udla-logo.png', alt: 'UDLA',            legend: 'Profesor de Maestría', blend: true },
      { src: '/logos-institucionales/usfq-logo.png', alt: 'USFQ',            legend: 'Profesor de Emprendimiento', blend: false },
      { src: '/logos-institucionales/yachay-logo.png', alt: 'Yachay Tech',   legend: 'Speaker', blend: false },
    ],
  },
];

const divider = (
  <div style={{ borderTop: '1px solid rgba(74,69,65,0.15)', margin: '32px 0' }} />
);

const LogosInstitucionales = () => (
  <section style={{ backgroundColor: '#F4EDE6', padding: '64px 0' }}>
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      <div className="mb-10" data-reveal>
        <p
          className="font-montserrat font-semibold uppercase tracking-[3px] mb-4"
          style={{ color: '#A3503A', fontSize: '1.5rem' }}
        >
          TRAYECTORIA
        </p>
      </div>

      {groups.map((group, gi) => (
        <div key={group.label} data-reveal>
          {gi > 0 && divider}

          <p
            style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontSize: '0.85rem',
              color: '#4A4541',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 20,
            }}
          >
            {group.label}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40 }}>
            {group.items.map((item) => (
              <div
                key={item.alt}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="transition-all duration-300 opacity-[0.85] hover:opacity-100 hover:scale-105"
                  style={{
                    height: 48,
                    width: 'auto',
                    ...(item.blend ? { mixBlendMode: 'multiply' } : {}),
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: 11,
                    color: '#4A4541',
                    textAlign: 'center',
                    maxWidth: 120,
                    lineHeight: 1.4,
                  }}
                >
                  {item.legend}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default LogosInstitucionales;
