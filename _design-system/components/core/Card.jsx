import React from "react";

/**
 * Card · elevated surface. Royal in dark mode, white in light mode.
 * Subtle border; accent border + lift on hover when `interactive`.
 */
export function Card({ interactive = false, padding = "var(--space-6)", children, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        background: "var(--surface-card)",
        border: "1px solid",
        borderColor: hover ? "var(--border-accent)" : "var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        padding,
        boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
