"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  onScrollVelocity,
  prefersReducedMotion,
  registerGsap,
} from "@/lib/motion";

/**
 * Lenis driven by the GSAP ticker so ScrollTrigger and the scroll position
 * are updated on the same frame — the usual cause of jitter is running two
 * RAF loops. Smoothing is deliberately light: the page still has to feel
 * responsive to someone hunting for a phone number.
 */
export default function SmoothScroll() {
  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native scrolling on touch — smoothing there costs more than it gives.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /*
     * Scroll-velocity skew. Applied to `[data-vel]` wrappers — never to an
     * <img> directly, so it composes with the parallax and hover transforms
     * those elements already carry. Amplitude is deliberately tiny: it should
     * register as weight, not as an effect anyone can name.
     */
    const velTargets = gsap.utils.toArray<HTMLElement>("[data-vel]");
    const setters = velTargets.map((el) =>
      gsap.quickSetter(el, "skewY", "deg")
    );
    const stopVelocity = setters.length
      ? onScrollVelocity((v) => {
          const skew = gsap.utils.clamp(-1.8, 1.8, v * 2.4);
          setters.forEach((s) => s(skew));
        })
      : null;

    // Anchor links should hand off to Lenis rather than jumping.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.15 });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      stopVelocity?.();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
