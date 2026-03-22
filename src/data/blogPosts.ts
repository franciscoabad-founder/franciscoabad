export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  body: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'ejecucion-presupuestaria-iess',
    category: 'Systems Thinking',
    title: 'Cómo elevé la ejecución presupuestaria del IESS del 36% al 78% en 6 meses',
    date: 'Mar 2026',
    readTime: '8 min',
    excerpt: 'No fue magia. Fue diseño de sistemas. Aquí el proceso exacto que usé para transformar la ejecución en una institución de 32,000 personas.',
    body: `No fue magia. Fue diseño de sistemas.

Cuando llegué al IESS, el presupuesto de inversión estaba en 36% de ejecución en el primer semestre. Eso es catastrófico para una institución que maneja más de $10 billones en activos y sirve a millones de ecuatorianos.

El problema no era la gente. Era la arquitectura.

Lo primero que hice fue mapear el flujo de aprobaciones. Encontramos 14 niveles de firma para una compra de $5,000. Catorce. No es exageración.

El sistema estaba diseñado para el fracaso.

Lo que hicimos fue rediseñar la arquitectura de decisión: quién puede aprobar qué, en qué tiempo, con qué información. No fue motivación. No fue presión. Fue claridad estructural.

En seis meses pasamos del 36% al 78%.`,
  },
  {
    slug: 'sistemas-sobre-disciplina',
    category: 'Founder Systems',
    title: 'El problema no es disciplina: por qué los buenos sistemas te dan libertad',
    date: 'Mar 2026',
    readTime: '5 min',
    excerpt: 'La mayoría de founders creen que su problema es falta de disciplina. Se equivocan. El problema es que construyen hacks, no sistemas.',
    body: `La mayoría de founders creen que necesitan más fuerza de voluntad.

Se equivocan.

El verdadero problema es que construyeron su empresa sobre hacks, no sobre sistemas. Y los hacks se rompen exactamente cuando más los necesitas.

Un sistema bien diseñado no requiere disciplina extra. Funciona porque las decisiones correctas son las más fáciles de tomar.

La disciplina es escasa. Los sistemas son escalables.

Cuando diseñas un buen sistema, no tienes que decidir si hacer la cosa correcta — el sistema hace que sea la opción natural.`,
  },
  {
    slug: 'decisiones-bajo-presion',
    category: 'Liderazgo',
    title: 'Lo que aprendí dirigiendo 32,000 personas sobre tomar decisiones bajo presión',
    date: 'Feb 2026',
    readTime: '7 min',
    excerpt: 'Cuando tienes 32,000 personas mirándote para que tomes la decisión correcta, no hay lugar para el análisis paralelo. Solo hay principios.',
    body: `Hay un momento en el que la presión supera la capacidad de análisis racional.

Lo experimenté múltiples veces dirigiendo el IESS. Decisiones con millones de dólares en juego, sindicatos, ministros, y millones de afiliados que dependían del resultado.

Lo que aprendí: no son los datos los que salvan en esos momentos. Son los principios que estableciste antes de que llegara la crisis.

Los principios no son frases en una presentación. Son decisiones anticipadas que ya tomaste en frío, para no tener que tomarlas en caliente.

El líder que no tiene principios claros tiene que tomar una decisión nueva cada vez que enfrenta presión. El que sí los tiene, solo tiene que reconocer el patrón.`,
  },
  {
    slug: 'codeis-nueve-anos',
    category: 'Founder Systems',
    title: '9 años fundando CODEIS: lo que cambiaría y lo que no',
    date: 'Feb 2026',
    readTime: '6 min',
    excerpt: 'Nueve años después de fundar CODEIS, hay decisiones que me costaron caro y otras que resultaron ser geniales. Aquí el balance honesto.',
    body: `Nueve años es mucho tiempo.

Cuando fundé CODEIS no sabía exactamente lo que estaba construyendo. Sabía que quería resolver problemas reales con tecnología y diseño de sistemas. El mercado me fue enseñando el resto.

Lo que cambiaría: habría contratado antes. Intenté hacer demasiado solo en los primeros dos años. El costo no fue solo en tiempo — fue en velocidad de aprendizaje. Los buenos equipos te enseñan cosas que no puedes aprender solo.

Lo que no cambiaría: la obsesión por la calidad de ejecución. Nunca ha fallado.

Y la decisión de construir en varios sectores. Lo que parece dispersión desde afuera, desde adentro es visión sistémica.`,
  },
  {
    slug: 'claridad-sobre-complejidad',
    category: 'Systems Thinking',
    title: 'Claridad sobre complejidad: el principio que guía todo lo que hago',
    date: 'Ene 2026',
    readTime: '4 min',
    excerpt: 'Los sistemas complejos no son inteligentes. Son costosos. Aquí por qué la claridad es mi primer criterio para cualquier decisión.',
    body: `La complejidad se siente como inteligencia. No lo es.

He visto organizaciones enteras construidas sobre capas y capas de procesos que nadie entiende. Cada capa fue añadida con buena intención. El resultado es un sistema que consume energía en mantener su propia complejidad en lugar de crear valor.

La claridad es diferente. Claridad significa que cualquier persona del equipo puede explicar qué hace el sistema y por qué.

Mi test: si no puedo explicarlo en una oración, no está listo.

No es simplismo. Es disciplina de diseño.`,
  },
  {
    slug: 'construccion-visible',
    category: 'Liderazgo',
    title: 'Por qué construyo en público: la ventaja de la construcción visible',
    date: 'Ene 2026',
    readTime: '5 min',
    excerpt: 'Construir en público no es vanidad. Es una estrategia de aprendizaje acelerado y de confianza a largo plazo.',
    body: `Construir en público incomoda.

Compartir el proceso, los errores, las dudas. No solo el resultado pulido.

Pero he encontrado que la construcción visible genera algo que ninguna campaña de marketing puede comprar: confianza real.

Cuando la gente ve cómo piensas, cómo tomas decisiones, cómo te equivocas y cómo corriges, te conocen de verdad. Y confían en ti de verdad.

El resultado pulido genera admiración. El proceso visible genera conexión.

Y la conexión es lo que convierte lectores en clientes, seguidores en comunidad.`,
  },
];
