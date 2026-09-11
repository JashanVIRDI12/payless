import type { Metadata } from "next";
import heroImage from "@/assets/images/photo-semi-on-trailer.webp";
import PageHero from "@/components/PageHero";
import Locations from "@/components/Locations";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Dispatch Locations",
  description:
    "Four 24-hour dispatch offices across the Sea-to-Sky — North Vancouver, Squamish, Whistler and Pemberton. Call the one nearest you, or send details for a planned move.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="24 hours a day, every day"
        title="Call the dispatch nearest you."
        lede={`Four offices cover the corridor from ${COMPANY.coverage}. For anything urgent, phone is fastest — someone answers whatever the hour.`}
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
