import React from "react";

/**
 * Button · Ultramarine v5 primary action.
 * Variants: primary (filled Ultramarine), secondary (outline), ghost (text), metric (deep champagne, sparing).
 */
export function Button({
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
    sm: { padding: "8px 16px", fontSize: "13px" },
    md: { padding: "12px 26px", fontSize: "15px" },
    lg: { padding: "15px 34px", fontSize: "16px" },
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
    ...sizes[size],
  };

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-contrast)",
      boxShadow: "var(--shadow-accent)",
    },
    secondary: {
      background: "transparent",
      color: "var(--accent)",
      borderColor: "var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
    },
    metric: {
      background: "var(--metric)",
      color: "var(--ink)",
    },
  };

  const [hover, setHover] = React.useState(false);
  const hoverStyle = !disabled && hover ? hoverFor(variant) : {};

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...hoverStyle, ...style }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

function hoverFor(variant) {
  switch (variant) {
    case "primary":
      return { background: "var(--accent-hover)" };
    case "secondary":
      return { background: "var(--ultramarine-12)" };
    case "ghost":
      return { color: "var(--text-primary)" };
    case "metric":
      return { background: "var(--metric-hover)", color: "var(--white)" };
    default:
      return {};
  }
}
