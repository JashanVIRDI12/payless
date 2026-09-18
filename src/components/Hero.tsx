"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { COMPANY, PRIMARY } from "@/lib/site";
import { EASE, onScrollVelocity, registerGsap, releaseWords, stageLines } from "@/lib/motion";
import { SEQUENCE, frameSrc } from "@/lib/sequence";
import { FrameSequence, pickTier } from "@/lib/frame-sequence";
import Link from "next/link";
import Icon from "./Icon";
import ArrowFillButton from "@/components/ui/arrow-fill-button";

/**
 * The hero: the brand film, scrubbed by scroll, with the opening copy laid
 * over its first frame.
 *
 * Two motion systems share one stage and must not collide.
 *
 *  - The *load* sequence is unchanged from the still-photograph hero: the
 *    headline clears its mask word by word, an orange beacon sweeps the frame,
 *    the dispatch panel rises. It plays once, on arrival, against frame 0.
 *  - The *scroll* sequence takes over from there: the copy lifts away, the
 *    film runs, three captions pass, and the footage's own logo lockup lands
 *    as the end card.
 *
 * They are kept apart by time, not by luck — the load timeline animates
 * `.hero-inner`'s children, the scroll timeline animates `.hero-inner` itself,
 * so neither writes the other's properties.
 *
 * The stage is sticky inside a tall track rather than ScrollTrigger-pinned:
 * no pin-spacer, no layout shift on resize, and a scroll position Lenis
 * already understands.
 */

/** The film has finished by here, leaving the last stretch for the end card. */
const FILM_OUT = 0.9;
/** The opening copy is gone by here. */
const COPY_OUT = 0.15;
/**
 * Where the footage starts fading to black for its logo lockup — frame 390 of
 * 451, so film progress 0.865, and the film runs over 0..FILM_OUT of the
 * scroll. The end card fades up on exactly that fade, so the button is already
 * there when the logo resolves instead of chasing it. Scrub smoothing means
 * anything later reads as a lag.
 */
const LOGO_IN = 0.865 * FILM_OUT;

/**
 * Captions, each with the window of scroll progress it lives in. Copy is drawn
 * from the service list and coverage statement already on the site — the film
 * makes no claim the rest of the page doesn't.
 */
const BEATS: { lead: string; body: string; from: number; to: number }[] = [
  {
    lead: "Heavy-duty towing.",
    body: "Wreckers, lowboys and equipment transport, for the loads other trucks leave behind.",
    from: 0.2,
    to: 0.4,
  },
  {
    lead: "Past the city limits.",
    body: "Long-distance towing and specialized transport, as far as the job runs.",
    from: 0.43,
    to: 0.6,
  },
  {
    lead: "Someone always answers.",
    body: "24/7 dispatch — whatever the hour, whatever the weather.",
    from: 0.62,
    to: 0.75,
  },
];

/** Lane dashes down the rail — a highway centre line stood on its end. */
const RAIL_DASHES = 14;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      registerGsap();

      /** Elements resolved against the section, so nothing reaches the rest of the page. */
      const q = (selector: string) =>
        gsap.utils.toArray<HTMLElement>(selector, root.current);

      const media = gsap.matchMedia(root);

      /*
       * Load sequence. The markup ships in its finished state; the `[data-anim]`
       * rules in globals.css hold the opening pose only while the inline script
       * in the document head says motion is coming. The attribute is cleared the
       * moment the sequence finishes, with the head script's 2.6s timer as the
       * backstop, so a failure can never strand the copy off-screen.
       */
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const { words, splits } = stageLines(q("[data-hero-line]"));

        const intro = gsap.timeline({
          defaults: { ease: EASE },
          onComplete: () => {
            document.documentElement.removeAttribute("data-anim");
            releaseWords(splits);
          },
        });

        intro
          // The frame settles rather than arrives: one slow, weighted move.
          .fromTo(q(".hero-photo"), { scale: 1.16 }, { scale: 1, duration: 2, ease: "brandShort" }, 0)
          // A single orange pass over the frame — a beacon sweeping the scene.
          .fromTo(q(".hero-sweep"), { xPercent: -125, opacity: 0 }, { xPercent: 255, opacity: 1, duration: 1.55, ease: "none" }, 0.12)
          .to(q(".hero-sweep"), { opacity: 0, duration: 0.4, ease: "none" }, 1.3)
          .fromTo(q(".availability"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.75 }, 0.3);

        // Each headline line clears its own mask, word by word.
        words.forEach((line, i) => {
          if (line.length) {
            intro.to(line, { yPercent: 0, duration: 1.05, stagger: 0.05 }, 0.44 + i * 0.13);
          }
        });

        intro
          .fromTo(q(".hero-lede"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.92)
          .fromTo(q(".hero-actions > *"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1.04)
          // The glass panel rises as one sheet, then the dispatch tile fills in.
          .fromTo(q(".dispatch-glass"), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.9 }, 1.12)
          .fromTo(q(".dispatch-call"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 1.3)
          .fromTo(q(".hero-scroll-cue"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.55);

        return () => intro.kill();
      });

      /*
       * The film. Object form so the callback can branch on width — and so it
       * never runs under reduced motion, where the reader gets the poster and
       * the copy and not one of the 452 frames is requested.
       */
      media.add(
        {
          desktop: "(prefers-reduced-motion: no-preference) and (min-width: 901px)",
          handheld: "(prefers-reduced-motion: no-preference) and (max-width: 900px)",
        },
        (ctx) => {
          const isDesktop = Boolean(ctx.conditions?.desktop);

          const scope = root.current!;
          const track = trackRef.current!;
          const stage = stageRef.current!;
          const canvas = canvasRef.current!;
          const timecode = scope.querySelector<HTMLElement>(".hero-tc-value");
          const loadbar = scope.querySelector<HTMLElement>(".hero-load-fill");

          /*
           * The scrub spans exactly the distance the stage is actually stuck
           * for — it sticks below the header and, on a phone, stops short of
           * the fixed call bar. Read back off the resolved layout rather than
           * recomputed from --nav-h, and as functions, so they are re-measured
           * on every ScrollTrigger.refresh().
           */
          const stickTop = () => parseFloat(getComputedStyle(stage).top) || 0;
          const scrubStart = () => `top top+=${stickTop()}`;
          const scrubEnd = () => `bottom top+=${stickTop() + stage.offsetHeight}`;

          let seq: FrameSequence | null = null;
          let target = 0;
          let current = 0;
          let cancelled = false;
          const splits: SplitText[] = [];

          /* ── the one number ─────────────────────────────────────────── */

          const driver = ScrollTrigger.create({
            trigger: track,
            start: scrubStart,
            end: scrubEnd,
            onUpdate: (self) => {
              target = self.progress;
            },
          });

          /*
           * Unlike a section further down the page, the hero cannot wait for a
           * scroll trigger to warm up — it is already on screen. But it must
           * not race the poster either: that image is the LCP element. So the
           * loader starts on the first idle callback after mount, by which
           * time the poster has had the network to itself.
           */
          const startLoading = () => {
            if (cancelled || seq) return;
            const tier = pickTier(SEQUENCE.tiers);
            seq = new FrameSequence({
              canvas,
              frames: SEQUENCE.frames,
              src: (i) => frameSrc(tier.width, i),
              blend: true,
              onFirstPaint: () => {
                // The canvas paints the same frame 0, cover-centred the same
                // way, so this cross-fade has nothing to cross — it is there
                // only to cover a slow decode. The poster is left underneath
                // rather than faded out: if the canvas is ever lost (a context
                // loss, a failed fetch) the hero still has an image.
                canvas.classList.add("is-live");
              },
              onLoadProgress: (loaded, total) => {
                if (loadbar) {
                  loadbar.style.transform = `scaleX(${loaded / total})`;
                }
                if (loaded === total) {
                  scope.querySelector(".hero-load")?.classList.add("is-done");
                }
              },
            });
          };

          // Safari only grew requestIdleCallback recently, so the timeout is a
          // real fallback rather than a formality.
          let cancelIdle: () => void;
          if (typeof window.requestIdleCallback === "function") {
            const handle = window.requestIdleCallback(startLoading, { timeout: 1800 });
            cancelIdle = () => window.cancelIdleCallback(handle);
          } else {
            const handle = window.setTimeout(startLoading, 700);
            cancelIdle = () => window.clearTimeout(handle);
          }

          /*
           * Render on the ticker rather than in onUpdate. A scroll event can
           * land twice in one frame or not at all; the ticker fires once per
           * repaint, so the film advances at whatever the display runs at —
           * 60Hz, 120Hz — and the damping below is what turns 30fps of source
           * into continuous motion between the frames that exist.
           */
          const tick = () => {
            // Frame-rate independent: the same feel at 60Hz and at 120Hz.
            const damp = 1 - Math.pow(1 - 0.22, gsap.ticker.deltaRatio());
            current += (target - current) * damp;
            if (Math.abs(target - current) < 0.00002) current = target;

            const film = gsap.utils.clamp(0, 1, current / FILM_OUT);

            if (seq) {
              seq.setProgress(film);
              seq.render();
            }

            if (timecode) {
              const exact = film * (SEQUENCE.frames - 1);
              const seconds = exact / SEQUENCE.fps;
              timecode.textContent =
                `${String(Math.floor(seconds / 60)).padStart(2, "0")}:` +
                `${String(Math.floor(seconds % 60)).padStart(2, "0")}:` +
                `${String(Math.floor(exact % SEQUENCE.fps)).padStart(2, "0")}`;
            }
          };
          gsap.ticker.add(tick);

          /*
           * A resize changes svh, the stage height and so the entire scrub
           * range. ScrollTrigger refreshes itself, but it does so from its own
           * listener — this makes sure the canvas store is re-measured against
           * the settled layout rather than the one being torn down, which is
           * the classic way a scrubbed canvas ends up drawing into a box that
           * no longer matches the element.
           */
          const onResize = () => {
            seq?.resize();
            ScrollTrigger.refresh();
          };
          window.addEventListener("resize", onResize);

          /* ── choreography, scrubbed to the same track ─────────────────── */

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: track,
              start: scrubStart,
              end: scrubEnd,
              scrub: 0.5,
            },
          });

          /*
           * Act I — the opening copy hands the screen over. `.hero-inner` and
           * the dispatch panel move as whole layers; their children are the
           * load timeline's business and are left untouched here.
           */
          tl.to(".hero-inner", { yPercent: -18, opacity: 0, duration: COPY_OUT }, 0)
            .to(".hero-dispatch", { yPercent: 46, opacity: 0, duration: COPY_OUT * 0.8 }, 0)
            // The cue has done its job the instant the reader takes it.
            .to(".hero-scroll-cue", { opacity: 0, duration: COPY_OUT * 0.3 }, 0)
            // The scrim thins out once there is no copy left to hold up.
            .to(".hero-scrim", { opacity: 0.12, duration: COPY_OUT }, 0)
            // Film furniture only appears once the hero proper has left.
            .fromTo(".hero-film-ui", { opacity: 0 }, { opacity: 1, duration: 0.07 }, COPY_OUT * 0.66);

          /* Act II — a slow push-in, under the footage's own forward motion. */
          tl.fromTo(canvas, { scale: 1.045 }, { scale: 1, duration: FILM_OUT - COPY_OUT }, COPY_OUT);

          /* Act III — the logo card lands, the scrim returns, the frame eases out. */
          // The scrim all but clears for the end card: the logo lockup is already
          // white-on-black artwork, and 0.72 of navy over it turned the wordmark
          // grey and muted the orange.
          tl.to(canvas, { scale: 1.035, duration: 1 - FILM_OUT }, FILM_OUT)
            .to(".hero-scrim", { opacity: 0.16, duration: 0.06 }, FILM_OUT);

          /* The rail fills like a lane line running out from under the truck. */
          tl.fromTo(
            ".hero-rail-fill",
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1 },
            0
          );

          /*
           * Captions. Each clears its mask line by line, holds, then leaves
           * upward — scrubbed, so scrolling back re-masks it exactly.
           */
          q(".hero-beat").forEach((beat, i) => {
            const { from, to } = BEATS[i];
            const lead = beat.querySelector<HTMLElement>(".hero-beat-lead")!;
            const body = beat.querySelector<HTMLElement>(".hero-beat-body")!;

            const split = SplitText.create(lead, { type: "lines", mask: "lines" });
            splits.push(split);
            gsap.set(lead, { visibility: "visible" });

            const move = (to - from) * 0.3;

            tl.fromTo(
              split.lines,
              { yPercent: 112 },
              { yPercent: 0, duration: move, stagger: { amount: move * 0.4 } },
              from
            )
              .fromTo(
                body,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: move * 0.85 },
                from + move * 0.4
              )
              .to(
                split.lines,
                { yPercent: -112, duration: move * 0.8, stagger: { amount: move * 0.3 } },
                to - move * 0.8
              )
              .to(body, { opacity: 0, y: -14, duration: move * 0.6 }, to - move * 0.8);
          });

          /*
           * The end card rides in on the film's own logo lockup — and has to be
           * up for as long as that lockup is. The footage finishes resolving it
           * at frame 420 of 451, which is film progress 0.93 and therefore
           * scroll LOGO_IN. Arriving any later than that leaves a long stretch
           * of logo on screen with nothing on it you can press.
           */
          tl.fromTo(
            ".hero-end",
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.08 },
            LOGO_IN
          )
            // The captions are gone by now; their gradient would only sit as a
            // navy haze over what is a pure-black logo card.
            .to(".hero-beats-scrim", { opacity: 0, duration: 0.06 }, LOGO_IN);

          /*
           * Velocity response: the frame stretches a hair when the page is
           * thrown. This used to also open a dark vignette at the edges, which
           * is gone — it dimmed the footage on every fast scroll, and weight
           * should be felt in the movement, not in a filter. The stretch goes
           * on the stage, never the canvas: the timeline already owns the
           * canvas's scale, and two tweens on one transform would fight.
           */
          let stopVelocity: (() => void) | null = null;
          if (isDesktop) {
            const setStretch = gsap.quickSetter(".hero-bg", "scaleY");
            stopVelocity = onScrollVelocity((v) => {
              setStretch(1 + Math.min(Math.abs(v), 1) * 0.014);
            });
          }

          return () => {
            cancelled = true;
            cancelIdle();
            stopVelocity?.();
            gsap.ticker.remove(tick);
            window.removeEventListener("resize", onResize);
            splits.forEach((s) => s.revert());
            driver.kill();
            tl.scrollTrigger?.kill();
            tl.kill();
            seq?.destroy();
            seq = null;
          };
        }
      );

      return () => media.revert();
    },
    { scope: root }
  );

  return (
    <section id="top" ref={root} aria-labelledby="hero-heading" className="towing-hero">
      <div ref={trackRef} className="hero-track">
        <div ref={stageRef} className="hero-stage">
          <div className="hero-bg">
            <div className="hero-bg-layer">
              {/*
                Frame 0 of the film, and the hero's LCP element — so it keeps
                `priority` and carries an inline blur placeholder. The canvas
                draws the same frame, cover-centred the same way, and simply
                takes over once it has decoded.
              */}
              <Image
                src={SEQUENCE.poster}
                alt="A white semi-truck hauling a blue Payless heavy wrecker on a lowboy trailer along an open prairie highway"
                fill
                sizes="100vw"
                quality={82}
                priority
                placeholder="blur"
                blurDataURL={SEQUENCE.posterBlur}
                className="hero-photo"
              />
              <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
            </div>
            <div className="hero-scrim" aria-hidden="true" />
            <div className="hero-sweep" aria-hidden="true" />
          </div>

          <div className="hero-inner site-container">
            <p className="availability"><span /> 24/7 towing, recovery &amp; roadside support</p>
            <h1 id="hero-heading" className="hero-title">
              <span className="hero-line" data-hero-line=""><span>Built for the heavy jobs.</span></span>
              <span className="hero-line hero-line-accent" data-hero-line=""><span>Ready for every road.</span></span>
            </h1>
            <p className="hero-lede">From roadside breakdowns to heavy-duty towing, complex recoveries, and specialized transport, Payless Towing has the equipment and experienced crew to get the job done. Serving {COMPANY.coverage} 24/7.</p>
            <div className="hero-actions">
              <ArrowFillButton href={`tel:${PRIMARY.tel}`} btnText="Call for assistance" aria-label={`Call Payless Towing, ${PRIMARY.phone}`} data-cursor="call" />
              <Link className="hero-ghost" href="/services">Explore our services <Icon name="arrow" /></Link>
            </div>
          </div>

          {/*
           * The dispatch line on the floor of the hero rather than under it.
           * One number, so it is a single tile rather than a row of offices.
           */}
          <div className="hero-dispatch site-container">
            <div className="dispatch-glass">
              <p className="dispatch-glass-intro">
                <span className="dispatch-pulse" aria-hidden="true" />
                <span>
                  Need help now?
                  <strong>Our team is ready 24/7.</strong>
                </span>
              </p>
              <a
                href={`tel:${PRIMARY.tel}`}
                className="dispatch-call"
                data-cursor="call"
                aria-label={`Call Payless Towing dispatch, ${PRIMARY.phone}`}
              >
                <span className="dispatch-city">24/7 dispatch</span>
                <span className="dispatch-number">{PRIMARY.phone}</span>
                <Icon name="phone" />
              </a>
            </div>
          </div>

          {/*
            The film only exists if you scroll, and nothing else on the screen
            says so — the hero looks like a still. This is the one affordance
            that makes the whole section discoverable.
          */}
          <div className="hero-scroll-cue" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>

          {/* Everything below belongs to the film, and fades up once the
              opening copy has left. */}
          <div className="hero-film-ui" aria-hidden="false">
            {/* Text protection for the captions, and only for as long as
                there are captions — see the tween at LOGO_IN. */}
            <div className="hero-beats-scrim" />

            <div className="hero-beats">
              {BEATS.map((beat) => (
                <div className="hero-beat" key={beat.lead}>
                  <p className="hero-beat-lead">{beat.lead}</p>
                  <p className="hero-beat-body">{beat.body}</p>
                </div>
              ))}
            </div>

            {/* The lane line, stood on its end. */}
            <div className="hero-rail" aria-hidden="true">
              <div className="hero-rail-track">
                {Array.from({ length: RAIL_DASHES }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="hero-rail-fill">
                {Array.from({ length: RAIL_DASHES }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
            </div>

            {/* Timecode and decode progress — the film showing its working. */}
            <div className="hero-hud" aria-hidden="true">
              <span className="hero-tc">
                TC <b className="hero-tc-value">00:00:00</b>
              </span>
              <span className="hero-load">
                <i className="hero-load-fill" />
              </span>
            </div>
          </div>

          {/*
            The end card sits on the film's own logo lockup, so the number is
            already on screen as artwork. This adds the one thing artwork
            cannot be — something you can tap.
          */}
          <div className="hero-end">
            <a
              href={`tel:${PRIMARY.tel}`}
              className="hero-end-call"
              data-cursor="call"
              aria-label={`Call Payless Towing dispatch, ${PRIMARY.phone}`}
            >
              <Icon name="phone" />
              <span>{PRIMARY.phone}</span>
            </a>
            <p className="hero-end-note">24/7 dispatch · {COMPANY.coverage}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
