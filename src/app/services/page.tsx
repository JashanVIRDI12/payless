import type { Metadata } from "next";
import Link from "next/link";
import heroImage from "@/assets/images/photo-orange-wrecker.webp";
import PageHero from "@/components/PageHero";
import ServiceGrid from "@/components/ServiceGrid";
import HowItWorks from "@/components/HowItWorks";
import FinalCta from "@/components/FinalCta";
import Icon from "@/components/Icon";
import { PRIMARY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Towing & Roadside Services",
  description:
    "Towing, recovery, roadside assistance and transport across Edmonton and surrounding areas — light, medium and heavy duty, plus equipment and long-distance moves.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Towing, recovery & transport"
        title="The right equipment for every job."
        lede="Towing is only part of what we do. Our capabilities cover roadside assistance, heavy-duty recovery, specialized transport, accident clean-up, and more, backed by experienced operators and equipment built for demanding jobs."
        image={heroImage}
        alt="An orange Payless heavy wrecker with a blue recovery boom, parked in front of a grey service building"
        position="60% 20%"
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
            <h2 id="services-next-heading">A few details help us<br />send the right truck.</h2>
            <p>Having the right information ready helps our dispatch team understand the job, choose the appropriate equipment, and arrange your service efficiently.</p>
            <a className="text-call" href={`tel:${PRIMARY.tel}`}><Icon name="phone" />{PRIMARY.phone}</a>
          </div>
          <ul className="check-list check-list-lg">
            <li><Icon name="check" /><span><strong>Your location:</strong> Road, direction of travel, or nearest landmark</span></li>
            <li><Icon name="check" /><span><strong>Vehicle details:</strong> Type, make, model, and approximate size</span></li>
            <li><Icon name="check" /><span><strong>Vehicle condition:</strong> Breakdown, accident, stuck, or other issue</span></li>
            <li><Icon name="check" /><span><strong>Pickup &amp; destination:</strong> Where the vehicle is and where it needs to go</span></li>
            <li><Icon name="check" /><span><strong>Access details:</strong> Any space, clearance, or site restrictions</span></li>
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
