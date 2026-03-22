const Hero = () => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="inicio"
      className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center pt-20"
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <div className="space-y-7" data-reveal>
            {/* Eyebrow */}
            <p className="font-montserrat font-light italic text-[hsl(var(--ember))] text-[15px] tracking-wide">
              Systems for Growth.
            </p>

            {/* Headline */}
            <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[42px] sm:text-[52px] leading-[1.12] tracking-[-0.5px]">
              Diseño sistemas para que personas y organizaciones funcionen mejor.
            </h1>

            {/* Subheadline */}
            <p className="font-inter text-[hsl(var(--text-secondary))] text-lg tracking-[2px]">
              Founder · Operator · Strategist
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => scrollTo('#servicios')}
                className="font-inter font-medium text-[hsl(var(--text-primary))] bg-[hsl(var(--ember))] hover:bg-[hsl(14,45%,46%)] px-8 py-3 rounded-md transition-colors duration-300"
              >
                Trabaja conmigo
              </button>
              <button
                onClick={() => scrollTo('#recursos')}
                className="font-inter font-medium text-[hsl(var(--ember))] border border-[hsl(var(--ember))] hover:bg-[hsl(var(--ember))] hover:text-[hsl(var(--text-primary))] px-8 py-3 rounded-md transition-all duration-300"
              >
                Explora recursos gratuitos
              </button>
            </div>
          </div>

          {/* Right column — Photo */}
          <div className="flex justify-center lg:justify-end" data-reveal data-reveal-delay="3">
            <img
              src="/francisco-abad.jpeg"
              alt="Francisco Abad — Founder, Operator, Strategist"
              className="w-full max-w-[340px] aspect-[3/4] object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
