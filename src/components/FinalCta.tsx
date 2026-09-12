import Image from "next/image";
import Link from "next/link";
import heroImage from "@/assets/images/photo-building-move.webp";
import { PRIMARY } from "@/lib/site";
import Icon from "./Icon";
import ArrowFillButton from "@/components/ui/arrow-fill-button";
export default function FinalCta() {
  return <section id="contact" className="final-cta" aria-labelledby="cta-heading"><div className="site-container final-cta-grid"><div><p className="availability"><span /> 24/7 towing, recovery &amp; roadside support</p><h2 id="cta-heading">Your next move<br />starts with a call.</h2><p>Need a tow, roadside assistance, heavy-duty recovery, or specialized transport? One call connects you with the team and equipment to get the job moving.</p><ArrowFillButton href={`tel:${PRIMARY.tel}`} btnText="Call 24/7 dispatch" aria-label={`Call Payless Towing dispatch, ${PRIMARY.phone}`} data-cursor="call" /><Link href="/services" className="final-local">Explore our services <Icon name="arrow" /></Link></div><div className="final-cta-image"><Image src={heroImage} alt="A blue Payless heavy wrecker towing a portable site office along a gravel road" fill sizes="(max-width: 900px) 100vw, 50vw" quality={80} /></div></div></section>;
}
