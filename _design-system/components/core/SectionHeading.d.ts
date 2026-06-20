import * as React from "react";

/** Editorial section header: accent eyebrow + bold title + optional intro paragraph. */
export interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  style?: React.CSSProperties;
}

export function SectionHeading(props: SectionHeadingProps): JSX.Element;
