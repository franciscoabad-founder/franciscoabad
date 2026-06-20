import * as React from "react";

/**
 * Primary action button in the Ultramarine v5 system. Filled Ultramarine by default; never use the champagne `metric` variant as a general CTA.
 */
export interface ButtonProps {
  /** Visual style. `metric` (champagne) is reserved and rarely used for actions. */
  variant?: "primary" | "secondary" | "ghost" | "metric";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
