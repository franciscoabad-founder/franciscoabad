import * as React from "react";

/** Small uppercase label for eyebrows, categories and status pills. */
export interface BadgeProps {
  /** accent (default tint) · solid · metric (champagne, for number chips) · neutral. */
  tone?: "accent" | "solid" | "metric" | "neutral";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
