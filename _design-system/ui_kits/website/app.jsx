// Site orchestrator + secondary views. Ties chrome + sections into a clickable multi-view site.
const ANS = window.FranciscoAbadUltramarineDesignSystem_a2998e;
const ASSET2 = "../../assets";

function HomeView({ onNavigate }) {
  return (
    <React.Fragment>
      <Hero onNavigate={onNavigate} />
      <Trayectoria />
      <ProofBand />
      <ServicesGrid onNavigate={onNavigate} />
      <DesdeAdentro />
      <NewsletterBand />
    </React.Fragment>
  );
}

function PageHeader({ eyebrow, title, intro }) {
  const { SectionHeading } = ANS;
  return (
    <section style={{ padding: "calc(var(--space-9) + 30px) var(--container-pad-lg) var(--space-7)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
      </div>
    </section>
  );
}

const CREDS = [
  { value: "MPA", label: "London School of Economics" },
  { value: "10", suffix: " años", label: "fundando y presidiendo CODEIS" },
  { value: "250–400", label: "mentores en la red CODEIS" },
];

function SobreMiView({ onNavigate }) {
  const { MetricStat, Button, Badge } = ANS;
  return (
    <React.Fragment>
      <PageHeader eyebrow="Sobre mí" title="El constructor con pruebas" intro="Construyo, innovo y transformo, con números que lo prueban. El valor está en haber dirigido y seguir operando sistemas reales bajo restricciones reales, no en estudiarlos desde afuera." />
      <section style={{ padding: "0 var(--container-pad-lg) var(--space-9)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "var(--space-8)", alignItems: "start" }}>
          <img src={`${ASSET2}/images/francisco-abad-about.jpg`} alt="Francisco Abad" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)" }} />
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-body)", color: "var(--text-secondary)", margin: "0 0 var(--space-5)" }}>
              Francisco Abad es emprendedor, innovador y builder-strategist ecuatoriano. Fundador de CODEIS, organización desde la cual ha contribuido al fortalecimiento de más de 18.000 emprendedores en más de 15 países.
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-body)", color: "var(--text-secondary)", margin: "0 0 var(--space-6)" }}>
              Ex Director General del IESS, donde elevó la eficiencia operativa del 36 al 78 por ciento en seis meses. Hoy lidera BrainTech, firma AI-native de transformación de negocios. Construye desde adentro, codo a codo, con resultados medibles.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-5)", padding: "var(--space-6) 0", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", marginBottom: "var(--space-6)" }}>
              {CREDS.map((c) => <MetricStat key={c.label} value={c.value} suffix={c.suffix || ""} size="sm" label={c.label} />)}
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
              {["Georgetown GCL", "UPenn GSIH", "Hult Prize", "One Young World", "WEF Global Shaper"].map((b) => <Badge key={b} tone="neutral">{b}</Badge>)}
            </div>
            <Button variant="primary" onClick={() => onNavigate("contacto")}>Trabajemos juntos</Button>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

function TrabajaView({ onNavigate }) {
  return (
    <React.Fragment>
      <PageHeader eyebrow="Trabaja conmigo" title="Instalo sistemas que componen" intro="No vendo labor ni campañas. Tres motores, un mismo método: vuelvo alcanzable lo técnico y lo pruebo con números." />
      <ServicesGrid onNavigate={onNavigate} />
      <NewsletterBand />
    </React.Fragment>
  );
}

function ContactoView() {
  const { Input, Button, Card, MetricStat } = ANS;
  const [sent, setSent] = React.useState(false);
  return (
    <React.Fragment>
      <PageHeader eyebrow="Contacto" title="Hablemos de tu sistema" intro="Cuéntame qué quieres volver alcanzable. Reviso cada mensaje y respondo en 48 horas." />
      <section style={{ padding: "0 var(--container-pad-lg) var(--space-10)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Card padding="var(--space-8)">
            {sent ? (
              <div style={{ textAlign: "center", padding: "var(--space-6) 0" }}>
                <MetricStat value="48h" align="center" label="" />
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-title)", color: "var(--text-primary)", margin: "var(--space-4) 0 var(--space-2)" }}>Mensaje recibido</h3>
                <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-secondary)", margin: 0 }}>Te respondo en 48 horas. Gracias.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
                  <Input label="Nombre" placeholder="Tu nombre" required />
                  <Input label="Email" type="email" placeholder="tu@empresa.com" required />
                </div>
                <Input label="Empresa u organización" placeholder="BrainTech, IESS, ELAB…" />
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <label style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "14px", color: "var(--text-secondary)" }}>¿Qué quieres volver alcanzable?</label>
                  <textarea rows={4} placeholder="Cuéntame el reto…" style={{ fontFamily: "var(--font-sans)", fontSize: "16px", color: "var(--text-primary)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "12px 14px", outline: "none", resize: "vertical" }} />
                </div>
                <Button variant="primary" size="lg" type="submit" style={{ alignSelf: "flex-start" }}>Enviar mensaje</Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </React.Fragment>
  );
}

function Site() {
  const [view, setView] = React.useState("home");
  const scrollRef = React.useRef(null);
  const navigate = (v) => {
    setView(v);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
  };
  const views = { home: HomeView, "sobre-mi": SobreMiView, trabaja: TrabajaView, contacto: ContactoView };
  const Active = views[view] || HomeView;
  return (
    <div data-site-scroll ref={scrollRef} style={{ height: "100vh", overflowY: "auto", background: "var(--bg-base)" }}>
      <WebNav active={view} onNavigate={navigate} />
      <main>
        <Active onNavigate={navigate} />
      </main>
      <WebFooter onNavigate={navigate} />
    </div>
  );
}

Object.assign(window, { Site });
