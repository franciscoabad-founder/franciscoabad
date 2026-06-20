import * as React from "react";

/** Text input with label, hint and Ultramarine focus ring. Spreads native input props. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "style"> {
  label?: string;
  hint?: string;
  invalid?: boolean;
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
