import { Download, Play } from 'lucide-react';

const Resources = () => (
  <section id="recursos" className="bg-[hsl(var(--bg-elevated))] py-32">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      <h2 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[36px] text-center mb-16" data-reveal>
        Recursos para operators y builders
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1 — Lead magnet (highlighted) */}
        <div
          className="bg-[hsl(var(--bg-primary))] rounded-lg p-8 border border-[hsl(var(--ember))] flex flex-col"
          data-reveal
          data-reveal-delay="1"
        >
          <span className="inline-block bg-[hsl(var(--ember))] text-[hsl(var(--text-primary))] font-montserrat text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-5 self-start">
            Lead Magnet
          </span>
          <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[20px] mb-3">
            Weekly Reset System
          </h3>
          <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-relaxed mb-6 flex-1">
            El sistema semanal que uso para mantener claridad y ejecución cuando todo es urgente.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))] rounded-md px-3 py-2 font-inter text-[hsl(var(--text-primary))] text-[13px] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:border-[hsl(var(--ember))] transition-colors"
            />
            <button className="bg-[hsl(var(--ember))] text-[hsl(var(--text-primary))] font-inter font-medium text-[13px] px-4 py-2 rounded-md hover:bg-[hsl(14,45%,46%)] transition-colors whitespace-nowrap">
              Descargar gratis
            </button>
          </div>
        </div>

        {/* Col 2 — Frameworks */}
        <div
          className="bg-[hsl(var(--bg-primary))] rounded-lg p-8 border border-[hsl(var(--border-subtle))] flex flex-col"
          data-reveal
          data-reveal-delay="2"
        >
          <span className="inline-block bg-[hsl(var(--border-subtle))] text-[hsl(var(--text-secondary))] font-montserrat text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-5 self-start">
            Frameworks
          </span>
          <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[20px] mb-6">
            Frameworks Visuales
          </h3>
          <div className="space-y-4 flex-1">
            {[
              'Las 4 capas de un sistema de crecimiento',
              'El Growth Bottleneck Finder',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-md bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))]"
              >
                <Download size={15} className="text-[hsl(var(--ember))] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-[hsl(var(--text-secondary))] text-[13px] leading-snug mb-1">
                    {item}
                  </p>
                  <a href="#" className="font-inter font-medium text-[hsl(var(--ember))] text-[12px] hover:underline">
                    Acceder →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3 — Videos */}
        <div
          className="bg-[hsl(var(--bg-primary))] rounded-lg p-8 border border-[hsl(var(--border-subtle))] flex flex-col"
          data-reveal
          data-reveal-delay="3"
        >
          <span className="inline-block bg-[hsl(var(--border-subtle))] text-[hsl(var(--text-secondary))] font-montserrat text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-5 self-start">
            Videos
          </span>
          <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[20px] mb-6">
            Videos y Entrevistas
          </h3>
          <div className="space-y-4 flex-1">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="relative aspect-video bg-[hsl(var(--bg-elevated))] rounded-md border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--ember))] transition-colors duration-300 flex items-center justify-center cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--ember))] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Play size={14} className="text-[hsl(var(--text-primary))] ml-0.5" fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Resources;
