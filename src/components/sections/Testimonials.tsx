const testimonials = [
  {
    photo: '/testimonials/carlos-rivas.jpg.jpeg',
    initials: 'CR',
    name: 'Carlos Rivas',
    role: 'Director Nacional de Tecnologías de Información jun-dic 2025',
    company: 'IESS - Instituto Ecuatoriano de Seguridad Social',
    quote:
      'Cuando Francisco llegó, vimos los mismos procesos que habíamos tenido durante años. Lo primero que hizo fue mapearlos todos, entender cómo funcionaba la institución de verdad antes de tocar nada. Después diseñamos juntos un plan de transformación digital basado en rediseñar la estructura orgánica funcional desde los procesos, no desde la tecnología. La tecnología fue el habilitador. Entender qué estaba pasando fue la base. Los números reflejan ese trabajo: pasamos del 36% al 78% de ejecución presupuestaria en seis meses.',
  },
  {
    photo: '/testimonials/enrique-crespo.jpg.jpeg',
    initials: 'EC',
    name: 'Enrique Crespo',
    role: 'Regional Digital Specialist LAC',
    company: 'PNUD - Programa de Naciones Unidas para el Desarrollo',
    quote:
      'Trabajamos juntos diseñando el programa nacional de Hult Prize en Ecuador. En dos años llegamos a más de 70 universidades y 12.000 estudiantes, construyendo uno de los movimientos de emprendimiento e innovación social universitaria más grandes del país. Lo que Francisco hace bien es diseñar sistemas que escalan sin perder calidad. El framework es sólido porque está construido en principios, no en suposiciones.',
  },
  {
    photo: '/testimonials/lili-yepes.jpg.jpeg',
    initials: 'LY',
    name: 'Lilyán Yepez',
    role: 'Fundadora y CEO',
    company: 'NoTrace',
    quote:
      'Empezamos trabajando el posicionamiento de NoTrace a nivel internacional y terminamos repensando la estrategia completa de la empresa. Francisco diagnosticó dónde estábamos estancados, diseñó el sistema para desbloquearlo, y trabaja con nosotros en todo, desde el Biodiversity Summit hasta la estructura comercial. Confío en su criterio porque parte siempre de entender primero, no de prescribir.',
  },
  {
    photo: '/testimonials/gabriela-tulcanazo.jpg.png',
    initials: 'GT',
    name: 'Gabriela Tulcanazo',
    role: 'Directora Ejecutiva',
    company: 'CODEIS',
    quote:
      'Estamos transformando CODEIS de una ONG dependiente de grants a una empresa social sostenible. Ese trabajo se hace desde el sistema: rediseñar cómo opera la organización, cómo genera valor, cómo se financia. Francisco construyó CODEIS durante 9 años y ahora me apoya desde la presidencia del directorio con la misma visión sistémica con la que lo fundó. La diferencia entre antes y ahora es que el sistema trabaja, no solo las personas.',
  },
  {
    photo: '/testimonials/brandon-penerrera.jpg.png',
    initials: 'BP',
    name: 'Brandon Peñaherrera',
    role: 'Fundador',
    company: 'Yami Dog',
    quote:
      'Mis profesores me dijeron que no iba a ser nadie. Cuando conocí a Francisco y aprendí que podía emprender, descubrí lo que quería hacer con mi vida. Hoy Yami Dog da empleo a mi familia y a doce personas en la comunidad. He ganado el premio Soy Empresario de la Cámara de Industrias y reconocimientos nacionales en concursos de emprendimiento. Lo que Francisco enseña no son teorías. Son herramientas que se aplican.',
  },
  {
    photo: '/testimonials/carlos-cardenas.jpg.jpg',
    initials: 'CC',
    name: 'Carlos Cárdenas',
    role: 'Gerente General',
    company: 'Grupo CAVE',
    quote:
      'Hemos trabajado juntos en varios proyectos, incluyendo un evento con más de 18.000 personas en tres días. Ahora Francisco está trabajando conmigo en algo más profundo: organizar la empresa, diagnosticar qué está estancado, automatizar procesos, y potenciar mi marca personal para generar ingresos que no dependan solo de mi tiempo. Es la primera vez que trabajo con alguien que entiende tanto el sistema operativo de un negocio como el de una persona.',
  },
  {
    photo: '/testimonials/jaime-guzman.jpg.png',
    initials: 'JG',
    name: 'Jaime Guzmán',
    role: 'Project Manager',
    company: 'Innovaxion 2024',
    quote:
      'Materializamos juntos Innovaxion: 50 speakers de más de 10 países, 3.000 asistentes, impacto real en el ecosistema de innovación pública, social y ambiental de Ecuador. Francisco no solo diseña el sistema. Lo ejecuta. Y cuando algo no funciona durante la ejecución, lo resuelve sin drama.',
  },
  {
    photo: '/testimonials/alvaro-maldonado.jpg.jpeg',
    initials: 'AM',
    name: 'Álvaro Maldonado',
    role: 'Presidente',
    company: 'IFI Ecuador',
    quote:
      'Trabajamos juntos desde el sector público en la activación del ecosistema de innovación social de Quito, cuando lanzamos Hult Prize Ecuador y recibimos la primera Final Regional de Sudamérica. Francisco sabe cómo conectar el estado, la academia y los emprendedores en un sistema funcional. Lo que construimos entonces fue un movimiento, no un evento.',
  },
];

const Avatar = ({
  photo,
  initials,
  name,
}: {
  photo: string;
  initials: string;
  name: string;
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement | null;
    if (fallback) fallback.style.display = 'flex';
  };

  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <img
        src={photo}
        alt={name}
        onError={handleError}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #C2654A',
          display: 'block',
        }}
      />
      <div
        style={{
          display: 'none',
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#C2654A',
          border: '2px solid #C2654A',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 700,
          fontSize: 18,
          color: '#fff',
          letterSpacing: 1,
        }}
      >
        {initials}
      </div>
    </div>
  );
};

const Testimonials = () => (
  <section className="py-24 bg-[hsl(var(--bg-primary))]">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      <div className="mb-14" data-reveal>
        <p
          className="font-montserrat font-semibold uppercase tracking-[3px] text-[11px] mb-4"
          style={{ color: '#C2654A' }}
        >
          TESTIMONIOS
        </p>
        <h2
          className="font-montserrat font-black text-[32px] lg:text-[40px] leading-[1.15]"
          style={{ color: '#F4EDE6' }}
        >
          Lo que dicen quienes<br />han trabajado conmigo
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            data-reveal
            style={{
              backgroundColor: '#1E1E1E',
              border: '1px solid rgba(138,130,121,0.15)',
              borderLeft: '2px solid #C2654A',
              borderRadius: 8,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar photo={t.photo} initials={t.initials} name={t.name} />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#F4EDE6',
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {t.name}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: 12,
                    color: '#C2654A',
                    margin: '3px 0 2px',
                    lineHeight: 1.4,
                  }}
                >
                  {t.role}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: 12,
                    color: '#8A8279',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {t.company}
                </p>
              </div>
            </div>

            <p
              style={{
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: 14,
                color: '#F4EDE6',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <span
                style={{
                  color: '#C2654A',
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1,
                  marginRight: 2,
                }}
              >
                &ldquo;
              </span>
              {t.quote}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
