"use client";

// Adapted from the Hyperiux Vault component supplied by the user.
// Original visual: expanding circular fill, masked duplicate label and exchanging arrows.
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArrowFillButtonOwnProps {
  btnText?: string;
  href?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  fillBgColor?: string;
  fillTextColor?: string;
  hoverFillBgColor?: string;
  hoverFillTextColor?: string;
  arrowColor?: string;
  hoverArrowColor?: string;
  animationDuration?: number;
  fillOnHover?: boolean;
}
export type ArrowFillButtonProps = ArrowFillButtonOwnProps & Omit<ComponentPropsWithoutRef<"a">, keyof ArrowFillButtonOwnProps>;

export default function ArrowFillButton({
  btnText = "Call for assistance", href = "tel:+16049884176", className,
  bgColor = "#FC5000", textColor = "#042054", fillBgColor = "#042054",
  fillTextColor = "#FFFFFF", hoverFillBgColor = "#042054", hoverFillTextColor = "#FFFFFF",
  arrowColor, hoverArrowColor, animationDuration = 450, fillOnHover = true, style, ...props
}: ArrowFillButtonProps) {
  const colors = {
    "--btn-bg": bgColor, "--btn-text": textColor, "--btn-fill-bg": fillBgColor,
    "--btn-fill-text": fillTextColor, "--btn-fill-bg-hover": hoverFillBgColor,
    "--btn-fill-text-hover": hoverFillTextColor, "--btn-arrow": arrowColor ?? fillTextColor,
    "--btn-arrow-hover": hoverArrowColor ?? hoverFillTextColor,
    "--btn-duration": `${Math.max(0, animationDuration)}ms`, ...style,
  } as CSSProperties;
  return <a {...props} href={href} className={cn("arrow-fill-button", className)} data-fill={fillOnHover} style={colors}>
    <span className="arrow-button-label">{btnText}</span>
    <span className="arrow-button-fill" aria-hidden="true" />
    <span className="arrow-button-label-copy" aria-hidden="true">{btnText}</span>
    <span className="arrow-button-circle" aria-hidden="true"><ArrowRight className="arrow-in" strokeWidth={1.7} /><ArrowRight className="arrow-out" strokeWidth={1.7} /></span>
  </a>;
}
