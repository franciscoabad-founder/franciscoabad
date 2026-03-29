import { Play } from 'lucide-react';

const Resources = () => (
  <section id="recursos" className="bg-[hsl(var(--bg-elevated))] py-24">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
      <h2
        className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[36px] mb-14"
        data-reveal
      >
        Recursos para founders y operators
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1 — Lead magnet */}
        <div
          className="bg-[hsl(var(--bg-primary))] rounded-lg p-8 border border-[hsl(var(--ember))] flex flex-col"
          data-reveal
        >
          <span className="inline-block bg-[hsl(var(--ember))] text-white font-montserrat text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-5 self-start">
            Gratis
          </span>
          <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[20px] mb-3">
            Weekly Reset System
          </h3>
          <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-relaxed mb-6 flex-1">
            El sistema semanal que uso para mantener claridad y ejecución cuando todo es urgente.
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))] rounded-md px-3 py-2.5 font-inter text-[hsl(var(--text-primary))] text-[13px] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:border-[hsl(var(--ember))] transition-colors"
            />
            <button className="w-full bg-[hsl(var(--ember))] text-white font-inter font-medium text-[13px] px-4 py-2.5 rounded-md hover:bg-[hsl(14,45%,46%)] transition-colors">
              Descargar
            </button>
          </div>
        </div>

        {/* Col 2 — Producto digital (placeholder) */}
        <div
          className="bg-[hsl(var(--bg-primary))] rounded-lg p-8 border border-[hsl(var(--border-subtle))] flex flex-col"
          data-reveal
        >
          <span className="inline-block bg-[hsl(var(--border-subtle))] text-[hsl(var(--text-secondary))] font-montserrat text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-5 self-start">
            Próximamente
          </span>
          <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[20px] mb-3">
            [NOMBRE DEL PRODUCTO]
          </h3>
          <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-relaxed mb-6 flex-1">
            Un sistema práctico para founders y operators que necesitan claridad y ejecución. Más detalles pronto.
          </p>
          <button className="w-full border border-[hsl(var(--ember))] text-[hsl(var(--ember))] font-inter font-medium text-[13px] px-4 py-2.5 rounded-md hover:bg-[hsl(var(--ember))] hover:text-white transition-colors">
            Notificarme
          </button>
        </div>

        {/* Col 3 — Videos */}
        <div
          className="bg-[hsl(var(--bg-primary))] rounded-lg p-8 border border-[hsl(var(--border-subtle))] flex flex-col"
          data-reveal
        >
          <span className="inline-block bg-[hsl(var(--border-subtle))] text-[hsl(var(--text-secondary))] font-montserrat text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-5 self-start">
            Videos
          </span>
          <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[20px] mb-6">
            Entrevistas y charlas
          </h3>
          <div className="space-y-4 flex-1">
            {[1, 2].map((n) => (
              <div key={n}>
                <div className="relative aspect-video bg-[hsl(var(--bg-elevated))] rounded-md border border-[hsl(var(--border-subtle))] flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--ember))] flex items-center justify-center opacity-50">
                    <Play size={14} className="text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <p className="font-inter text-[hsl(var(--text-muted))] text-[12px] text-center">
                  Próximamente
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Resources;
