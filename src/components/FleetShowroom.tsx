"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon from "./Icon";
import { FLEET, PRIMARY } from "@/lib/site";
import { registerGsap, revealHeading } from "@/lib/motion";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The fleet as a showroom.
 *
 * The page exists to stop the wrong truck being sent, so it opens with the
 * question the other way round: pick the job, get the truck. Every "built for"
 * item across the four units becomes a chip that jumps to its unit and lights
 * the matching line. Nothing new is claimed — it is the existing data indexed
 * by job instead of by vehicle. Still no unit counts, makes or capacities.
 *
 * Desktop: a photo stage stays pinned while the four panels scroll past; each
 * new truck wipes up over the last, scrubbed to the scroll, and a glass label
 * rolls to the current name. Phones: stacked cards with their own photos.
 *
 * Owns its motion (data-motion="self"): PageMotion skips everything inside.
 */
export default function FleetShowroom() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const scope = root.current!;
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, scope);
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 1024px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
          const panels = q(".unit-panel");
          const split = motion ? revealHeading(scope) : null;

          /* ── Entrances ── */
          if (motion) {
            gsap.fromTo(
              q(".finder-chip"),
              { opacity: 0, y: 12 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.025,
                scrollTrigger: { trigger: q(".fleet-finder")[0], start: "top 88%", once: true },
              }
            );

            panels.forEach((panel) => {
              const tl = gsap.timeline({
                scrollTrigger: { trigger: panel, start: "top 80%", once: true },
              });
              const photo = panel.querySelector(".unit-media-mobile");
              if (photo && !desktop) {
                tl.fromTo(
                  photo,
                  { clipPath: "inset(0% 0% 100% 0% round 18px)" },
                  { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.05 },
                  0
                );
              }
              tl.fromTo(
                panel.querySelectorAll(".unit-count, h3, .unit-summary, .unit-built, .unit-ask"),
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 },
                desktop ? 0 : 0.2
              ).fromTo(
                panel.querySelectorAll(".unit-handles li"),
                { opacity: 0, y: 10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06 },
                desktop ? 0.3 : 0.5
              );
            });
          }

          /* ── The pinned stage (desktop only) ── */
          if (desktop) {
            const slides = q(".stage-slide");
            const bars = q(".stage-progress a");
            const num = scope.querySelector<HTMLElement>(".stage-label-num > span");
            const name = scope.querySelector<HTMLElement>(".stage-label-name > span");
            let active = -1;
            let roll: gsap.core.Timeline | null = null;

            const setActive = (i: number) => {
              if (i === active || !num || !name) return;
              const first = active === -1;
              active = i;
              bars.forEach((b, j) => b.classList.toggle("is-active", j === i));
              // Reduced motion swaps the photo by class; with motion the
              // scrubbed wipe below does it, and this is harmless.
              slides.forEach((s, j) => s.classList.toggle("is-shown", j === i));

              const apply = () => {
                num.textContent = pad(i + 1);
                name.textContent = FLEET[i].name;
              };
              if (first || !motion) return apply();

              roll?.kill();
              roll = gsap
                .timeline()
                .to([num, name], { yPercent: -110, duration: 0.22, ease: "power2.in" })
                .add(apply)
                .fromTo([num, name], { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: "brand" });
            };

            // "Which truck is this?" follows whichever panel holds the centre.
            panels.forEach((panel, i) =>
              ScrollTrigger.create({
                trigger: panel,
                start: "top center",
                end: "bottom center",
                onToggle: (self) => self.isActive && setActive(i),
              })
            );
            setActive(0);

            if (motion) {
              gsap.set(slides, { visibility: "visible" });
              slides.forEach((slide, i) => {
                if (i === 0) return;
                gsap
                  .timeline({
                    scrollTrigger: {
                      trigger: panels[i],
                      start: "top 85%",
                      end: "top 38%",
                      scrub: 0.6,
                    },
                  })
                  .fromTo(
                    slide,
                    { clipPath: "inset(100% 0% 0% 0%)" },
                    { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
                    0
                  )
                  .fromTo(slide.querySelector("img"), { scale: 1.18 }, { scale: 1, ease: "none" }, 0);
              });
            }
          }

          return () => split?.revert();
        }
      );

      /* Finder → unit: after the jump, light the matching line briefly. */
      const onFinder = (e: MouseEvent) => {
        const chip = (e.target as HTMLElement).closest<HTMLAnchorElement>(".finder-chip");
        if (!chip) return;
        const item = scope.querySelector<HTMLElement>(
          `.unit-handles li[data-handle="${chip.dataset.handle}"]`
        );
        if (!item) return;
        item.classList.remove("is-match");
        // Restart the highlight even when the same chip is clicked twice.
        void item.offsetWidth;
        item.classList.add("is-match");
        window.setTimeout(() => item.classList.remove("is-match"), 2200);
      };
      scope.addEventListener("click", onFinder);

      return () => {
        scope.removeEventListener("click", onFinder);
        media.revert();
      };
    },
    { scope: root }
  );

  return (
    <section
      id="fleet"
      ref={root}
      data-motion="self"
      className="fleet-showroom section-space"
      aria-labelledby="fleet-heading"
    >
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="section-kicker">The fleet</p>
            <h2 id="fleet-heading">
              What each one
              <br />
              is for.
            </h2>
          </div>
          <p>Start from the job, or scroll through the four kinds of equipment we run.</p>
        </div>

        <nav className="fleet-finder" aria-label="Find equipment by job">
          <p className="fleet-finder-label">Find your job</p>
          <ul>
            {FLEET.flatMap((unit, i) =>
              unit.handles.map((handle) => (
                <li key={`${unit.id}-${handle}`}>
                  <a
                    className="finder-chip"
                    href={`#${unit.id}`}
                    data-handle={`${unit.id}:${handle}`}
                  >
                    <span aria-hidden="true">{pad(i + 1)}</span>
                    {handle}
                    <span className="sr-only"> — {unit.name}</span>
                  </a>
                </li>
              ))
            )}
          </ul>
        </nav>

        <div className="showroom">
          <div className="showroom-copy">
            {FLEET.map((unit, i) => (
              <article
                key={unit.id}
                id={unit.id}
                className="unit-panel"
                aria-labelledby={`${unit.id}-name`}
              >
                <div className="unit-media-mobile">
                  <Image src={unit.image} alt={unit.alt} fill sizes="100vw" quality={78} style={{ objectPosition: unit.imagePosition }} />
                </div>
                <p className="unit-count">
                  {pad(i + 1)} <span>/ {pad(FLEET.length)}</span>
                </p>
                <h3 id={`${unit.id}-name`}>{unit.name}</h3>
                <p className="unit-summary">{unit.summary}</p>
                <p className="unit-built">Built for</p>
                <ul className="unit-handles">
                  {unit.handles.map((handle) => (
                    <li key={handle} data-handle={`${unit.id}:${handle}`}>
                      <Icon name="check" />
                      {handle}
                    </li>
                  ))}
                </ul>
                <a className="unit-ask" href={`tel:${PRIMARY.tel}`} data-cursor="call">
                  Ask dispatch about this <Icon name="arrow" />
                  <span className="sr-only"> — {unit.name}, {PRIMARY.phone}</span>
                </a>
              </article>
            ))}
          </div>

          <div className="showroom-stage">
            <div className="stage-sticky">
              <div className="stage-frame">
                {FLEET.map((unit, i) => (
                  <div
                    key={unit.id}
                    className={`stage-slide${i === 0 ? " is-shown" : ""}`}
                    style={{ zIndex: i + 1 }}
                  >
                    <Image
                      src={unit.image}
                      alt={unit.alt}
                      fill
                      sizes="(max-width: 1023px) 0px, 58vw"
                      quality={80}
                      style={{ objectPosition: unit.imagePosition }}
                    />
                  </div>
                ))}
                <span className="stage-shade" aria-hidden="true" />

                {/* Duplicates the panel heading, so hidden from assistive tech. */}
                <div className="stage-label" aria-hidden="true">
                  <span className="stage-label-num">
                    <span>01</span>
                  </span>
                  <span className="stage-label-name">
                    <span>{FLEET[0].name}</span>
                  </span>
                </div>

                <nav className="stage-progress" aria-label="Jump to equipment">
                  {FLEET.map((unit, i) => (
                    <a
                      key={unit.id}
                      href={`#${unit.id}`}
                      className={i === 0 ? "is-active" : undefined}
                      aria-label={unit.name}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
