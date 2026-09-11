"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import crewImage from "@/assets/images/photo-crew-rotator.webp";
import Icon, { type IconName } from "./Icon";
import { registerGsap, revealHeading } from "@/lib/motion";

const CREDENTIALS: { icon: IconName; label: string }[] = [
  { icon: "shield", label: "Fully insured towing and recovery" },
  { icon: "operator", label: "Highly trained operators" },
  { icon: "award", label: "Authorized provider for leading auto service clubs" },
];

/**
 * "These roads are our home, too." as an editorial spread.
 *
 * The photograph is a wide landscape — truck on the left, technician at the
 * wheel on the right — and the old half-width square crop cut the truck in
 * two. So it gets the full measure here, as a window that opens from a slit
 * as you scroll while the image eases out of a zoom. The heritage label hangs
 * off the frame's edge, which is why it lives outside the clipped element.
 *
 * Owns its motion (data-motion="self"): PageMotion skips everything inside.
 */
export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const scope = root.current!;
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, scope);
      const media = gsap.matchMedia();

      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          narrow: "(max-width: 900px)",
        },
        (ctx) => {
          const { motion, narrow } = ctx.conditions as { motion: boolean; narrow: boolean };
          if (!motion) return;

          const split = revealHeading(scope);

          gsap.fromTo(
            q(".about-intro p"),
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.12,
              scrollTrigger: { trigger: q(".about-intro")[0], start: "top 86%", once: true },
            }
          );

          /*
           * The window. Scrubbed, so it is exactly as open as the reader has
           * scrolled — and it finishes while the frame is still well on
           * screen, so nobody reads the section with it half shut. The slit
           * is narrower on phones, where a wide inset would leave a sliver.
           */
          const frame = q(".about-frame")[0];
          const photo = q(".about-frame-media")[0];
          const slit = narrow ? "14%" : "32%";
          const radius = narrow ? "18px" : "26px";

          if (frame && photo) {
            gsap
              .timeline({
                scrollTrigger: { trigger: frame, start: "top 96%", end: "top 30%", scrub: 0.8 },
              })
              .fromTo(
                frame,
                { clipPath: `inset(0% ${slit} 0% ${slit} round ${radius})` },
                { clipPath: `inset(0% 0% 0% 0% round ${radius})`, ease: "none" },
                0
              )
              .fromTo(photo, { scale: 1.3 }, { scale: 1.04, ease: "none" }, 0);

            gsap.fromTo(
              q(".heritage-card"),
              { opacity: 0, y: 40, rotation: -2 },
              {
                opacity: 1,
                y: 0,
                rotation: 0,
                duration: 0.95,
                scrollTrigger: { trigger: frame, start: "top 48%", once: true },
              }
            );
          }

          const foot = q(".about-foot")[0];
          if (foot) {
            gsap
              .timeline({ scrollTrigger: { trigger: foot, start: "top 88%", once: true } })
              .fromTo(q(".credential"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0)
              .fromTo(
                q(".credential-icon"),
                { scale: 0.5 },
                { scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(2)" },
                0.1
              )
              .fromTo(
                q(".credential-tick"),
                { drawSVG: "0%" },
                { drawSVG: "100%", duration: 0.45, stagger: 0.1, ease: "power2.out" },
                0.45
              )
              .fromTo(q(".about-cta"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.3);
          }

          return () => split?.revert();
        }
      );

      return () => media.revert();
    },
    { scope: root }
  );

  return (
    <section
      id="about"
      ref={root}
      data-motion="self"
      aria-labelledby="about-heading"
      className="about-section section-space"
    >
      <div className="site-container">
        <div className="section-heading about-heading">
          <div>
            <p className="section-kicker">Your neighbours on the road</p>
            <h2 id="about-heading">
              These roads are
              <br />
              our home, too.
            </h2>
          </div>
          <div className="about-intro">
            <p>
              From the North Shore to Pemberton and beyond, Payless has helped
              Sea-to-Sky drivers through breakdowns, difficult recoveries and
              everyday vehicle moves for decades.
            </p>
            <p>
              With tow trucks, flat decks and service vehicles across four
              dispatch locations, we bring local knowledge and the equipment
              your situation calls for.
            </p>
          </div>
        </div>

        <div className="about-window">
          <figure className="about-frame">
            <div className="about-frame-media">
              <Image
                src={crewImage}
                alt="Four Payless crew members standing beside a red heavy rotator wrecker inside a large service bay"
                fill
                sizes="(max-width: 900px) 100vw, 1320px"
                quality={82}
              />
            </div>
          </figure>

          <div className="heritage-card">
            <strong>
              Local roads.
              <br />
              Local people.
            </strong>
            <span>Serving the corridor since the 1970s</span>
          </div>
        </div>

        <div className="about-foot">
          <ul className="credential-list">
            {CREDENTIALS.map((item) => (
              <li key={item.label} className="credential">
                <span className="credential-icon" aria-hidden="true">
                  <Icon name={item.icon} />
                </span>
                <span className="credential-label">{item.label}</span>
                <svg className="credential-check" viewBox="0 0 24 24" aria-hidden="true">
                  <path className="credential-tick" d="M5 12.5l4.2 4.2L19 7" />
                </svg>
              </li>
            ))}
          </ul>
          <Link className="button button-dark about-cta" href="/contact">
            Meet your local dispatch <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
