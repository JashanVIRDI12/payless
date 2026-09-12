import type { Metadata } from "next";
import heroImage from "@/assets/images/photo-semi-on-trailer.webp";
import PageHero from "@/components/PageHero";
import Locations from "@/components/Locations";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";

export const metadata: Metadata = {
  title: "Contact & 24/7 Dispatch",
  description:
    "One 24-hour dispatch line for Edmonton and surrounding areas. Call for towing, recovery or roadside assistance, or send the details for a planned move.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="24 hours a day, 7 days a week"
        title="Need assistance? We’re one call away."
        lede="Towing, roadside assistance, heavy-duty recovery, or transport, our dispatch team is available 24/7 to understand your situation and arrange the right support."
        image={heroImage}
        alt="A black semi-tractor chained down on a low-deck trailer in a snowy yard, a heavy wrecker parked behind"
        position="60% 43%"
      />
      <Locations />
      <Contact enabled={Boolean(process.env.CONTACT_WEBHOOK_URL)} />
      <Faq />
      <FinalCta />
    </>
  );
}
