import * as React from "react";

/** Elevated surface · Royal in dark mode, white in light. Subtle blue-tinted shadow. */
export interface CardProps {
  /** When true, lifts and shows an Ultramarine border on hover. */
  interactive?: boolean;
  /** CSS padding (token or value). Defaults to --space-6 (32px). */
  padding?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
