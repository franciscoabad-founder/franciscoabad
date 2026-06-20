import React from "react";

/**
 * Input · text field on dark or light surfaces. Ultramarine focus ring.
 */
export function Input({
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-medium)",
            fontSize: "var(--fs-caption)",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--fw-book)",
          fontSize: "var(--fs-body)",
          color: "var(--text-primary)",
          background: "var(--bg-elevated)",
          border: "1px solid",
          borderColor: invalid
            ? "var(--danger)"
            : focus
            ? "var(--focus-ring)"
            : "var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
          outline: "none",
          boxShadow: focus && !invalid ? "0 0 0 3px var(--ultramarine-24)" : "none",
          transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)",
        }}
        {...rest}
      />
      {hint && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--fs-micro)",
            color: invalid ? "var(--danger)" : "var(--text-muted)",
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
