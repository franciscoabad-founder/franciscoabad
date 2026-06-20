import React from "react";

/**
 * Logo · the Francisco Abad typographic wordmark.
 * FRANCISCO whispers (XLight 200, wide tracking), ABAD dominates (Black 900).
 * Rendered in Gotham. ABAD takes the accent color; on dark it is Ultramarine, on light it is Royal.
 */
export function Logo({
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
    textIndent: isStacked ? "0.34em" : 0,
  };
  const abad = {
    fontFamily: "var(--font-sans)",
    fontWeight: 900,
    fontSize: abadSize,
    letterSpacing: "-0.01em",
    color: accent,
    lineHeight: 0.92,
  };

  if (isStacked) {
    return (
      <span style={{ display: "inline-flex", flexDirection: "column", ...style }} {...rest}>
        <span style={francisco}>FRANCISCO</span>
        <span style={abad}>ABAD</span>
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.4em", ...style }} {...rest}>
      <span style={francisco}>FRANCISCO</span>
      <span style={abad}>ABAD</span>
    </span>
  );
}
