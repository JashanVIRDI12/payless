"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Icon, { type IconName } from "./Icon";
import { registerGsap, revealHeading } from "@/lib/motion";

/**
 * The call, as a deck of three cards. Each step is sticky and the next slides
 * up over it; covered cards shrink and dim (desktop), so the sequence reads as
 * something being stacked up rather than a row of equal columns.
 *
 * Each card also turns its copy into what a driver actually needs in hand —
 * the chips are taken word for word from the step text, so they add no claim
 * the copy doesn't already make.
 *
 * Owns its motion (data-motion="self"): PageMotion skips everything inside.
 */
const STEPS: {
  icon: IconName;
  title: string;
  copy: string;
  readyLabel: string;
  ready: string[];
}[] = [
  {
    icon: "pin",
    title: "Tell us where you are.",
    copy: "Have your road name, travel direction and a nearby landmark ready. Share the pickup and destination if you need a tow.",
    readyLabel: "Have ready",
    ready: ["Road name", "Travel direction", "Nearby landmark", "Pickup & destination"],
  },
  {
    icon: "truck",
    title: "Tell us what happened.",
    copy: "Your vehicle’s make, model and condition help dispatch assess the job. Mention any access restrictions or special transport needs.",
    readyLabel: "Have ready",
    ready: ["Make & model", "Vehicle condition", "Access restrictions", "Special transport needs"],
  },
  {
    icon: "check",
    title: "Confirm the next step.",
    copy: "Ask dispatch about the right equipment, the estimated cost and current availability before arranging your service.",
    readyLabel: "Ask dispatch about",
    ready: ["The right equipment", "Estimated cost", "Current availability"],
  },
];

export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const scope = root.current!;
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, scope);
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const split = revealHeading(scope);

        /* Each card's contents arrive as it comes into view. All fromTo, so
           the start pose is written now, before any card is on screen. */
        q(".stack-card").forEach((card) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: card, start: "top 78%", once: true },
          });
          tl.fromTo(card.querySelector(".stack-num"), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1 }, 0)
            .fromTo(
              card.querySelector(".stack-icon"),
              { scale: 0.4, opacity: 0, rotation: -20 },
              { scale: 1, opacity: 1, rotation: 0, duration: 0.7, ease: "back.out(2)" },
              0.12
            )
            .fromTo(
              card.querySelectorAll(".stack-chip"),
              { opacity: 0, y: 14, scale: 0.94 },
              { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08 },
              0.3
            )
            .fromTo(
              card.querySelectorAll(".stack-tick"),
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: 0.4, stagger: 0.08, ease: "power2.out" },
              0.48
            );
        });

        const tip = q(".route-tip")[0];
        if (tip) {
          gsap.fromTo(
            tip,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.85, scrollTrigger: { trigger: tip, start: "top 92%", once: true } }
          );
        }

        return () => split?.revert();
      });

      /*
       * Deck depth. Desktop only — the cards stop being sticky under 901px.
       * As the next card slides up to its resting place, the one beneath
       * shrinks toward its top edge and a shade comes over it. Scrubbed, so it
       * is exactly as far along as the reader's scroll, never ahead of it.
       */
      media.add("(prefers-reduced-motion: no-preference) and (min-width: 901px)", () => {
        const cards = q(".stack-card");
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          const trigger = {
            trigger: next,
            start: "top bottom",
            // Where the next card comes to rest: its own sticky top.
            end: () => `top ${parseFloat(getComputedStyle(next).top)}px`,
            scrub: true,
            invalidateOnRefresh: true,
          };
          gsap.to(card.querySelector(".stack-card-inner"), {
            scale: 0.92,
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: trigger,
          });
          gsap.to(card.querySelector(".stack-shade"), {
            opacity: 1,
            ease: "none",
            scrollTrigger: { ...trigger },
          });
        });
      });

      return () => media.revert();
    },
    { scope: root }
  );

  return (
    <section
      id="getting-help"
      ref={root}
      data-motion="self"
      className="how-section section-space"
      aria-labelledby="how-heading"
    >
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="section-kicker">From your first call</p>
            <h2 id="how-heading">Let’s get you moving.</h2>
          </div>
          <p>
            A little information helps us understand your situation and arrange
            the right assistance.
          </p>
        </div>

        <ol className="stack">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="stack-card"
              style={{ "--i": i } as CSSProperties}
            >
              <div className="stack-card-inner">
                <div className="stack-main">
                  <div className="stack-top">
                    <span className="stack-num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="stack-icon" aria-hidden="true">
                      <Icon name={step.icon} />
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>

                <div className="stack-ready">
                  <p className="stack-ready-label">{step.readyLabel}</p>
                  <ul>
                    {step.ready.map((item) => (
                      <li key={item} className="stack-chip">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path className="stack-tick" d="M5 12.5l4.2 4.2L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <span className="stack-shade" aria-hidden="true" />
              </div>
            </li>
          ))}
        </ol>

        <p className="route-tip">
          <span className="route-shield" role="img" aria-label="Highway 99">
            99
          </span>
          <span>
            <strong>On Highway 99?</strong> Your direction of travel and the
            nearest exit or landmark help pinpoint your location.
          </span>
        </p>
      </div>
    </section>
  );
}
