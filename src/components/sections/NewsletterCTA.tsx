const NewsletterCTA = () => (
  <section id="contacto" className="bg-[hsl(var(--bg-elevated))] py-24 md:py-28">
    <div className="max-w-[600px] mx-auto px-6 text-center" data-reveal>
      <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[40px] md:text-[44px] mb-4">
        Operator Notes
      </h2>
      <p className="font-inter text-[hsl(var(--text-secondary))] text-[17px] leading-relaxed mb-8">
        Ideas sobre sistemas, growth y ejecución. Sin ruido. Para founders y operators que quieren operar mejor.
      </p>

      <div className="flex gap-2 max-w-[440px] mx-auto mb-3">
        <input
          type="email"
          placeholder="tu@email.com"
          className="flex-1 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border-subtle))] rounded-md px-4 py-3 font-inter text-[hsl(var(--text-primary))] text-[14px] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:border-[hsl(var(--ember))] transition-colors"
        />
        <button className="bg-[hsl(var(--ember))] text-[hsl(var(--text-primary))] font-inter font-medium text-[14px] px-6 py-3 rounded-md hover:bg-[hsl(14,45%,46%)] transition-colors whitespace-nowrap">
          Suscribirme
        </button>
      </div>

      <p className="font-inter text-[hsl(var(--text-muted))] text-[12px]">
        Quincenal. Puedes darte de baja cuando quieras.
      </p>
    </div>
  </section>
);

export default NewsletterCTA;
