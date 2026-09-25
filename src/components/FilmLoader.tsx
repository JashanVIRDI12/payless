"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";
import { EASE, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { filmLoaderSettled, registerFilmLoader } from "@/lib/film-loader";
import { PRIMARY } from "@/lib/site";

/**
 * The opening card, held over the page while the hero film's frames come in.
 *
 * It exists because the film cannot be scrubbed until its frames are decoded,
 * and a reader who scrolls before then sees the sequence step in chunks rather
 * than run. Holding the page for the two or three seconds that takes buys the
 * whole rest of the section.
 *
 * Three constraints shaped it.
 *
 *  - It is a towing company. Someone arriving mid-breakdown must be able to
 *    call from the loader itself, so the dispatch number is on the card and is
 *    a real tel: link the moment it paints — not after the film is ready.
 *  - It can never trap anyone. There are three independent releases: the
 *    frames finishing, a hard {@link MAX_HOLD} timer, and a CSS animation that
 *    fades the card out on its own if the bundle never runs at all.
 *  - It never appears for readers who asked for reduced motion, because the
 *    film is never built for them and there is nothing to wait for.
 *
 * The progress readout is written straight to the DOM. At 226 frames a React
 * state update per frame would cost more than the decode it is reporting on.
 */

/**
 * The longest the page is ever held, frames or no frames. Past this the film
 * is released to load behind the reader: in-order fetching means the opening
 * stretch — the only part reachable in the first moments of scrolling — is
 * always the part that is already in.
 */
const MAX_HOLD = 6000;

/** Below this the counter still climbs, so a stalled network never looks dead. */
const CREEP_CEILING = 0.92;

export default function FilmLoader() {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    registerGsap();

    const el = root.current;
    if (!el) return;

    /*
     * No film under reduced motion, so nothing to wait for. The card is
     * removed rather than faded: a fade is motion, and the whole point of the
     * preference is to not do that.
     *
     * Same treatment for a second visit within the session — a navigation
     * home and back finds the frames already in the HTTP cache, and an exit
     * animation over a wait that did not happen is just a flash.
     */
    if (prefersReducedMotion() || filmLoaderSettled()) {
      el.classList.add("is-gone");
      return;
    }

    lockScroll();
    /*
     * A reload lands mid-page in some browsers, and the card covers the
     * viewport — so the page underneath has to be where the reader will be let
     * out. Not when they arrived on an anchor, though: /#contact is a request
     * for a particular part of the page, and overriding it would strand them
     * at the top with no idea why.
     */
    if (!window.location.hash) window.scrollTo(0, 0);

    let shown = 0;
    let target = 0;
    let done = false;
    let raf = 0;

    /*
     * The readout eases towards the real figure rather than snapping to it.
     * Frames land in bursts of eight, and a counter that jumps 000 -> 014 ->
     * 031 reads as broken where the same data, eased, reads as loading.
     */
    const paint = () => {
      shown += (target - shown) * 0.12;
      if (target - shown < 0.0005) shown = target;
      if (fill.current) fill.current.style.transform = `scaleX(${shown})`;
      if (count.current) {
        count.current.textContent = String(Math.round(shown * 100)).padStart(2, "0");
      }
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);

    const exit = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);

      if (fill.current) fill.current.style.transform = "scaleX(1)";
      if (count.current) count.current.textContent = "100";

      /*
       * The card leaves upward off its own bottom edge, which puts the hero
       * underneath in motion behind it rather than revealing it all at once.
       * The lock is released on the first frame of the exit, not at the end —
       * by then the page is already visible and holding it would read as lag.
       *
       * The refresh is not optional. Every ScrollTrigger on the page was built
       * while the document could not scroll, and the hero's scrub range is
       * measured off a sticky element's resolved position. Re-measuring once
       * the page is live is what stops the film starting mid-shot.
       */
      gsap
        .timeline({
          defaults: { ease: EASE },
          onStart: () => {
            unlockScroll();
            ScrollTrigger.refresh();
          },
          onComplete: () => el.classList.add("is-gone"),
        })
        .to(".film-loader-mark", { y: -18, opacity: 0, duration: 0.42 }, 0)
        .to(".film-loader-meter", { opacity: 0, duration: 0.36 }, 0.04)
        .to(
          el,
          { clipPath: "inset(0% 0% 100% 0%)", duration: 0.78, ease: "brandShort" },
          0.16
        );
    };

    // Release two, independent of the frames: a stalled CDN must not hold the
    // page past the point where the reader would rather just have the site.
    const cap = window.setTimeout(exit, MAX_HOLD);

    registerFilmLoader({
      progress: (value) => {
        // Held short of the end until the frames actually say they are done,
        // so the bar never sits full while the page is still locked.
        target = Math.min(value, CREEP_CEILING);
      },
      dismiss: exit,
    });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
      registerFilmLoader(null);
      if (!done) unlockScroll();
    };
  }, []);

  return (
    <div ref={root} className="film-loader">
      <div className="film-loader-mark">
        <Logo className="h-11 w-auto" onDark priority />
      </div>

      {/* Decorative. The readout rewrites itself every frame, which inside a
          live region is a number announced sixty times a second. */}
      <div className="film-loader-meter" aria-hidden="true">
        <span className="film-loader-count">
          <span ref={count}>00</span>
          <i>%</i>
        </span>
        <span className="film-loader-rail">
          <span ref={fill} className="film-loader-fill" />
        </span>
        <span className="film-loader-label">Loading</span>
      </div>

      {/*
        The one thing that must work before anything else does. Someone on the
        hard shoulder should not be waiting on a brand film to reach a phone
        number, so this is live from the first paint.
      */}
      <a
        href={`tel:${PRIMARY.tel}`}
        className="film-loader-call"
        data-cursor="call"
        aria-label={`Call Payless Towing dispatch, ${PRIMARY.phone}`}
      >
        24/7 dispatch <strong>{PRIMARY.phone}</strong>
      </a>
    </div>
  );
}
