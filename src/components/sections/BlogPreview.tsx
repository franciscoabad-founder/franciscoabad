const posts = [
  {
    category: 'Systems Thinking',
    title: 'Cómo elevé la ejecución presupuestaria del IESS del 36% al 78% en 6 meses',
    date: 'Mar 2026',
    readTime: '8 min',
  },
  {
    category: 'Founder Systems',
    title: 'El problema no es disciplina: por qué los buenos sistemas te dan libertad',
    date: 'Mar 2026',
    readTime: '5 min',
  },
  {
    category: 'Liderazgo',
    title: 'Lo que aprendí dirigiendo 32,000 personas sobre tomar decisiones bajo presión',
    date: 'Feb 2026',
    readTime: '7 min',
  },
];

const BlogPreview = () => (
  <section id="blog" className="bg-[hsl(var(--bg-primary))] py-32">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      <div className="mb-14" data-reveal>
        <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[36px] mb-3">
          Desde el campo
        </h2>
        <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] max-w-[560px] leading-relaxed">
          Ideas sobre sistemas, crecimiento y ejecución. Basadas en experiencia real, no en teoría.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <article
            key={post.title}
            className="bg-[hsl(var(--bg-elevated))] rounded-lg overflow-hidden border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--ember))] transition-colors duration-300 group cursor-pointer"
            data-reveal
            data-reveal-delay={String(i + 1)}
          >
            {/* Image placeholder */}
            <div className="aspect-video bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border-subtle))]" />

            {/* Content */}
            <div className="p-6 space-y-3">
              <span className="inline-block bg-[hsl(var(--ember))] text-[hsl(var(--text-primary))] font-montserrat font-semibold text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full">
                {post.category}
              </span>
              <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[16px] leading-snug group-hover:text-[hsl(var(--ember))] transition-colors duration-300">
                {post.title}
              </h3>
              <p className="font-inter text-[hsl(var(--text-muted))] text-[12px] tracking-wide">
                {post.date} · {post.readTime} de lectura
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default BlogPreview;
