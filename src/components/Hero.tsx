"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import heroImage from "@/assets/images/photo-wrecker-towing-semi.webp";
import { COMPANY, PRIMARY } from "@/lib/site";
import { EASE, registerGsap, releaseWords, stageLines } from "@/lib/motion";
import Link from "next/link";
import Icon from "./Icon";
import ArrowFillButton from "@/components/ui/arrow-fill-button";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

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
          // The photograph settles rather than arrives: one slow, weighted move.
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
          .fromTo(q(".dispatch-call"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 1.3);

        return () => intro.kill();
      });

      /*
       * The one reserved scroll moment: photograph and copy come apart as the
       * hero leaves. This is genuine layer separation — the copy is a real layer
       * over the photo — so nothing pretends the truck is cut out of its own
       * background. Transforms only, linear, no pin and no scroll capture.
       */
      media.add("(prefers-reduced-motion: no-preference) and (min-width: 901px)", () => {
        const exit = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        exit
          .to(q(".hero-bg-layer"), { yPercent: 9, scale: 1.06, ease: "none" }, 0)
          .to(q(".hero-inner"), { yPercent: -20, opacity: 0.2, ease: "none" }, 0);

        return () => exit.kill();
      });

      return () => media.revert();
    },
    { scope: root }
  );

  return (
    <section id="top" ref={root} aria-labelledby="hero-heading" className="towing-hero">
      <div className="hero-stage">
        <div className="hero-bg">
          <div className="hero-bg-layer">
            <Image
              src={heroImage}
              alt="A blue Payless heavy wrecker with orange and white stripes towing a white semi-truck along a gravel roadside"
              fill
              sizes="100vw"
              quality={75}
              loading="eager"
              fetchPriority="high"
              placeholder="blur"
              className="hero-photo"
            />
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
      </div>
    </section>
  );
}
