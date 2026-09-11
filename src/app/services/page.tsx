import type { Metadata } from "next";
import Link from "next/link";
import heroImage from "@/assets/images/heavy-towing-v2.webp";
import PageHero from "@/components/PageHero";
import ServiceGrid from "@/components/ServiceGrid";
import HowItWorks from "@/components/HowItWorks";
import FinalCta from "@/components/FinalCta";
import Icon from "@/components/Icon";
import { PRIMARY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Towing & Roadside Services",
  description:
    "Towing, recovery, roadside assistance and transport across the Sea-to-Sky Corridor — light, medium and heavy duty, plus equipment and long-haul moves.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Towing, recovery & transport"
        title="Whatever you're driving, whatever went wrong."
        lede="Six ways we help drivers and operators along Highway 99 — from a lock-out on the shoulder to a semi that needs lifting out of a lane."
        image={heroImage}
        alt="A yellow heavy-duty wrecker coupled to a white semi tractor, snow-capped mountains behind"
        position="52% 58%"
      />

      <section className="services-section section-space" aria-labelledby="services-heading">
        <div className="site-container">
          <h2 id="services-heading" className="sr-only">Our services</h2>
          <ServiceGrid />
          <div className="service-help">
            <span><Icon name="phone" /><strong>Not sure what you need?</strong> Describe the problem. We&rsquo;ll help you take the next step.</span>
            <Link href="/contact">Talk to dispatch <Icon name="arrow" /></Link>
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="faq-section section-space" aria-labelledby="services-next-heading">
        <div className="site-container faq-grid">
          <div>
            <p className="section-kicker">Before you call</p>
            <h2 id="services-next-heading">What to have<br />ready.</h2>
            <p>The more dispatch knows up front, the faster the right truck gets sent.</p>
            <a className="text-call" href={`tel:${PRIMARY.tel}`}><Icon name="phone" />{PRIMARY.phone}</a>
          </div>
          <ul className="check-list check-list-lg">
            <li><Icon name="check" />Where you are — road, direction of travel, nearest exit or landmark</li>
            <li><Icon name="check" />Your vehicle&rsquo;s make, model and condition</li>
            <li><Icon name="check" />Whether it is electric or all-wheel drive</li>
            <li><Icon name="check" />Where it needs to go</li>
            <li><Icon name="check" />Any access restrictions at either end</li>
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
