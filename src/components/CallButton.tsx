"use client";

import { useRef } from "react";
import gsap from "gsap";
import { PRIMARY } from "@/lib/site";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";

type Variant = "signal" | "invert" | "outline";

const VARIANTS: Record<Variant, string> = {
  // Brand orange with navy text — the emergency action, taken from the logo.
  signal: "bg-signal text-ink hover:bg-signal-soft",
  invert: "bg-paper text-ink hover:bg-white",
  outline: "border border-current text-current hover:bg-current/10",
};

export default function CallButton({
  variant = "signal",
  showNumber = false,
  className = "",
  label = "Call now",
}: {
  variant?: Variant;
  showNumber?: boolean;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  /**
   * Magnetic pull, desktop only and deliberately tiny (max ~5px). Set up
   * lazily on first hover so no work happens for people who never hover.
   */
  const ensureQuickTo = () => {
    if (xTo.current || !ref.current) return;
    registerGsap();
    xTo.current = gsap.quickTo(ref.current, "x", { duration: 0.5, ease: "brand" });
    yTo.current = gsap.quickTo(ref.current, "y", { duration: 0.5, ease: "brand" });
  };

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    ensureQuickTo();
    const r = e.currentTarget.getBoundingClientRect();
    xTo.current?.(((e.clientX - r.left) / r.width - 0.5) * 10);
    yTo.current?.(((e.clientY - r.top) / r.height - 0.5) * 6);
  };

  /*
   * Release with inertia rather than a plain tween, so the button settles back
   * with a little weight instead of snapping. InertiaPlugin needs the velocity
   * GSAP has been tracking, which is why the quickTo setters above are what
   * moved it in the first place.
   */
  const onLeave = () => {
    if (!ref.current || prefersReducedMotion()) {
      xTo.current?.(0);
      yTo.current?.(0);
      return;
    }
    gsap.to(ref.current, {
      inertia: {
        x: { velocity: "auto", end: 0 },
        y: { velocity: "auto", end: 0 },
      },
      duration: 0.6,
    });
  };

  return (
    <a
      ref={ref}
      href={`tel:${PRIMARY.tel}`}
      data-cursor="call"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={`Call Payless Towing, ${PRIMARY.phone}`}
      className={`group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium tracking-wide transition-colors duration-300 md:px-6 ${VARIANTS[variant]} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-rotate-12"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
      </svg>
      <span className="uppercase">{label}</span>
      {showNumber && (
        <span className="hidden font-medium tabular-nums sm:inline">
          {PRIMARY.phone}
        </span>
      )}
    </a>
  );
}
