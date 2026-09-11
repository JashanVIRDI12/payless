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
    "Flat decks, roadside units, heavy-duty wreckers and equipment floats — the equipment Payless runs across the Sea-to-Sky Corridor and what each one is for.",
  alternates: { canonical: "/fleet" },
};

export default function FleetPage() {
  return (
    <>
      <PageHero
        kicker="Equipment"
        title="The right truck for the job."
        lede="Sending the wrong equipment costs everyone time. Here is what we run, and the kind of work each one is built for."
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
            <Link href="/contact">talk to your nearest dispatch</Link>.
          </p>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
