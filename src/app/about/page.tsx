import type { Metadata } from "next";
import heroImage from "@/assets/images/long-haul-v2.webp";
import PageHero from "@/components/PageHero";
import About from "@/components/About";
import Trust from "@/components/Trust";
import Reviews from "@/components/Reviews";
import FinalCta from "@/components/FinalCta";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Towing the Sea-to-Sky Corridor since the 1970s — four dispatch locations, local operators and the equipment these roads ask for.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker={`Serving the corridor since the ${COMPANY.since}`}
        title="We know this road in every season."
        lede={`Payless has worked the Sea-to-Sky between ${COMPANY.coverage} for decades — through black ice, washouts and the ordinary bad days that strand people a long way from home.`}
        image={heroImage}
        alt="A yellow flat deck tow truck carrying a silver sedan along a coastal mountain highway"
        position="50% 62%"
      />
      <About />
      <Trust />
      <Reviews />
      <FinalCta />
    </>
  );
}
