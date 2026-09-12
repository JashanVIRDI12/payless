import type { Metadata } from "next";
import Link from "next/link";
import heroImage from "@/assets/images/photo-red-rotator.webp";
import PageHero from "@/components/PageHero";
import FleetShowroom from "@/components/FleetShowroom";
import FinalCta from "@/components/FinalCta";
import Icon from "@/components/Icon";
import { PRIMARY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Fleet",
  description:
    "Flatbed and tilt decks, roadside units, heavy-duty wreckers and equipment transport — the equipment Payless runs across Edmonton and surrounding areas, and what each one is for.",
  alternates: { canonical: "/fleet" },
};

export default function FleetPage() {
  return (
    <>
      <PageHero
        kicker="Our fleet"
        title="The equipment behind every recovery."
        lede="Every job demands the right combination of power, equipment, and control. Our diverse fleet includes heavy-duty wreckers, recovery equipment, flatbed and tilt deck trucks, and specialized transport solutions built to take on demanding work safely and efficiently."
        image={heroImage}
        alt="A red heavy rotator wrecker with its boom raised, on display at an indoor truck show"
        position="60% 60%"
      />

      <FleetShowroom />

      {/* Outside the showroom, so PageMotion's shared reveals handle these. */}
      <section className="fleet-after" aria-label="Help choosing equipment">
        <div className="site-container">
          <div className="service-help">
            <span>
              <Icon name="truck" />
              <strong>Not sure which you need?</strong> Describe the vehicle and
              the situation — dispatch will match the equipment.
            </span>
            <a href={`tel:${PRIMARY.tel}`}>
              Call {PRIMARY.phone} <Icon name="arrow" />
            </a>
          </div>

          <p className="fleet-note">
            Equipment is described by what it does rather than by unit counts or
            models. For availability on a specific job,{" "}
            <Link href="/contact">talk to dispatch</Link>.
          </p>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
