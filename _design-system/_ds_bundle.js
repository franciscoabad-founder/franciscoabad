/* @ds-bundle: {"format":3,"namespace":"FranciscoAbadUltramarineDesignSystem_a2998e","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"MetricStat","sourcePath":"components/data/MetricStat.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"f73d10d21383","components/core/Button.jsx":"990e553b84b8","components/core/Card.jsx":"64fc3b93a272","components/core/Logo.jsx":"a2eac5d1e504","components/core/SectionHeading.jsx":"7e0cf54956bd","components/data/MetricStat.jsx":"ebac2efc4908","components/forms/Input.jsx":"be462186b0c3","ui_kits/website/app.jsx":"288ec4ff0c3e","ui_kits/website/chrome.jsx":"3f27b20dbf20","ui_kits/website/sections.jsx":"675a9cab0ff9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FranciscoAbadUltramarineDesignSystem_a2998e = window.FranciscoAbadUltramarineDesignSystem_a2998e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge · small label for eyebrows, categories, status.
 * Default uses an Ultramarine tint. Use `metric` tone only for number-bearing chips.
 */
function Badge({
  tone = "accent",
  children,
  style = {},
  ...rest
}) {
  const tones = {
    accent: {
      background: "var(--ultramarine-12)",
      color: "var(--accent)",
      borderColor: "var(--ultramarine-24)"
    },
    solid: {
      background: "var(--accent)",
      color: "var(--accent-contrast)",
      borderColor: "transparent"
    },
    metric: {
      background: "var(--champagne-16)",
      color: "var(--metric)",
      borderColor: "rgba(181,152,90,0.32)"
    },
    neutral: {
      background: "var(--white-08)",
      color: "var(--text-secondary)",
      borderColor: "var(--border-subtle)"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      padding: "5px 11px",
      borderRadius: "var(--radius-pill)",
      border: "1px solid",
      lineHeight: 1,
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button · Ultramarine v5 primary action.
 * Variants: primary (filled Ultramarine), secondary (outline), ghost (text), metric (deep champagne, sparing).
 */
function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  onClick,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "8px 16px",
      fontSize: "13px"
    },
    md: {
      padding: "12px 26px",
      fontSize: "15px"
    },
    lg: {
      padding: "15px 34px",
      fontSize: "16px"
    }
  };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-medium)",
    lineHeight: 1,
    borderRadius: "var(--radius-button)",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)",
    whiteSpace: "nowrap",
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-contrast)",
      boxShadow: "var(--shadow-accent)"
    },
    secondary: {
      background: "transparent",
      color: "var(--accent)",
      borderColor: "var(--accent)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)"
    },
    metric: {
      background: "var(--metric)",
      color: "var(--ink)"
    }
  };
  const [hover, setHover] = React.useState(false);
  const hoverStyle = !disabled && hover ? hoverFor(variant) : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...variants[variant],
      ...hoverStyle,
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
function hoverFor(variant) {
  switch (variant) {
    case "primary":
      return {
        background: "var(--accent-hover)"
      };
    case "secondary":
      return {
        background: "var(--ultramarine-12)"
      };
    case "ghost":
      return {
        color: "var(--text-primary)"
      };
    case "metric":
      return {
        background: "var(--metric-hover)",
        color: "var(--white)"
      };
    default:
      return {};
  }
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card · elevated surface. Royal in dark mode, white in light mode.
 * Subtle border; accent border + lift on hover when `interactive`.
 */
function Card({
  interactive = false,
  padding = "var(--space-6)",
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: "var(--surface-card)",
      border: "1px solid",
      borderColor: hover ? "var(--border-accent)" : "var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      padding,
      boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
      transform: hover ? "translateY(-2px)" : "none",
      transition: "border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Logo · the Francisco Abad typographic wordmark.
 * FRANCISCO whispers (XLight 200, wide tracking), ABAD dominates (Black 900).
 * Rendered in Gotham. ABAD takes the accent color; on dark it is Ultramarine, on light it is Royal.
 */
function Logo({
  layout = "stacked",
  size = 48,
  tone = "dark",
  abadColor,
  style = {},
  ...rest
}) {
  const isStacked = layout === "stacked";
  // ABAD font-size = `size`; FRANCISCO scales down.
  const abadSize = size;
  const franciscoSize = isStacked ? size * 0.34 : size * 0.42;
  const accent = abadColor || (tone === "dark" ? "var(--ultramarine)" : "var(--royal)");
  const whisper = tone === "dark" ? "var(--text-secondary)" : "var(--slate-mid)";
  const francisco = {
    fontFamily: "var(--font-sans)",
    fontWeight: 200,
    fontSize: franciscoSize,
    letterSpacing: isStacked ? "0.34em" : "0.22em",
    color: whisper,
    lineHeight: 1,
    // optical: nudge the wide tracking so it left-aligns under ABAD
    textIndent: isStacked ? "0.34em" : 0
  };
  const abad = {
    fontFamily: "var(--font-sans)",
    fontWeight: 900,
    fontSize: abadSize,
    letterSpacing: "-0.01em",
    color: accent,
    lineHeight: 0.92
  };
  if (isStacked) {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: "inline-flex",
        flexDirection: "column",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      style: francisco
    }, "FRANCISCO"), /*#__PURE__*/React.createElement("span", {
      style: abad
    }, "ABAD"));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "baseline",
      gap: "0.4em",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: francisco
  }, "FRANCISCO"), /*#__PURE__*/React.createElement("span", {
    style: abad
  }, "ABAD"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SectionHeading · eyebrow + title + optional intro. The editorial header used across the site and decks.
 */
function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: align,
      maxWidth: align === "center" ? "640px" : "none",
      marginLeft: align === "center" ? "auto" : 0,
      marginRight: align === "center" ? "auto" : 0,
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "var(--fs-micro)",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--accent)",
      marginBottom: "var(--space-3)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fs-h2)",
      lineHeight: "var(--lh-heading)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-primary)",
      margin: 0,
      textWrap: "balance"
    }
  }, title), intro && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-book)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      marginTop: "var(--space-4)",
      marginBottom: 0,
      maxWidth: "60ch",
      marginLeft: align === "center" ? "auto" : 0,
      marginRight: align === "center" ? "auto" : 0,
      textWrap: "pretty"
    }
  }, intro));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricStat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MetricStat · a proof number in Champagne with a caption.
 * The signature data element of the brand. Champagne lives ONLY here and in KPIs.
 * Number is Gotham Black, tabular. Optional prefix/suffix (e.g. $, %, +, B+).
 */
function MetricStat({
  value,
  prefix = "",
  suffix = "",
  label,
  align = "left",
  size = "md",
  style = {},
  ...rest
}) {
  const sizes = {
    sm: "var(--fs-metric)",
    md: "clamp(2.5rem, 5vw, 3.25rem)",
    lg: "var(--fs-metric-hero)"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-black)",
      fontSize: sizes[size],
      lineHeight: 1,
      color: "var(--metric)",
      fontVariantNumeric: "tabular-nums",
      letterSpacing: "-0.01em"
    }
  }, prefix, value, suffix), label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-book)",
      fontSize: "var(--fs-caption)",
      color: "var(--text-secondary)",
      marginTop: "var(--space-2)",
      lineHeight: 1.4,
      maxWidth: "22ch",
      marginLeft: align === "center" ? "auto" : 0,
      marginRight: align === "center" ? "auto" : 0
    }
  }, label));
}
Object.assign(__ds_scope, { MetricStat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricStat.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input · text field on dark or light surfaces. Ultramarine focus ring.
 */
function Input({
  label,
  hint,
  type = "text",
  invalid = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `in-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "var(--fs-caption)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-book)",
      fontSize: "var(--fs-body)",
      color: "var(--text-primary)",
      background: "var(--bg-elevated)",
      border: "1px solid",
      borderColor: invalid ? "var(--danger)" : focus ? "var(--focus-ring)" : "var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      padding: "12px 14px",
      outline: "none",
      boxShadow: focus && !invalid ? "0 0 0 3px var(--ultramarine-24)" : "none",
      transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)"
    }
  }, rest)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-micro)",
      color: invalid ? "var(--danger)" : "var(--text-muted)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/app.jsx
try { (() => {
// Site orchestrator + secondary views. Ties chrome + sections into a clickable multi-view site.
const ANS = window.FranciscoAbadUltramarineDesignSystem_a2998e;
const ASSET2 = "../../assets";
function HomeView({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(Trayectoria, null), /*#__PURE__*/React.createElement(ProofBand, null), /*#__PURE__*/React.createElement(ServicesGrid, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(DesdeAdentro, null), /*#__PURE__*/React.createElement(NewsletterBand, null));
}
function PageHeader({
  eyebrow,
  title,
  intro
}) {
  const {
    SectionHeading
  } = ANS;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "calc(var(--space-9) + 30px) var(--container-pad-lg) var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: eyebrow,
    title: title,
    intro: intro
  })));
}
const CREDS = [{
  value: "MPA",
  label: "London School of Economics"
}, {
  value: "10",
  suffix: " años",
  label: "fundando y presidiendo CODEIS"
}, {
  value: "250–400",
  label: "mentores en la red CODEIS"
}];
function SobreMiView({
  onNavigate
}) {
  const {
    MetricStat,
    Button,
    Badge
  } = ANS;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "Sobre m\xED",
    title: "El constructor con pruebas",
    intro: "Construyo, innovo y transformo, con n\xFAmeros que lo prueban. El valor est\xE1 en haber dirigido y seguir operando sistemas reales bajo restricciones reales, no en estudiarlos desde afuera."
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "0 var(--container-pad-lg) var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1.3fr",
      gap: "var(--space-8)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${ASSET2}/images/francisco-abad-about.jpg`,
    alt: "Francisco Abad",
    style: {
      width: "100%",
      aspectRatio: "4/5",
      objectFit: "cover",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-md)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      margin: "0 0 var(--space-5)"
    }
  }, "Francisco Abad es emprendedor, innovador y builder-strategist ecuatoriano. Fundador de CODEIS, organizaci\xF3n desde la cual ha contribuido al fortalecimiento de m\xE1s de 18.000 emprendedores en m\xE1s de 15 pa\xEDses."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      margin: "0 0 var(--space-6)"
    }
  }, "Ex Director General del IESS, donde elev\xF3 la eficiencia operativa del 36 al 78 por ciento en seis meses. Hoy lidera BrainTech, firma AI-native de transformaci\xF3n de negocios. Construye desde adentro, codo a codo, con resultados medibles."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "var(--space-5)",
      padding: "var(--space-6) 0",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)",
      marginBottom: "var(--space-6)"
    }
  }, CREDS.map(c => /*#__PURE__*/React.createElement(MetricStat, {
    key: c.label,
    value: c.value,
    suffix: c.suffix || "",
    size: "sm",
    label: c.label
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      flexWrap: "wrap",
      marginBottom: "var(--space-6)"
    }
  }, ["Georgetown GCL", "UPenn GSIH", "Hult Prize", "One Young World", "WEF Global Shaper"].map(b => /*#__PURE__*/React.createElement(Badge, {
    key: b,
    tone: "neutral"
  }, b))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onNavigate("contacto")
  }, "Trabajemos juntos")))));
}
function TrabajaView({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "Trabaja conmigo",
    title: "Instalo sistemas que componen",
    intro: "No vendo labor ni campa\xF1as. Tres motores, un mismo m\xE9todo: vuelvo alcanzable lo t\xE9cnico y lo pruebo con n\xFAmeros."
  }), /*#__PURE__*/React.createElement(ServicesGrid, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(NewsletterBand, null));
}
function ContactoView() {
  const {
    Input,
    Button,
    Card,
    MetricStat
  } = ANS;
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "Contacto",
    title: "Hablemos de tu sistema",
    intro: "Cu\xE9ntame qu\xE9 quieres volver alcanzable. Reviso cada mensaje y respondo en 48 horas."
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "0 var(--container-pad-lg) var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-8)"
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "var(--space-6) 0"
    }
  }, /*#__PURE__*/React.createElement(MetricStat, {
    value: "48h",
    align: "center",
    label: ""
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fs-title)",
      color: "var(--text-primary)",
      margin: "var(--space-4) 0 var(--space-2)"
    }
  }, "Mensaje recibido"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      color: "var(--text-secondary)",
      margin: 0
    }
  }, "Te respondo en 48 horas. Gracias.")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Nombre",
    placeholder: "Tu nombre",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "tu@empresa.com",
    required: true
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Empresa u organizaci\xF3n",
    placeholder: "BrainTech, IESS, ELAB\u2026"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "14px",
      color: "var(--text-secondary)"
    }
  }, "\xBFQu\xE9 quieres volver alcanzable?"), /*#__PURE__*/React.createElement("textarea", {
    rows: 4,
    placeholder: "Cu\xE9ntame el reto\u2026",
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "16px",
      color: "var(--text-primary)",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      padding: "12px 14px",
      outline: "none",
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    type: "submit",
    style: {
      alignSelf: "flex-start"
    }
  }, "Enviar mensaje"))))));
}
function Site() {
  const [view, setView] = React.useState("home");
  const scrollRef = React.useRef(null);
  const navigate = v => {
    setView(v);
    if (scrollRef.current) scrollRef.current.scrollTo({
      top: 0,
      behavior: "auto"
    });
  };
  const views = {
    home: HomeView,
    "sobre-mi": SobreMiView,
    trabaja: TrabajaView,
    contacto: ContactoView
  };
  const Active = views[view] || HomeView;
  return /*#__PURE__*/React.createElement("div", {
    "data-site-scroll": true,
    ref: scrollRef,
    style: {
      height: "100vh",
      overflowY: "auto",
      background: "var(--bg-base)"
    }
  }, /*#__PURE__*/React.createElement(WebNav, {
    active: view,
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Active, {
    onNavigate: navigate
  })), /*#__PURE__*/React.createElement(WebFooter, {
    onNavigate: navigate
  }));
}
Object.assign(window, {
  Site
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/chrome.jsx
try { (() => {
// Website chrome · top navigation and footer. Composes Logo + Button from the bundle.
const NS = window.FranciscoAbadUltramarineDesignSystem_a2998e;
function WebNav({
  active,
  onNavigate
}) {
  const {
    Logo,
    Button
  } = NS;
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const root = document.querySelector("[data-site-scroll]") || window;
    const onScroll = () => {
      const y = root === window ? window.scrollY : root.scrollTop;
      setScrolled(y > 30);
    };
    root.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);
  const links = [{
    id: "home",
    label: "Home"
  }, {
    id: "sobre-mi",
    label: "Sobre mí"
  }, {
    id: "trabaja",
    label: "Trabaja conmigo"
  }, {
    id: "contacto",
    label: "Contacto"
  }];
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: scrolled ? "rgba(10,16,41,0.82)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
      transition: "background var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0 var(--container-pad-lg)",
      height: 76,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("home"),
    style: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    layout: "horizontal",
    size: 24,
    tone: "dark"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      gap: "var(--space-6)",
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l.id
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate(l.id),
    style: {
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: active === l.id ? "var(--text-primary)" : "var(--text-secondary)",
      transition: "color var(--dur-fast)"
    },
    onMouseEnter: e => e.currentTarget.style.color = "var(--accent)",
    onMouseLeave: e => e.currentTarget.style.color = active === l.id ? "var(--text-primary)" : "var(--text-secondary)"
  }, l.label)))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: () => onNavigate("contacto")
  }, "Hablemos"))));
}
function WebFooter({
  onNavigate
}) {
  const {
    Logo
  } = NS;
  const socials = ["LinkedIn", "Instagram", "YouTube", "Newsletter"];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--bg-sunken)",
      borderTop: "1px solid var(--border-subtle)",
      padding: "var(--space-9) var(--container-pad-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-6)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    layout: "stacked",
    size: 44,
    tone: "dark"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-book)",
      fontSize: "14px",
      lineHeight: "var(--lh-relaxed)",
      color: "var(--text-secondary)",
      margin: 0,
      maxWidth: 620
    }
  }, "Emprendedor, innovador y builder-strategist ecuatoriano. Dise\xF1o y opero sistemas que vuelven alcanzable lo imposible en personas, empresas e instituciones. Desde adentro, codo a codo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-6)",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, socials.map(s => /*#__PURE__*/React.createElement("a", {
    key: s,
    style: {
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--text-muted)"
    },
    onMouseEnter: e => e.currentTarget.style.color = "var(--accent)",
    onMouseLeave: e => e.currentTarget.style.color = "var(--text-muted)"
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      width: "100%",
      paddingTop: "var(--space-5)",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      color: "var(--text-muted)"
    }
  }, "\xA9 2026 Francisco Abad. Todos los derechos reservados."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 300,
      fontSize: "13px",
      color: "var(--text-muted)",
      fontStyle: "italic"
    }
  }, "Vuelvo alcanzable lo imposible."))));
}
Object.assign(window, {
  WebNav,
  WebFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/sections.jsx
try { (() => {
// Homepage sections. Compose bundle primitives (SectionHeading, Button, Card, Badge, MetricStat, Input).
const SNS = window.FranciscoAbadUltramarineDesignSystem_a2998e;
const ASSET = "../../assets";

// Hero · Option A (editorial puro): no eyebrow, no glow, no decorative frame.
// Headline leads; proof lives as a real credential line with champagne numbers.
const HERO_CREDS = [{
  text: "Ex Director General del IESS"
}, {
  num: "+32.000",
  text: "personas"
}, {
  num: "$10.000M",
  text: "administrados"
}, {
  text: "Fundador de CODEIS"
}];
function Hero({
  onNavigate
}) {
  const {
    Button
  } = SNS;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "calc(var(--space-9) + 40px) var(--container-pad-lg) var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr",
      gap: "var(--space-9)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-black)",
      fontSize: "var(--fs-hero)",
      lineHeight: "var(--lh-tight)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-primary)",
      margin: 0,
      textWrap: "balance"
    }
  }, "Vuelvo alcanzable lo imposible."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-book)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      margin: 0,
      maxWidth: "46ch"
    }
  }, "Dise\xF1o y opero sistemas que hacen rendir a personas, empresas e instituciones. Desde adentro, codo a codo, con resultados que se miden."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "10px 16px"
    }
  }, HERO_CREDS.map((c, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--border-strong)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      color: "var(--text-secondary)",
      whiteSpace: "nowrap"
    }
  }, c.num && /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: "var(--fw-bold)",
      color: "var(--metric)",
      fontVariantNumeric: "tabular-nums"
    }
  }, c.num, " "), c.text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      flexWrap: "wrap",
      marginTop: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: () => onNavigate("trabaja")
  }, "Trabajemos juntos"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    onClick: () => onNavigate("sobre-mi")
  }, "Conoce mi trayectoria"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${ASSET}/images/francisco-abad.webp`,
    alt: "Francisco Abad",
    style: {
      width: 360,
      maxWidth: "38vw",
      aspectRatio: "3/4",
      objectFit: "cover",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)"
    }
  }))));
}
const TRAYECTORIA = [{
  label: "Formación",
  items: [{
    src: "lse-logo.png",
    legend: "MPA · London School of Economics",
    h: 46
  }, {
    src: "georgetown-logo.png",
    legend: "Global Competitiveness Leadership",
    h: 48
  }, {
    src: "upenn-logo.png",
    legend: "Global Social Impact House · UPenn",
    h: 38
  }]
}, {
  label: "Operación e impacto",
  items: [{
    src: "iess-logo.png",
    legend: "Director General 2025",
    h: 54
  }, {
    src: "codeis-logo.png",
    legend: "Fundador · +18.000 emprendedores",
    h: 40
  }, {
    src: "bidlab-logo.png",
    legend: "BID Lab · World Change Makers",
    h: 42
  }, {
    src: "hult-prize-logo.webp",
    legend: "Director Nacional Ecuador",
    h: 44
  }, {
    src: "oyw-logo.png",
    legend: "One Young World Ambassador",
    h: 46
  }]
}];
function Trayectoria() {
  return /*#__PURE__*/React.createElement("section", {
    className: "theme-light",
    style: {
      background: "var(--bg-base)",
      padding: "var(--space-9) var(--container-pad-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--accent)",
      margin: "0 0 var(--space-7)"
    }
  }, "Trayectoria"), TRAYECTORIA.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: g.label,
    style: {
      marginTop: gi ? "var(--space-7)" : 0,
      paddingTop: gi ? "var(--space-7)" : 0,
      borderTop: gi ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--text-secondary)",
      margin: "0 0 var(--space-5)"
    }
  }, g.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-8)",
      alignItems: "flex-end"
    }
  }, g.items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.src,
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-3)",
      maxWidth: 150
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${ASSET}/logos-institucionales/${it.src}`,
    alt: it.legend,
    style: {
      height: it.h,
      width: "auto",
      objectFit: "contain",
      opacity: 0.92
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "11px",
      lineHeight: 1.4,
      color: "var(--text-secondary)",
      textAlign: "center"
    }
  }, it.legend))))))));
}
const STATS = [{
  value: "32.000",
  prefix: "+",
  label: "empleados bajo liderazgo en el IESS"
}, {
  value: "10",
  prefix: "$",
  suffix: "B+",
  label: "presupuesto administrado"
}, {
  value: "18.000",
  prefix: "+",
  label: "emprendedores en +15 países"
}, {
  value: "36 → 78%",
  label: "eficiencia operativa en 6 meses"
}];

// ---- count-up hook ----
function useCountUp(target, start, active) {
  const [val, setVal] = React.useState(start);
  React.useEffect(() => {
    if (!active) return;
    const dur = 1500,
      t0 = performance.now();
    let raf;
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1),
        e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + (target - start) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return val;
}
const BARS = [{
  label: "Punto de partida",
  pct: 36,
  fill: "var(--slate-mid)"
}, {
  label: "Seis meses después",
  pct: 78,
  fill: "linear-gradient(90deg, var(--bronze), var(--champagne))"
}];
const MINI = [{
  target: 18000,
  start: 0,
  pre: "+",
  sep: true,
  suf: "",
  label: "emprendedores en +15 países"
}, {
  target: 400,
  start: 250,
  pre: "",
  sep: false,
  suf: "+",
  label: "mentores en la red CODEIS"
}, {
  target: 10,
  start: 0,
  pre: "$",
  sep: false,
  suf: "B+",
  label: "presupuesto administrado"
}];
function ProofBand() {
  const ref = React.useRef(null);
  const [active, setActive] = React.useState(false);
  const barRef = React.useRef(null);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setActive(true);
        obs.disconnect();
      }
    }, {
      threshold: 0.35
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const bigVal = useCountUp(78, 36, active);
  return /*#__PURE__*/React.createElement("section", {
    ref: ref,
    style: {
      background: "var(--bg-elevated)",
      padding: "var(--space-9) var(--container-pad-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: 64,
      alignItems: "center",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 900,
      fontSize: "clamp(7rem,13vw,10rem)",
      lineHeight: 0.92,
      color: "var(--metric)",
      fontVariantNumeric: "tabular-nums",
      letterSpacing: "-0.03em"
    }
  }, bigVal, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      fontSize: 17,
      color: "#fff"
    }
  }, "De 36% a 78% en seis meses."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-secondary)",
      lineHeight: 1.5
    }
  }, "Con resultados que se miden.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, BARS.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.label
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13,
      color: "var(--text-secondary)",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, b.label), /*#__PURE__*/React.createElement("b", {
    style: {
      color: "#fff",
      fontVariantNumeric: "tabular-nums"
    }
  }, b.pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      background: "var(--white-08)",
      borderRadius: 999,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: 999,
      background: b.fill,
      width: active ? b.pct + "%" : "0%",
      transition: "width 1.6s cubic-bezier(0.16,1,0.3,1)"
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 36,
      paddingTop: "var(--space-6)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, MINI.map(m => {
    const v = useCountUp(m.target, m.start, active);
    const disp = m.sep ? v.toLocaleString("es") : v;
    return /*#__PURE__*/React.createElement("div", {
      key: m.label
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontWeight: 900,
        fontSize: 40,
        color: "var(--metric)",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1
      }
    }, m.pre, disp, m.suf), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text-secondary)",
        marginTop: 8,
        lineHeight: 1.4
      }
    }, m.label));
  }))));
}
const SERVICES = [{
  eyebrow: "Para founders y empresas",
  title: "BrainTech",
  body: "Vuelvo tu empresa AI-native e instalo su motor de GTM. AI Transformation y Revenue Engineering, con el framework AI Thinking (5 Cs).",
  items: ["El company brain", "Revenue & GTM Engineering", "Diagnóstico operativo"],
  cta: "Aplicar a un diagnóstico"
}, {
  eyebrow: "Emprendimiento y sostenibilidad",
  title: "ELAB",
  body: "Escuela y consultora de emprendimiento e innovación. Asesoría al sector social para generar earned income y volverse sostenible.",
  items: ["Programas de formación", "Growth OS", "Earned income para ONGs"],
  cta: "Ver programas"
}, {
  eyebrow: "Para empresas y eventos",
  title: "Keynotes y talleres",
  body: "Charlas y workshops sobre pensamiento de sistemas, IA aplicada y transformación institucional. Probado en la institución más difícil del país.",
  items: ["Keynotes para conferencias", "Workshops directivos", "Programas corporativos"],
  cta: "Cotizar una charla"
}];
function ServicesGrid({
  onNavigate
}) {
  const {
    Card,
    Badge,
    Button
  } = SNS;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bg-base)",
      padding: "var(--space-9) var(--container-pad-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--accent)",
      margin: "0 0 var(--space-3)"
    }
  }, "Los tres motores"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fs-h2)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-primary)",
      margin: 0
    }
  }, "Instalo sistemas que componen")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "var(--space-5)"
    }
  }, SERVICES.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.title,
    interactive: true,
    padding: "var(--space-7)",
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    style: {
      alignSelf: "flex-start",
      marginBottom: "var(--space-4)"
    }
  }, s.eyebrow), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fs-title)",
      color: "var(--text-primary)",
      margin: "0 0 var(--space-3)"
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-book)",
      fontSize: "14px",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      margin: "0 0 var(--space-5)"
    }
  }, s.body), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: "0 0 var(--space-6)",
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      flex: 1
    }
  }, s.items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it,
    style: {
      display: "flex",
      gap: "var(--space-2)",
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, "\xB7"), it))), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    style: {
      alignSelf: "flex-start",
      paddingLeft: 0,
      color: "var(--link)"
    },
    onClick: () => onNavigate("contacto")
  }, s.cta, " \u2192"))))));
}
function NewsletterBand() {
  const {
    Button,
    Input
  } = SNS;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bg-elevated)",
      padding: "var(--space-9) var(--container-pad-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 600,
      margin: "0 auto",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--accent)",
      margin: "0 0 var(--space-3)"
    }
  }, "Newsletter"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fs-h2)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-primary)",
      margin: "0 0 var(--space-4)"
    }
  }, "Desde Adentro"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "16px",
      lineHeight: "var(--lh-body)",
      color: "var(--text-secondary)",
      margin: "0 0 var(--space-6)"
    }
  }, "La transformaci\xF3n mientras ocurre, semana a semana. Sistemas, IA aplicada y construcci\xF3n visible. Sin relleno."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      maxWidth: 440,
      margin: "0 auto",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    type: "email",
    placeholder: "tu@email.com",
    style: {
      flex: 1
    },
    "aria-label": "Email"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    style: {
      flexShrink: 0
    }
  }, "Suscribirme")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      color: "var(--text-muted)",
      marginTop: "var(--space-3)"
    }
  }, "Semanal, los viernes. Te das de baja cuando quieras.")));
}
const DESDE_FEATURED = {
  week: "Semana 3 de 7 · 6 jul 2026",
  title: "Diagnóstico operativo: dónde se rompe el flujo",
  body: "Mapeé el proceso de intake de punta a punta. El cuello no era la IA, era cómo entran los casos. Esta semana: instalar el primer agente sobre ese flujo.",
  progress: 43
};
const DESDE_TIMELINE = [{
  date: "04 JUL",
  title: "Semana 2 · El company brain, primer borrador",
  sub: "Qué entra, qué se automatiza, qué se queda humano.",
  done: true
}, {
  date: "27 JUN",
  title: "Semana 1 · Acuerdo de qué es público",
  sub: "Cómo arranco una transformación en público sin quemar la confianza.",
  done: true
}, {
  date: "22 JUN",
  title: "Semana 0 · Por qué en vivo",
  sub: "El planteamiento de la serie y la apuesta.",
  done: true
}];
function DesdeAdentro() {
  const {
    Button,
    Input
  } = SNS;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bg-base)",
      padding: "var(--space-9) var(--container-pad-lg)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#2ED47A",
      boxShadow: "0 0 0 4px rgba(46,212,122,.2)",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      fontSize: 12,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "#2ED47A"
    }
  }, "En vivo \xB7 Serie Rafik")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 900,
      fontSize: "clamp(2rem,4vw,3rem)",
      letterSpacing: "-0.025em",
      color: "#fff",
      margin: "0 0 var(--space-4)"
    }
  }, "Desde Adentro"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 16,
      lineHeight: 1.65,
      color: "var(--text-secondary)",
      margin: "0 0 var(--space-7)",
      maxWidth: "52ch"
    }
  }, "No un caso pulido despu\xE9s. La transformaci\xF3n mientras ocurre: qu\xE9 decido, qu\xE9 falla, qu\xE9 funciona."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.15fr 1fr",
      gap: "var(--space-8)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      padding: "var(--space-7)",
      boxShadow: "var(--shadow-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#2ED47A",
      fontFamily: "var(--font-sans)"
    }
  }, "En curso"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12,
      fontFamily: "var(--font-sans)"
    }
  }, DESDE_FEATURED.week)), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 700,
      fontSize: 24,
      color: "#fff",
      margin: "0 0 var(--space-4)",
      lineHeight: 1.25
    }
  }, DESDE_FEATURED.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      color: "var(--white-64)",
      lineHeight: 1.65,
      margin: "0 0 var(--space-5)"
    }
  }, DESDE_FEATURED.body), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "var(--text-muted)",
      marginBottom: 8,
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Avance de la serie"), /*#__PURE__*/React.createElement("span", null, DESDE_FEATURED.progress, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: "var(--white-12)",
      borderRadius: 999
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: DESDE_FEATURED.progress + "%",
      background: "var(--ultramarine)",
      borderRadius: 999
    }
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "Leer la entrega completa")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      paddingLeft: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 4,
      top: 5,
      bottom: 26,
      width: 1,
      background: "var(--border-subtle)"
    }
  }), DESDE_TIMELINE.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: "relative",
      paddingBottom: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: -23,
      top: 4,
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: e.done ? "var(--ultra-light)" : "var(--bg-base)",
      border: "1.5px solid var(--ultra-light)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--metric)",
      fontVariantNumeric: "tabular-nums"
    }
  }, e.date), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      fontSize: 15,
      color: "#fff",
      margin: "3px 0"
    }
  }, e.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      color: "var(--text-muted)",
      lineHeight: 1.4
    }
  }, e.sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-secondary)",
      margin: "0 0 var(--space-3)"
    }
  }, "Rec\xEDbelo cada viernes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    type: "email",
    placeholder: "tu@email.com",
    style: {
      flex: 1
    },
    "aria-label": "Email"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    style: {
      flexShrink: 0,
      whiteSpace: "nowrap"
    }
  }, "Suscribirme")))))));
}
Object.assign(window, {
  Hero,
  Trayectoria,
  ProofBand,
  ServicesGrid,
  DesdeAdentro,
  NewsletterBand
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.MetricStat = __ds_scope.MetricStat;

__ds_ns.Input = __ds_scope.Input;

})();
