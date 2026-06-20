import React from "react";

/**
 * Badge · small label for eyebrows, categories, status.
 * Default uses an Ultramarine tint. Use `metric` tone only for number-bearing chips.
 */
export function Badge({ tone = "accent", children, style = {}, ...rest }) {
  const tones = {
    accent: { background: "var(--ultramarine-12)", color: "var(--accent)", borderColor: "var(--ultramarine-24)" },
    solid: { background: "var(--accent)", color: "var(--accent-contrast)", borderColor: "transparent" },
    metric: { background: "var(--champagne-16)", color: "var(--metric)", borderColor: "rgba(181,152,90,0.32)" },
    neutral: { background: "var(--white-08)", color: "var(--text-secondary)", borderColor: "var(--border-subtle)" },
  };
  return (
    <span
      style={{
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
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
