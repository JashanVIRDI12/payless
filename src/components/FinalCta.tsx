import Image from "next/image";
import Link from "next/link";
import heroImage from "@/assets/images/photo-building-move.webp";
import { PRIMARY } from "@/lib/site";
import Icon from "./Icon";
import ArrowFillButton from "@/components/ui/arrow-fill-button";
export default function FinalCta() {
  return <section id="contact" className="final-cta" aria-labelledby="cta-heading"><div className="site-container final-cta-grid"><div><p className="availability"><span /> 24/7 towing &amp; roadside assistance</p><h2 id="cta-heading">Your next move<br />starts with a call.</h2><p>From a roadside setback to a planned haul, talk to Payless.</p><ArrowFillButton href={`tel:${PRIMARY.tel}`} btnText={`Call ${PRIMARY.phone}`} aria-label={`Call Payless Auto Towing, ${PRIMARY.phone}`} data-cursor="call" /><Link href="/contact" className="final-local">Find your local dispatch <Icon name="arrow" /></Link></div><div className="final-cta-image"><Image src={heroImage} alt="A blue Payless heavy wrecker towing a portable site office along a gravel road" fill sizes="(max-width: 900px) 100vw, 50vw" quality={80} /></div></div></section>;
}
