import React from "react";

/**
 * MetricStat · a proof number in Champagne with a caption.
 * The signature data element of the brand. Champagne lives ONLY here and in KPIs.
 * Number is Gotham Black, tabular. Optional prefix/suffix (e.g. $, %, +, B+).
 */
export function MetricStat({
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
    lg: "var(--fs-metric-hero)",
  };
  return (
    <div style={{ textAlign: align, ...style }} {...rest}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--fw-black)",
          fontSize: sizes[size],
          lineHeight: 1,
          color: "var(--metric)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em",
        }}
      >
        {prefix}{value}{suffix}
      </div>
      {label && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-book)",
            fontSize: "var(--fs-caption)",
            color: "var(--text-secondary)",
            marginTop: "var(--space-2)",
            lineHeight: 1.4,
            maxWidth: "22ch",
            marginLeft: align === "center" ? "auto" : 0,
            marginRight: align === "center" ? "auto" : 0,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
