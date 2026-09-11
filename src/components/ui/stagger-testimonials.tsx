"use client";

// Adapted from the stagger-testimonials component supplied by the user.
// Stable review identities and accessible controls replace demo data/random keys.
import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { REVIEWS } from "@/lib/site";
import { cn } from "@/lib/utils";

const reviews = [REVIEWS[0], REVIEWS[2], REVIEWS[3], REVIEWS[5], REVIEWS[6]];

export function StaggerTestimonials() {
  const [active, setActive] = useState(0);
  const move = (steps: number) => setActive((current) => (current + steps + reviews.length) % reviews.length);
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  };
  return <div className="stagger-testimonials" role="region" aria-roledescription="carousel" aria-label="Customer testimonials" onKeyDown={onKey}>
    <div className="testimonial-stage">
      {reviews.map((review, index) => {
        const position = ((index - active + reviews.length + 2) % reviews.length) - 2;
        const center = position === 0;
        return <article key={review.name} className={cn("testimonial-card", center && "is-center")} aria-hidden={!center} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${reviews.length}`} style={{ "--position": position, "--rotation": center ? "0deg" : position % 2 ? "3deg" : "-3deg", "--lift": center ? "-35px" : position % 2 ? "25px" : "7px", zIndex: center ? 4 : 3 - Math.abs(position) } as CSSProperties}>
          {!center && <button type="button" className="testimonial-card-select" onClick={() => move(position)} tabIndex={-1} aria-label={`Read ${review.name}'s review`} />}
          <div className="testimonial-card-top"><Quote size={27} strokeWidth={1.4} /><span aria-label="5 out of 5 stars" role="img">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={12} fill="currentColor" strokeWidth={0} />)}</span></div>
          <blockquote>“{review.quote}”</blockquote>
          <div className="testimonial-author"><span className="testimonial-initial" aria-hidden="true">{review.name.charAt(0)}</span><div><strong>{review.name}</strong><span>Payless customer</span></div></div>
        </article>;
      })}
    </div>
    <div className="testimonial-controls"><button type="button" onClick={() => move(-1)} aria-label="Previous testimonial"><ArrowLeft size={20} /></button><p aria-live="polite" aria-atomic="true"><span className="sr-only">Testimonial </span>{String(active + 1).padStart(2, "0")} <span>/ {String(reviews.length).padStart(2, "0")}</span></p><button type="button" onClick={() => move(1)} aria-label="Next testimonial"><ArrowRight size={20} /></button></div>
  </div>;
}
