"use client";

// @refresh reset
// SplitText and pointer handlers own DOM references; remount them on edits.

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { COMPANY } from "@/lib/site";
import { EASE, registerGsap } from "@/lib/motion";

// Static markup is the finished state. This section owns its reveals so
// PageMotion never animates the same elements a second time.
export default function Trust() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const scope = root.current;
      if (!scope) return;
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, scope);
      const media = gsap.matchMedia(root);

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const compact = window.matchMedia("(max-width: 600px)").matches;
        const heading = q(".section-heading")[0];
        // Authored word masks preserve the two-line composition when fonts
        // load or the viewport changes; no heading re-split/replay is needed.
        gsap.set(q("#trust-heading"), { visibility: "visible" });
        const intro = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: heading, start: "top 84%", once: true },
        });

        intro
          .fromTo(
            q(".section-kicker"),
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.55 },
            0,
          )
          // GSAP reads the CSS anti-flash translateY(112%) as a pixel `y`;
          // zero it so only yPercent carries the offset, or the words finish
          // the tween still parked below their masks.
          .fromTo(
            q(".why-title-word"),
            { y: 0, yPercent: 112, rotation: 4, transformOrigin: "0% 100%" },
            {
              y: 0,
              yPercent: 0,
              rotation: 0,
              duration: compact ? 0.8 : 1.05,
              stagger: 0.09,
            },
            0.1,
          )
          .fromTo(
            q(".why-title-underline"),
            { scaleX: 0, transformOrigin: "0% 50%" },
            { scaleX: 1, duration: 0.85, ease: "expo.out" },
            0.55,
          );
        // Resolve this timeline before later sections register triggers.
        // GSAP otherwise defers timeline measurements until the next tick.
        intro.scrollTrigger?.refresh();

        // The paragraph has its own trigger: on small screens it can still
        // be below the fold when the title arrives.
        gsap.fromTo(
          q(".why-lede"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: q(".why-lede")[0],
              start: "top 90%",
              once: true,
            },
          },
        );

        // A single scroll-linked signal connects the four dispatch points.
        // It uses the authored track width, so no per-frame layout reads.
        const corridor = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".why-corridor")[0],
            start: "top 88%",
            end: "top 48%",
            scrub: 0.65,
          },
        });
        corridor
          .fromTo(
            q(".why-corridor-fill"),
            { scaleX: 0, transformOrigin: "0% 50%" },
            { scaleX: 1, duration: 1 },
            0,
          )
          .fromTo(
            q(".why-corridor-signal"),
            { xPercent: 0 },
            { xPercent: 100, duration: 1 },
            0,
          );
        q(".why-corridor-stop").forEach((stop, index) => {
          corridor.fromTo(
            stop,
            { scale: 0.55, backgroundColor: "#7a8aa0" },
            {
              scale: 1,
              backgroundColor: "#fc5000",
              duration: 0.14,
              ease: "back.out(1.8)",
            },
            (index / 3) * 0.84,
          );
        });
        corridor.scrollTrigger?.refresh();

        const numeral = scope.querySelector<HTMLElement>(".why-247");
        const numeralSplit = numeral
          ? SplitText.create(numeral, { type: "chars" })
          : null;
        q(".why-card-slot").forEach((slot, index) => {
          const find = (selector: string) =>
            gsap.utils.toArray<HTMLElement>(selector, slot);
          // Trigger the stationary grid slot; move its child. Pointer tilt
          // lives one level deeper and cannot overwrite the entrance.
          const tl = gsap.timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: slot, start: "top 89%", once: true },
            delay: compact ? 0 : (index % 2) * 0.1,
          });
          tl.fromTo(
            find(".why-card-reveal"),
            {
              opacity: 0,
              y: compact ? 30 : 54,
              scale: 0.97,
              rotationX: compact ? 0 : 7,
              transformOrigin: "50% 100%",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationX: 0,
              duration: 0.9,
              clearProps: "transform,opacity",
            },
            0,
          ).fromTo(
            find(".why-index, h3, .why-card-inner > p"),
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.08,
            },
            0.16,
          );

          if (index === 0 && numeralSplit) {
            tl.fromTo(
              numeralSplit.chars,
              { yPercent: 112, rotation: 6 },
              {
                yPercent: 0,
                rotation: 0,
                duration: 0.9,
                stagger: 0.075,
              },
              0.25,
            )
              .fromTo(
                find(".why-dial-tick"),
                { opacity: 0 },
                { opacity: 1, duration: 0.25, stagger: 0.045 },
                0.25,
              )
              .fromTo(
                find(".why-dial-ring"),
                { drawSVG: "0%" },
                { drawSVG: "100%", duration: 1.5, ease: "power2.inOut" },
                0.3,
              )
              .fromTo(
                find(".why-orbit"),
                { rotation: 0, svgOrigin: "60 60" },
                {
                  rotation: 360,
                  svgOrigin: "60 60",
                  duration: 1.5,
                  ease: "power2.inOut",
                },
                0.3,
              );
          }
          if (index === 1) {
            tl.fromTo(
              find(".why-route-line"),
              { drawSVG: "0%" },
              {
                drawSVG: "100%",
                duration: 1.1,
                ease: "none",
              },
              0.35,
            );
            find(".why-route-node").forEach((node, stop) => {
              const arrival = 0.35 + (stop * 1.1) / 3;
              tl.fromTo(
                node,
                { scale: 0, transformOrigin: "50% 50%" },
                {
                  scale: 1,
                  duration: 0.45,
                  ease: "back.out(1.8)",
                },
                arrival,
              ).fromTo(
                find(".why-route-halo")[stop],
                { scale: 0.6, opacity: 0.65, transformOrigin: "50% 50%" },
                {
                  scale: 2.4,
                  opacity: 0,
                  duration: 0.7,
                  ease: "power2.out",
                },
                arrival,
              );
            });
          }
          if (index === 2) {
            tl.fromTo(
              find(".why-shield-svg"),
              { scale: 0.86, rotation: -8 },
              { scale: 1, rotation: 0, duration: 1 },
              0.2,
            )
              .fromTo(
                find(".why-shield"),
                { drawSVG: "0%" },
                { drawSVG: "100%", duration: 1.05, ease: "power2.inOut" },
                0.25,
              )
              .fromTo(
                find(".why-check"),
                { drawSVG: "0%" },
                { drawSVG: "100%", duration: 0.45, ease: "power2.out" },
                1.1,
              );
          }
          if (index === 3) {
            tl.fromTo(
              find(".why-bar"),
              { scaleY: 0, transformOrigin: "50% 100%" },
              {
                scaleY: 1,
                duration: 1,
                stagger: 0.13,
                ease: "back.out(1.15)",
              },
              0.3,
            ).fromTo(
              find(".why-bar-label"),
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.45, stagger: 0.13 },
              0.55,
            );
          }
          tl.scrollTrigger?.refresh();
        });

        return () => {
          numeralSplit?.revert();
        };
      });

      /*
       * Desktop pointers get a slight 3D tilt and a light that follows the
       * cursor. Kept to ~4°: it should feel like the card has weight, not like
       * it's floating off the page.
       */
      media.add(
        "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
        () => {
          const cleanups: (() => void)[] = [];

          q(".why-card").forEach((card) => {
            gsap.set(card, { transformPerspective: 1000 });
            const rx = gsap.quickTo(card, "rotationX", {
              duration: 0.6,
              ease: "power3",
            });
            const ry = gsap.quickTo(card, "rotationY", {
              duration: 0.6,
              ease: "power3",
            });
            const glowX = gsap.quickTo(card, "--gx", {
              duration: 0.45,
              ease: "power3.out",
            });
            const glowY = gsap.quickTo(card, "--gy", {
              duration: 0.45,
              ease: "power3.out",
            });
            let rect: DOMRect | null = null;

            const enter = () => {
              // A queued pointer event can arrive while React replaces the
              // wrappers. Ignore detached cards and support a missing slot.
              if (!card.isConnected || !scope.contains(card)) {
                rect = null;
                return;
              }
              const target = card.closest<HTMLElement>(".why-card-slot") ?? card;
              rect = target.getBoundingClientRect();
            };
            const move = (e: PointerEvent) => {
              if (!rect) enter();
              if (!rect || rect.width <= 0 || rect.height <= 0) return;
              const px = gsap.utils.clamp(
                0,
                1,
                (e.clientX - rect.left) / rect.width,
              );
              const py = gsap.utils.clamp(
                0,
                1,
                (e.clientY - rect.top) / rect.height,
              );
              ry((px - 0.5) * 7);
              rx((0.5 - py) * 7);
              glowX(px * 100);
              glowY(py * 100);
            };
            const leave = () => {
              if (!rect) return;
              rx(0);
              ry(0);
              glowX(50);
              glowY(50);
              rect = null;
            };

            card.addEventListener("pointerenter", enter);
            card.addEventListener("pointermove", move);
            card.addEventListener("pointerleave", leave);
            // Scroll invalidates the cached rect and settles a hovered card.
            window.addEventListener("scroll", leave, { passive: true });
            window.addEventListener("resize", leave);
            cleanups.push(() => {
              rect = null;
              card.removeEventListener("pointerenter", enter);
              card.removeEventListener("pointermove", move);
              card.removeEventListener("pointerleave", leave);
              window.removeEventListener("scroll", leave);
              window.removeEventListener("resize", leave);
            });
          });

          return () => cleanups.forEach((fn) => fn());
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="why"
      ref={root}
      data-motion="self"
      className="trust-section section-space"
      aria-labelledby="trust-heading"
    >
      <div className="site-container">
        <div className="section-heading why-heading">
          <div>
            <p className="section-kicker">Why drivers call Payless</p>
            <h2 id="trust-heading" aria-label="Ready when you call.">
              <span className="why-title-line" aria-hidden="true">
                <span className="why-word-mask">
                  <span className="why-title-word">Ready</span>
                </span>{" "}
                <span className="why-word-mask">
                  <span className="why-title-word">when</span>
                </span>
              </span>
              <span
                className="why-title-line why-title-accent"
                aria-hidden="true"
              >
                <span className="why-title-underline" />
                <span className="why-word-mask">
                  <span className="why-title-word">you</span>
                </span>{" "}
                <span className="why-word-mask">
                  <span className="why-title-word">call.</span>
                </span>
              </span>
            </h2>
          </div>
          <p className="why-lede">
            One connected corridor from {COMPANY.coverage}, covered by local
            crews and the equipment each job actually calls for.
          </p>
        </div>

        <div className="why-corridor" aria-hidden="true">
          <div className="why-corridor-labels">
            <span>Deep Cove</span>
            <span className="why-corridor-caption">One connected corridor</span>
            <span>Lillooet</span>
          </div>
          <div className="why-corridor-track">
            <span className="why-corridor-fill" />
            <span className="why-corridor-signal">
              <span />
            </span>
            {[0, 1, 2, 3].map((stop) => (
              <span className="why-corridor-stop" key={stop} />
            ))}
          </div>
        </div>

        <ul className="why-grid">
          {/* 01 — time */}
          <li className="why-card-slot why-card--wide">
            <div className="why-card-reveal">
              <div className="why-card why-card--dark why-card--time">
                <div className="why-card-inner">
                  <span className="why-index">01</span>
                  <div className="why-visual" aria-hidden="true">
                    <div className="why-247">24/7</div>
                    <svg className="why-dial" viewBox="0 0 120 120">
                      <circle
                        className="why-dial-track"
                        cx="60"
                        cy="60"
                        r="52"
                      />
                      {Array.from({ length: 12 }, (_, tick) => (
                        <path
                          key={tick}
                          className="why-dial-tick"
                          d="M60 17v5"
                          transform={`rotate(${tick * 30} 60 60)`}
                        />
                      ))}
                      <circle
                        className="why-dial-ring"
                        cx="60"
                        cy="60"
                        r="52"
                        transform="rotate(-90 60 60)"
                      />
                      <g className="why-orbit">
                        <circle cx="60" cy="8" r="5.5" />
                      </g>
                    </svg>
                  </div>
                  <h3>Day or night</h3>
                  <p>24-hour emergency service, every day of the year.</p>
                </div>
              </div>
            </div>
          </li>

          {/* 02 — place */}
          <li className="why-card-slot">
            <div className="why-card-reveal">
              <div className="why-card">
                <div className="why-card-inner">
                  <span className="why-index">02</span>
                  <div className="why-visual" aria-hidden="true">
                    <svg className="why-route" viewBox="0 0 240 40">
                      <path className="why-route-bed" d="M20 20 H220" />
                      <path className="why-route-line" d="M20 20 H220" />
                      {[20, 86.7, 153.3, 220].map((x) => (
                        <circle
                          key={x}
                          className="why-route-halo"
                          cx={x}
                          cy="20"
                          r="8"
                        />
                      ))}
                      {[20, 86.7, 153.3, 220].map((x) => (
                        <circle
                          key={x}
                          className="why-route-node"
                          cx={x}
                          cy="20"
                          r="8"
                        />
                      ))}
                    </svg>
                  </div>
                  <h3>Four local dispatches</h3>
                  <p>North Vancouver, Squamish, Whistler and Pemberton.</p>
                </div>
              </div>
            </div>
          </li>

          {/* 03 — protection */}
          <li className="why-card-slot">
            <div className="why-card-reveal">
              <div className="why-card">
                <div className="why-card-inner">
                  <span className="why-index">03</span>
                  <div className="why-visual" aria-hidden="true">
                    <svg className="why-shield-svg" viewBox="0 0 64 72">
                      <path
                        className="why-shield"
                        d="M32 4 6 14v19c0 17 11.5 28.5 26 35 14.5-6.5 26-18 26-35V14L32 4Z"
                      />
                      <path className="why-check" d="M21 37l8 8 15-17" />
                    </svg>
                  </div>
                  <h3>Fully insured</h3>
                  <p>Care for you and for your vehicle.</p>
                </div>
              </div>
            </div>
          </li>

          {/* 04 — range */}
          <li className="why-card-slot why-card--wide">
            <div className="why-card-reveal">
              <div className="why-card why-card--signal">
                <div className="why-card-inner">
                  <span className="why-index">04</span>
                  <div className="why-visual why-range" aria-hidden="true">
                    {[
                      ["Light", 38],
                      ["Medium", 66],
                      ["Heavy", 100],
                    ].map(([label, h]) => (
                      <div key={label} className="why-bar-col">
                        <div className="why-bar-well">
                          <span
                            className="why-bar"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                        <span className="why-bar-label">{label}</span>
                      </div>
                    ))}
                  </div>
                  <h3>Small cars. Big hauls.</h3>
                  <p>Light, medium and heavy-duty towing and transport.</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
