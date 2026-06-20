// Website chrome · top navigation and footer. Composes Logo + Button from the bundle.
const NS = window.FranciscoAbadUltramarineDesignSystem_a2998e;

function WebNav({ active, onNavigate }) {
  const { Logo, Button } = NS;
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const root = document.querySelector("[data-site-scroll]") || window;
    const onScroll = () => {
      const y = root === window ? window.scrollY : root.scrollTop;
      setScrolled(y > 30);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "home", label: "Home" },
    { id: "sobre-mi", label: "Sobre mí" },
    { id: "trabaja", label: "Trabaja conmigo" },
    { id: "contacto", label: "Contacto" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(10,16,41,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
        transition: "background var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "0 var(--container-pad-lg)",
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a onClick={() => onNavigate("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Logo layout="horizontal" size={24} tone="dark" />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-7)" }}>
          <ul style={{ display: "flex", gap: "var(--space-6)", listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l) => (
              <li key={l.id}>
                <a
                  onClick={() => onNavigate(l.id)}
                  style={{
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontWeight: "var(--fw-medium)",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: active === l.id ? "var(--text-primary)" : "var(--text-secondary)",
                    transition: "color var(--dur-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = active === l.id ? "var(--text-primary)" : "var(--text-secondary)")}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button variant="primary" size="sm" onClick={() => onNavigate("contacto")}>
            Hablemos
          </Button>
        </div>
      </div>
    </nav>
  );
}

function WebFooter({ onNavigate }) {
  const { Logo } = NS;
  const socials = ["LinkedIn", "Instagram", "YouTube", "Newsletter"];
  return (
    <footer style={{ background: "var(--bg-sunken)", borderTop: "1px solid var(--border-subtle)", padding: "var(--space-9) var(--container-pad-lg)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-6)", textAlign: "center" }}>
        <Logo layout="stacked" size={44} tone="dark" />
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-book)", fontSize: "14px", lineHeight: "var(--lh-relaxed)", color: "var(--text-secondary)", margin: 0, maxWidth: 620 }}>
          Emprendedor, innovador y builder-strategist ecuatoriano. Diseño y opero sistemas que vuelven alcanzable lo imposible en personas, empresas e instituciones. Desde adentro, codo a codo.
        </p>
        <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap", justifyContent: "center" }}>
          {socials.map((s) => (
            <a key={s} style={{ cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}
               onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
               onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
              {s}
            </a>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--border-subtle)", width: "100%", paddingTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--text-muted)" }}>© 2026 Francisco Abad. Todos los derechos reservados.</span>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>Vuelvo alcanzable lo imposible.</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { WebNav, WebFooter });
