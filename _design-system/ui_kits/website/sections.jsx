// Homepage sections. Compose bundle primitives (SectionHeading, Button, Card, Badge, MetricStat, Input).
const SNS = window.FranciscoAbadUltramarineDesignSystem_a2998e;
const ASSET = "../../assets";

// Hero · Option A (editorial puro): no eyebrow, no glow, no decorative frame.
// Headline leads; proof lives as a real credential line with champagne numbers.
const HERO_CREDS = [
  { text: "Ex Director General del IESS" },
  { num: "+32.000", text: "personas" },
  { num: "$10.000M", text: "administrados" },
  { text: "Fundador de CODEIS" },
];

function Hero({ onNavigate }) {
  const { Button } = SNS;
  return (
    <section style={{ padding: "calc(var(--space-9) + 40px) var(--container-pad-lg) var(--space-9)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-9)", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-black)", fontSize: "var(--fs-hero)", lineHeight: "var(--lh-tight)", letterSpacing: "var(--ls-tight)", color: "var(--text-primary)", margin: 0, textWrap: "balance" }}>
            Vuelvo alcanzable lo imposible.
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-book)", fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-body)", color: "var(--text-secondary)", margin: 0, maxWidth: "46ch" }}>
            Diseño y opero sistemas que hacen rendir a personas, empresas e instituciones. Desde adentro, codo a codo, con resultados que se miden.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}>
            {HERO_CREDS.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: "var(--border-strong)" }}>·</span>}
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {c.num && <b style={{ fontWeight: "var(--fw-bold)", color: "var(--metric)", fontVariantNumeric: "tabular-nums" }}>{c.num} </b>}{c.text}
                </span>
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", marginTop: "var(--space-2)" }}>
            <Button variant="primary" size="lg" onClick={() => onNavigate("trabaja")}>Trabajemos juntos</Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate("sobre-mi")}>Conoce mi trayectoria</Button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <img src={`${ASSET}/images/francisco-abad.webp`} alt="Francisco Abad" style={{ width: 360, maxWidth: "38vw", aspectRatio: "3/4", objectFit: "cover", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }} />
        </div>
      </div>
    </section>
  );
}

const TRAYECTORIA = [
  { label: "Formación", items: [
    { src: "lse-logo.png", legend: "MPA · London School of Economics", h: 46 },
    { src: "georgetown-logo.png", legend: "Global Competitiveness Leadership", h: 48 },
    { src: "upenn-logo.png", legend: "Global Social Impact House · UPenn", h: 38 },
  ]},
  { label: "Operación e impacto", items: [
    { src: "iess-logo.png", legend: "Director General 2025", h: 54 },
    { src: "codeis-logo.png", legend: "Fundador · +18.000 emprendedores", h: 40 },
    { src: "bidlab-logo.png", legend: "BID Lab · World Change Makers", h: 42 },
    { src: "hult-prize-logo.webp", legend: "Director Nacional Ecuador", h: 44 },
    { src: "oyw-logo.png", legend: "One Young World Ambassador", h: 46 },
  ]},
];

function Trayectoria() {
  return (
    <section className="theme-light" style={{ background: "var(--bg-base)", padding: "var(--space-9) var(--container-pad-lg)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", margin: "0 0 var(--space-7)" }}>Trayectoria</p>
        {TRAYECTORIA.map((g, gi) => (
          <div key={g.label} style={{ marginTop: gi ? "var(--space-7)" : 0, paddingTop: gi ? "var(--space-7)" : 0, borderTop: gi ? "1px solid var(--border-subtle)" : "none" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-secondary)", margin: "0 0 var(--space-5)" }}>{g.label}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-8)", alignItems: "flex-end" }}>
              {g.items.map((it) => (
                <div key={it.src} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", maxWidth: 150 }}>
                  <img src={`${ASSET}/logos-institucionales/${it.src}`} alt={it.legend} style={{ height: it.h, width: "auto", objectFit: "contain", opacity: 0.92 }} />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", lineHeight: 1.4, color: "var(--text-secondary)", textAlign: "center" }}>{it.legend}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const STATS = [
  { value: "32.000", prefix: "+", label: "empleados bajo liderazgo en el IESS" },
  { value: "10", prefix: "$", suffix: "B+", label: "presupuesto administrado" },
  { value: "18.000", prefix: "+", label: "emprendedores en +15 países" },
  { value: "36 → 78%", label: "eficiencia operativa en 6 meses" },
];

// ---- count-up hook ----
function useCountUp(target, start, active) {
  const [val, setVal] = React.useState(start);
  React.useEffect(() => {
    if (!active) return;
    const dur = 1500, t0 = performance.now();
    let raf;
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + (target - start) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return val;
}

const BARS = [
  { label: "Punto de partida", pct: 36, fill: "var(--slate-mid)" },
  { label: "Seis meses después", pct: 78, fill: "linear-gradient(90deg, var(--bronze), var(--champagne))" },
];
const MINI = [
  { target: 18000, start: 0, pre: "+", sep: true, suf: "", label: "emprendedores en +15 países" },
  { target: 400, start: 250, pre: "", sep: false, suf: "+", label: "mentores en la red CODEIS" },
  { target: 10, start: 0, pre: "$", sep: false, suf: "B+", label: "presupuesto administrado" },
];

function ProofBand() {
  const ref = React.useRef(null);
  const [active, setActive] = React.useState(false);
  const barRef = React.useRef(null);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } }, { threshold: 0.35 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const bigVal = useCountUp(78, 36, active);
  return (
    <section ref={ref} style={{ background: "var(--bg-elevated)", padding: "var(--space-9) var(--container-pad-lg)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, alignItems: "center", marginBottom: "var(--space-8)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "clamp(7rem,13vw,10rem)", lineHeight: 0.92, color: "var(--metric)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>
              {bigVal}%
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 17, color: "#fff" }}>De 36% a 78% en seis meses.</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>Con resultados que se miden.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {BARS.map((b) => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                  <span>{b.label}</span><b style={{ color: "#fff", fontVariantNumeric: "tabular-nums" }}>{b.pct}%</b>
                </div>
                <div style={{ height: 10, background: "var(--white-08)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, background: b.fill, width: active ? b.pct + "%" : "0%", transition: "width 1.6s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 36, paddingTop: "var(--space-6)", borderTop: "1px solid var(--border-subtle)" }}>
          {MINI.map((m) => {
            const v = useCountUp(m.target, m.start, active);
            const disp = m.sep ? v.toLocaleString("es") : v;
            return (
              <div key={m.label}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: 40, color: "var(--metric)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{m.pre}{disp}{m.suf}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.4 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const SERVICES = [
  { eyebrow: "Para founders y empresas", title: "BrainTech", body: "Vuelvo tu empresa AI-native e instalo su motor de GTM. AI Transformation y Revenue Engineering, con el framework AI Thinking (5 Cs).", items: ["El company brain", "Revenue & GTM Engineering", "Diagnóstico operativo"], cta: "Aplicar a un diagnóstico" },
  { eyebrow: "Emprendimiento y sostenibilidad", title: "ELAB", body: "Escuela y consultora de emprendimiento e innovación. Asesoría al sector social para generar earned income y volverse sostenible.", items: ["Programas de formación", "Growth OS", "Earned income para ONGs"], cta: "Ver programas" },
  { eyebrow: "Para empresas y eventos", title: "Keynotes y talleres", body: "Charlas y workshops sobre pensamiento de sistemas, IA aplicada y transformación institucional. Probado en la institución más difícil del país.", items: ["Keynotes para conferencias", "Workshops directivos", "Programas corporativos"], cta: "Cotizar una charla" },
];

function ServicesGrid({ onNavigate }) {
  const { Card, Badge, Button } = SNS;
  return (
    <section style={{ background: "var(--bg-base)", padding: "var(--space-9) var(--container-pad-lg)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", margin: "0 0 var(--space-3)" }}>Los tres motores</p>
          <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-h2)", letterSpacing: "var(--ls-tight)", color: "var(--text-primary)", margin: 0 }}>Instalo sistemas que componen</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-5)" }}>
          {SERVICES.map((s) => (
            <Card key={s.title} interactive padding="var(--space-7)" style={{ display: "flex", flexDirection: "column" }}>
              <Badge tone="accent" style={{ alignSelf: "flex-start", marginBottom: "var(--space-4)" }}>{s.eyebrow}</Badge>
              <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-title)", color: "var(--text-primary)", margin: "0 0 var(--space-3)" }}>{s.title}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-book)", fontSize: "14px", lineHeight: "var(--lh-body)", color: "var(--text-secondary)", margin: "0 0 var(--space-5)" }}>{s.body}</p>
              <ul style={{ listStyle: "none", margin: "0 0 var(--space-6)", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
                {s.items.map((it) => (
                  <li key={it} style={{ display: "flex", gap: "var(--space-2)", fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--accent)" }}>·</span>{it}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="sm" style={{ alignSelf: "flex-start", paddingLeft: 0, color: "var(--link)" }} onClick={() => onNavigate("contacto")}>{s.cta} →</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterBand() {
  const { Button, Input } = SNS;
  return (
    <section style={{ background: "var(--bg-elevated)", padding: "var(--space-9) var(--container-pad-lg)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", margin: "0 0 var(--space-3)" }}>Newsletter</p>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-h2)", letterSpacing: "var(--ls-tight)", color: "var(--text-primary)", margin: "0 0 var(--space-4)" }}>Desde Adentro</h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: "var(--lh-body)", color: "var(--text-secondary)", margin: "0 0 var(--space-6)" }}>
          La transformación mientras ocurre, semana a semana. Sistemas, IA aplicada y construcción visible. Sin relleno.
        </p>
        <div style={{ display: "flex", gap: "var(--space-2)", maxWidth: 440, margin: "0 auto", alignItems: "flex-start" }}>
          <Input type="email" placeholder="tu@email.com" style={{ flex: 1 }} aria-label="Email" />
          <Button variant="primary" style={{ flexShrink: 0 }}>Suscribirme</Button>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--space-3)" }}>Semanal, los viernes. Te das de baja cuando quieras.</p>
      </div>
    </section>
  );
}

const DESDE_FEATURED = {
  week: "Semana 3 de 7 · 6 jul 2026", title: "Diagnóstico operativo: dónde se rompe el flujo",
  body: "Mapeé el proceso de intake de punta a punta. El cuello no era la IA, era cómo entran los casos. Esta semana: instalar el primer agente sobre ese flujo.",
  progress: 43,
};
const DESDE_TIMELINE = [
  { date: "04 JUL", title: "Semana 2 · El company brain, primer borrador", sub: "Qué entra, qué se automatiza, qué se queda humano.", done: true },
  { date: "27 JUN", title: "Semana 1 · Acuerdo de qué es público", sub: "Cómo arranco una transformación en público sin quemar la confianza.", done: true },
  { date: "22 JUN", title: "Semana 0 · Por qué en vivo", sub: "El planteamiento de la serie y la apuesta.", done: true },
];

function DesdeAdentro() {
  const { Button, Input } = SNS;
  return (
    <section style={{ background: "var(--bg-base)", padding: "var(--space-9) var(--container-pad-lg)", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--space-5)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ED47A", boxShadow: "0 0 0 4px rgba(46,212,122,.2)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2ED47A" }}>En vivo · Serie Rafik</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "-0.025em", color: "#fff", margin: "0 0 var(--space-4)" }}>Desde Adentro</h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: 1.65, color: "var(--text-secondary)", margin: "0 0 var(--space-7)", maxWidth: "52ch" }}>
          No un caso pulido después. La transformación mientras ocurre: qué decido, qué falla, qué funciona.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "var(--space-8)", alignItems: "start" }}>
          <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)", padding: "var(--space-7)", boxShadow: "var(--shadow-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--space-5)" }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2ED47A", fontFamily: "var(--font-sans)" }}>En curso</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-sans)" }}>{DESDE_FEATURED.week}</span>
            </div>
            <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 24, color: "#fff", margin: "0 0 var(--space-4)", lineHeight: 1.25 }}>{DESDE_FEATURED.title}</h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--white-64)", lineHeight: 1.65, margin: "0 0 var(--space-5)" }}>{DESDE_FEATURED.body}</p>
            <div style={{ marginBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>
                <span>Avance de la serie</span><span>{DESDE_FEATURED.progress}%</span>
              </div>
              <div style={{ height: 4, background: "var(--white-12)", borderRadius: 999 }}>
                <div style={{ height: "100%", width: DESDE_FEATURED.progress + "%", background: "var(--ultramarine)", borderRadius: 999 }} />
              </div>
            </div>
            <Button variant="primary" size="sm">Leer la entrega completa</Button>
          </div>
          <div>
            <div style={{ position: "relative", paddingLeft: 24 }}>
              <div style={{ position: "absolute", left: 4, top: 5, bottom: 26, width: 1, background: "var(--border-subtle)" }} />
              {DESDE_TIMELINE.map((e, i) => (
                <div key={i} style={{ position: "relative", paddingBottom: "var(--space-5)" }}>
                  <div style={{ position: "absolute", left: -23, top: 4, width: 9, height: 9, borderRadius: "50%", background: e.done ? "var(--ultra-light)" : "var(--bg-base)", border: "1.5px solid var(--ultra-light)" }} />
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--metric)", fontVariantNumeric: "tabular-nums" }}>{e.date}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 15, color: "#fff", margin: "3px 0" }}>{e.title}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>{e.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-5)" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 var(--space-3)" }}>Recíbelo cada viernes.</p>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <Input type="email" placeholder="tu@email.com" style={{ flex: 1 }} aria-label="Email" />
                <Button variant="primary" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>Suscribirme</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, Trayectoria, ProofBand, ServicesGrid, DesdeAdentro, NewsletterBand });
