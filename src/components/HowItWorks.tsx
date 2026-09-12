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
    copy: "Share your current location and destination, along with any nearby landmarks that can help our team identify where assistance is needed.",
    readyLabel: "Have ready",
    ready: ["Current location", "Nearby landmark", "Pickup & destination", "Vehicle location details"],
  },
  {
    icon: "truck",
    title: "Tell us what happened.",
    copy: "Give us a quick overview of your vehicle and the situation. These details help our dispatch team understand the job and send the right truck and equipment.",
    readyLabel: "Have ready",
    ready: ["Vehicle type & model", "Vehicle condition", "Nature of the problem", "Special towing requirements"],
  },
  {
    icon: "check",
    title: "Confirm your service.",
    copy: "Once we understand the situation, our dispatch team will recommend the right equipment, confirm availability, and walk you through the next steps before sending assistance.",
    readyLabel: "Confirm with dispatch",
    ready: ["Right equipment", "Service availability", "Estimated cost"],
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
            <h2 id="how-heading">
              The right help starts
              <br />
              with the right details.
            </h2>
          </div>
          <p>
            Share a few key details about your situation, and our team can
            determine the equipment and support needed for the job.
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
      </div>
    </section>
  );
}
