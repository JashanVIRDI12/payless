"use client";

import { useRef } from "react";
import gsap from "gsap";
import {
  animationsEnabled,
  onScrollVelocity,
  registerGsap,
  useIsoLayoutEffect,
} from "@/lib/motion";

/**
 * Only places Payless states it serves: the corridor runs Deep Cove to
 * Lillooet, with dispatch at the four named towns. Nothing invented.
 */
const PLACES = [
  "Deep Cove",
  "North Vancouver",
  "Squamish",
  "Whistler",
  "Pemberton",
  "Lillooet",
];

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (!track.current || !animationsEnabled()) return;
    registerGsap();

    const ctx = gsap.context(() => {
      // The track holds the list twice, so -50% is exactly one full cycle.
      const tl = gsap.to(track.current, {
        xPercent: -50,
        duration: 38,
        ease: "none",
        repeat: -1,
      });

      // Scroll speed adds to the base drift and flips its direction, so the
      // band reads as something the page is dragging past rather than a loop
      // running on its own clock.
      const stop = onScrollVelocity((v) => {
        const boost = 1 + Math.abs(v) * 5;
        tl.timeScale(v < -0.02 ? -boost : boost);
      });

      return () => {
        stop();
        tl.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  const strip = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {PLACES.map((place) => (
        <span key={place} className="flex items-center">
          <span className="u-display px-6 text-[clamp(1.5rem,3.4vw,2.75rem)] text-paper/85 md:px-9">
            {place}
          </span>
          <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-signal" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={root}
      className="relative overflow-hidden border-y border-white/10 bg-ink py-6 md:py-8"
    >
      {/* Edges fade into the section colour so the loop has no visible seam. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent md:w-40"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent md:w-40"
      />

      <div ref={track} className="flex w-max will-change-transform">
        {strip}
        {strip}
      </div>

      {/* The readable, non-animated version of the same fact. */}
      <p className="sr-only">
        Serving the Sea-to-Sky Corridor from Deep Cove to Lillooet, including
        North Vancouver, Squamish, Whistler and Pemberton.
      </p>
    </div>
  );
}
