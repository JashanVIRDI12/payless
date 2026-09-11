"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";

const LABELS: Record<string, string> = { view: "View", call: "Call" };
const CURSOR_QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";
function subscribeCursorPreference(onChange: () => void) {
  const query = window.matchMedia(CURSOR_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const cursorSnapshot = () => window.matchMedia(CURSOR_QUERY).matches;
const serverCursorSnapshot = () => false;

/**
 * Desktop-only pointer companion. The native cursor is never hidden, so
 * nothing is lost if this fails to mount — it only adds a small ring that
 * grows into a labelled disc over images and call actions.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const enabled = useSyncExternalStore(subscribeCursorPreference, cursorSnapshot, serverCursorSnapshot);

  useEffect(() => {
    if (!enabled || !dot.current) return;

    const xTo = gsap.quickTo(dot.current, "x", { duration: 0.42, ease: "power3" });
    const yTo = gsap.quickTo(dot.current, "y", { duration: 0.42, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const hit = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor]"
      );
      setLabel(hit ? LABELS[hit.dataset.cursor ?? ""] ?? null : null);
    };

    const onLeave = () => setLabel(null);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden lg:block"
    >
      <div
        className={`flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          label
            ? "-ml-8 -mt-8 h-16 w-16 border-transparent bg-signal"
            : "-ml-2 -mt-2 h-4 w-4 border-ink/35 bg-transparent"
        }`}
      >
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.14em] text-ink transition-opacity duration-300 ${
            label ? "opacity-100" : "opacity-0"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
