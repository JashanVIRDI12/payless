import Hero from "@/components/Hero";
import Trust from "@/components/Trust";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Reviews from "@/components/Reviews";
import Locations from "@/components/Locations";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import FinalCta from "@/components/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Trust />
      <Services />
      <HowItWorks />
      <About />
      <Reviews />
      <Locations />
      <Faq />
      <Contact enabled={Boolean(process.env.CONTACT_WEBHOOK_URL)} />
      <FinalCta />
    </>
  );
}
