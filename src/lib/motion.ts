"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from "gsap/Observer";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

/** useLayoutEffect on the client, useEffect on the server (silences SSR warning). */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    CustomEase,
    Observer,
    InertiaPlugin,
    DrawSVGPlugin
  );

  /*
   * One bespoke ease used everywhere instead of stock power3.out. It leaves
   * fast, reaches ~90% early, then glides — the "weighted" feel of something
   * heavy being moved under control, which is the whole brand premise.
   */
  CustomEase.create("brand", "M0,0 C0.16,0.84 0.24,1 1,1");
  /** Slightly sharper, for exits and small UI. */
  CustomEase.create("brandShort", "M0,0 C0.3,0.8 0.35,1 1,1");

  gsap.defaults({ ease: "brand" });
  registered = true;
}

/**
 * True when the user has asked for reduced motion. Every animated component
 * bails out early on this, leaving the CSS resting state — which is always the
 * finished state — untouched.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Matches the `data-anim` attribute set by the inline script in the document head. */
export function animationsEnabled(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute("data-anim");
}

export const EASE = "brand";

/**
 * The standard section-heading reveal, for sections that own their motion
 * (data-motion="self") and so are skipped by PageMotion: the h2 clears its
 * mask line by line, the kicker and lead paragraph fade up.
 *
 * Starts from the [data-anim] holding pose in globals.css, so it must run
 * before first paint of the section — call it from the section's useGSAP.
 * Returns the split for the caller's cleanup.
 */
export function revealHeading(scope: HTMLElement): SplitText | null {
  const h2 = scope.querySelector<HTMLElement>(".section-heading h2");
  const split = h2
    ? SplitText.create(h2, {
        type: "lines",
        mask: "lines",
        // GSAP carries the returned tween's progress across a re-split, so a
        // finished heading stays finished when the webfont lands or the
        // window resizes.
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(h2, { visibility: "visible" });
          return gsap.fromTo(
            self.lines,
            { yPercent: 116 },
            {
              yPercent: 0,
              duration: 1.05,
              stagger: 0.085,
              scrollTrigger: { trigger: h2, start: "top 88%", once: true },
            }
          );
        },
      })
    : null;

  const lead = gsap.utils.toArray<HTMLElement>(
    ".section-kicker, .section-heading > p",
    scope
  );
  if (lead.length) {
    gsap.fromTo(
      lead,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        scrollTrigger: { trigger: scope, start: "top 82%", once: true },
      }
    );
  }

  return split;
}

/**
 * Splits the inner element of a `[data-reveal="line"]` mask into words and
 * stages them below the mask.
 *
 * The line breaks stay in the markup rather than being detected by SplitText:
 * the headings are art-directed, and letting SplitText re-flow them would move
 * the breaks at different widths. So `.u-clip` remains the mask and SplitText
 * only does word-level splitting inside it — which is where the kinetic
 * quality comes from anyway, and it stays resize-safe for free.
 */
function stageWords(lineEl: HTMLElement): SplitText | null {
  const inner = lineEl.firstElementChild as HTMLElement | null;
  if (!inner) return null;

  const split = SplitText.create(inner, {
    type: "words",
    wordsClass: "split-word",
  });

  // The CSS anti-flash state offsets the inner element; the words carry the
  // motion now, so hand the offset over to them.
  gsap.set(inner, { yPercent: 0, y: 0 });
  gsap.set(split.words, { yPercent: 108 });
  return split;
}

/** Reverts a split once its animation is done, returning clean DOM. */
function releaseWords(splits: (SplitText | null)[]) {
  splits.forEach((s) => s?.revert());
}

/**
 * Standard scroll reveal for a block of `[data-reveal]` elements.
 * Lines reveal word-by-word through their mask; everything else fades up.
 */
export function revealOnScroll(
  scope: HTMLElement,
  opts: { start?: string; stagger?: number; selector?: string } = {}
) {
  const { start = "top 78%", stagger = 0.09, selector = "[data-reveal]" } = opts;
  const targets = gsap.utils.toArray<HTMLElement>(selector, scope);
  if (!targets.length) return null;

  const splits: (SplitText | null)[] = [];

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scope, start, once: true },
    onComplete: () => releaseWords(splits),
  });

  targets.forEach((el, i) => {
    const at = i * stagger;
    if (el.dataset.reveal === "line") {
      const split = stageWords(el);
      splits.push(split);
      if (split) {
        tl.to(split.words, { yPercent: 0, duration: 1, stagger: 0.045 }, at);
      }
    } else {
      tl.to(el, { opacity: 1, y: 0, duration: 0.85 }, at);
    }
  });

  return tl;
}

/**
 * Adds word-staged lines to a timeline the caller owns (the hero load
 * sequence). Returns the splits so the caller can release them on complete.
 */
export function stageLines(lines: HTMLElement[]): {
  words: Element[][];
  splits: (SplitText | null)[];
} {
  const splits = lines.map((l) => stageWords(l));
  return { words: splits.map((s) => (s ? s.words : [])), splits };
}

export { releaseWords };

/**
 * Scroll velocity as a normalised -1..1 value, smoothed. Drives the subtle
 * skew on imagery and the marquee direction — the page reacting to how hard
 * you are throwing it rather than just where you are.
 */
export function onScrollVelocity(
  cb: (v: number) => void,
  opts: { max?: number } = {}
) {
  const { max = 2600 } = opts;
  let raw = 0;
  let current = 0;

  // getVelocity() lives on a ScrollTrigger *instance*, and only reports during
  // an update — so the ticker below both smooths it and decays it back to rest
  // once scrolling stops. Without the decay the skew would stick.
  const st = ScrollTrigger.create({
    onUpdate: (self) => {
      raw = self.getVelocity();
    },
  });

  const tick = () => {
    const target = gsap.utils.clamp(-1, 1, raw / max);
    current += (target - current) * 0.12;
    if (Math.abs(current) < 0.0005) current = 0;
    cb(current);
    raw *= 0.9;
  };

  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    st.kill();
  };
}
