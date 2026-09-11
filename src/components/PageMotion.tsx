"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { registerGsap } from "@/lib/motion";

/**
 * Every scroll reveal on the site, in one place.
 *
 * Components stay server components: this selects by the classes they already
 * render rather than asking each one to hand-annotate its markup. The hero owns
 * its own load timeline; nothing here reaches into it.
 *
 * THE ONE RULE: nothing is ever hidden after the reader has already seen it.
 *
 * The previous version broke this, which is what made things "fire twice".
 * Grid items were revealed with `gsap.from()` created *inside* the batch
 * `onEnter` — so each item sat visible at its final position until it crossed
 * the trigger line, then snapped to hidden and animated back in. Measured:
 * 12 of 16 grid items did exactly that. Above-the-fold subpage headings did
 * the same thing on load.
 *
 * So every target now has its opening pose applied before first paint — by
 * the `[data-anim]` rules in globals.css while the head script's flag is up,
 * then inline by GSAP once this runs — and every reveal animates `to` the
 * finished state. No reveal ever starts from something already on screen.
 */

/** Grid rows that should land together rather than item by item. */
const BATCHES: { sel: string; y: number; stagger: number }[] = [
  { sel: ".service-grid > li", y: 46, stagger: 0.09 },
  { sel: ".stop-card", y: 40, stagger: 0.1 },
  { sel: ".faq-list details", y: 24, stagger: 0.06 },
];

/** Single elements that simply arrive. */
const SINGLES =
  ".section-heading > p, .section-kicker, .check-list, " +
  ".text-call, .contact-urgent, " +
  ".fleet-note, .service-help, .reviews-source, " +
  ".corridor-band";

/** Headings that clear a mask line by line as they scroll in. */
const HEADINGS = ".section-heading h2";

export default function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      registerGsap();
      const media = gsap.matchMedia(root);

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = root.current!;
        const all = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, scope);
        /**
         * Generic targets, minus two exclusions:
         *  - the subpage hero, which is above the fold and plays on load;
         *  - any section marked data-motion="self", which runs its own
         *    choreography. Animating those here too would reveal the same
         *    heading twice — the bug this file exists to prevent.
         */
        const belowHero = (sel: string) =>
          all(sel).filter(
            (el) => !el.closest(".page-hero") && !el.closest('[data-motion="self"]')
          );
        const splits: SplitText[] = [];

        /* ── 1. Subpage hero — in view on arrival, so it plays immediately ── */
        const pageHero = scope.querySelector<HTMLElement>(".page-hero");
        if (pageHero) {
          const h1 = pageHero.querySelector<HTMLElement>("h1");
          const kicker = pageHero.querySelector(".section-kicker");
          const lede = pageHero.querySelector(".page-hero-lede");

          if (kicker) {
            gsap.fromTo(kicker, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.08 });
          }
          if (h1) {
            splits.push(
              SplitText.create(h1, {
                type: "lines",
                mask: "lines",
                // Re-measures if the webfont lands after the first split. GSAP
                // carries the returned animation's progress across the re-split,
                // so a finished heading stays finished instead of replaying.
                autoSplit: true,
                onSplit: (self) => {
                  gsap.set(h1, { visibility: "visible" });
                  return gsap.fromTo(
                    self.lines,
                    { yPercent: 116 },
                    { yPercent: 0, duration: 1.05, stagger: 0.085, delay: 0.16 }
                  );
                },
              })
            );
          }
          if (lede) {
            gsap.fromTo(lede, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.48 });
          }
        }

        /* ── 2. Headings — masked lines, once, on scroll ── */
        belowHero(HEADINGS).forEach((el) => {
          splits.push(
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) => {
                gsap.set(el, { visibility: "visible" });
                // fromTo, not from: the start state is written the moment the
                // split exists, well before the heading reaches the viewport.
                return gsap.fromTo(
                  self.lines,
                  { yPercent: 116 },
                  {
                    yPercent: 0,
                    duration: 1.05,
                    stagger: 0.085,
                    scrollTrigger: { trigger: el, start: "top 88%", once: true },
                  }
                );
              },
            })
          );
        });

        /* ── 3. Single elements ── */
        belowHero(SINGLES).forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            }
          );
        });

        /* ── 4. Grids — staged up front, revealed as a batch ── */
        BATCHES.forEach(({ sel, y, stagger }) => {
          const items = belowHero(sel);
          if (!items.length) return;

          // Written now, at mount — before any of these can be on screen.
          // This line is the actual fix for the double fire.
          gsap.set(items, { opacity: 0, y });

          ScrollTrigger.batch(items, {
            start: "top 90%",
            once: true,
            onEnter: (group) =>
              gsap.to(group, {
                opacity: 1,
                y: 0,
                duration: 0.95,
                stagger,
                overwrite: true,
              }),
          });
        });

        /* ── 5. Framed imagery opens from its own centre… ── */
        belowHero(".final-cta-image").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(13% 0% 13% 0% round 4px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 4px)",
              duration: 1.25,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            }
          );
        });

        /* …and drifts inside that frame as it passes. Transform only, linear,
           no pin — the photograph lags the page rather than fighting it. */
        belowHero(".final-cta-image img").forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -5, scale: 1.11 },
            {
              yPercent: 5,
              scale: 1.11,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement ?? img,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        });

        /* ── 6. The corridor — Highway 99 draws itself south to north ── */
        const corridor = scope.querySelector<HTMLElement>(".corridor");
        if (corridor) {
          const road = corridor.querySelector(".corridor-road");
          const nodes = gsap.utils.toArray<HTMLElement>(".corridor-node", corridor);

          gsap.set(nodes, { scale: 0, opacity: 0 });

          const drive = gsap.timeline({
            scrollTrigger: {
              trigger: corridor,
              start: "top 82%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          });
          if (road) drive.fromTo(road, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", duration: 1 }, 0);
          // Each town lights up as the road reaches it.
          nodes.forEach((node, i) => {
            const at = nodes.length > 1 ? i / (nodes.length - 1) : 0;
            drive.to(node, { scale: 1, opacity: 1, duration: 0.14, ease: "back.out(2)" }, Math.max(0, at - 0.06));
          });
        }

        /*
         * Everything this system animates now carries an inline start state,
         * and the hero — a child, so its effect already ran — has done the
         * same. The CSS holding pose has done its job; drop it now rather than
         * waiting on the head script's 2.6s backstop, which on a slow device
         * could fire mid-sequence and pop elements into view.
         */
        document.documentElement.removeAttribute("data-anim");

        return () => splits.forEach((s) => s.revert());
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true }
  );

  return (
    <main id="main" ref={root}>
      {children}
    </main>
  );
}
