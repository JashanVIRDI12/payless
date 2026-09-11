import Link from "next/link";
import Icon from "./Icon";
import ServiceGrid from "./ServiceGrid";

export default function Services() {
  return <section id="services" aria-labelledby="services-heading" className="services-section section-space"><div className="site-container">
    <div className="section-heading"><div><p className="section-kicker">Towing, recovery &amp; transport</p><h2 id="services-heading">The right help.<br />The right equipment.</h2></div><p>Broken down, locked out, or moving a heavy load? Find your service and talk to the team that knows these roads.</p></div>
    <ServiceGrid />
    <div className="service-help"><span><Icon name="phone" /><strong>Not sure what you need?</strong> Describe the problem. We’ll help you take the next step.</span><Link href="/services">See all services <Icon name="arrow" /></Link></div>
  </div></section>;
}
