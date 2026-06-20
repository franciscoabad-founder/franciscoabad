import * as React from "react";

/**
 * A proof number rendered in Champagne (Gotham Black, tabular) with a caption. The brand's signature data element · champagne is reserved for this and KPIs.
 */
export interface MetricStatProps {
  /** The number itself, pre-formatted (e.g. "32.000", "10", "36 → 78"). */
  value: React.ReactNode;
  prefix?: string;
  suffix?: string;
  label?: React.ReactNode;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function MetricStat(props: MetricStatProps): JSX.Element;
