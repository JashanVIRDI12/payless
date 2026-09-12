import type { Metadata } from "next";
import heroImage from "@/assets/images/photo-red-payless-wrecker.webp";
import PageHero from "@/components/PageHero";
import About from "@/components/About";
import Trust from "@/components/Trust";
import Reviews from "@/components/Reviews";
import FinalCta from "@/components/FinalCta";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Payless Towing Service & Recovery — years of hands-on experience, a seasoned crew and the equipment Edmonton's roads ask for.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Proudly serving our community"
        title="A legacy of getting the job done."
        lede="Payless Towing Service & Recovery has built its reputation through years of hands-on experience, capable equipment, and a commitment to doing the job right. Today, we support drivers, businesses, and commercial operators with towing, recovery, transport, and roadside solutions they can count on."
        image={heroImage}
        alt="A red Payless Towing heavy wrecker with a blue boom, parked on a snowy lot under a clear blue sky"
        position="50% 68%"
      />
      <About />
      <Trust />
      <Reviews />
      <FinalCta />
    </>
  );
}
