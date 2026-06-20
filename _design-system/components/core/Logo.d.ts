import * as React from "react";

/**
 * The Francisco Abad typographic wordmark, set in Gotham. Built from live type, never an image, so it recolors cleanly.
 */
export interface LogoProps {
  /** stacked (FRANCISCO above ABAD) or horizontal (inline). */
  layout?: "stacked" | "horizontal";
  /** Font-size of the dominant ABAD, in px. FRANCISCO scales from this. */
  size?: number;
  /** Background it sits on · picks the default ABAD color (Ultramarine on dark, Royal on light). */
  tone?: "dark" | "light";
  /** Override the ABAD color (e.g. var(--white) for monochrome on photos). */
  abadColor?: string;
  style?: React.CSSProperties;
}

export function Logo(props: LogoProps): JSX.Element;
