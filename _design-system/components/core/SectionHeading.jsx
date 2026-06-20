import React from "react";

/**
 * SectionHeading · eyebrow + title + optional intro. The editorial header used across the site and decks.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  style = {},
  ...rest
}) {
  return (
    <div
      style={{
        textAlign: align,
        maxWidth: align === "center" ? "640px" : "none",
        marginLeft: align === "center" ? "auto" : 0,
        marginRight: align === "center" ? "auto" : 0,
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-medium)",
            fontSize: "var(--fs-micro)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--accent)",
            marginBottom: "var(--space-3)",
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--fw-bold)",
          fontSize: "var(--fs-h2)",
          lineHeight: "var(--lh-heading)",
          letterSpacing: "var(--ls-tight)",
          color: "var(--text-primary)",
          margin: 0,
          textWrap: "balance",
        }}
      >
        {title}
      </h2>
      {intro && (
        <p
          style={{
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
            textWrap: "pretty",
          }}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
