import FilmLoader from "@/components/FilmLoader";
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
      {/* Holds the page while the hero film's frames decode. Removes itself
          on the frames, on a 6s cap, or on a CSS failsafe if the bundle never
          runs — and never appears at all under reduced motion. */}
      <FilmLoader />
      <Hero />
      <Trust />
      <Services />
      <HowItWorks />
      <About />
      <Reviews />
      <Locations />
      <Faq />
      <Contact />
      <FinalCta />
    </>
  );
}
