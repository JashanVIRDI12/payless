import Link from "next/link";
import Icon from "./Icon";
import ServiceGrid from "./ServiceGrid";

export default function Services() {
  return <section id="services" aria-labelledby="services-heading" className="services-section section-space"><div className="site-container">
    <div className="section-heading"><div><p className="section-kicker">Towing, recovery &amp; transport</p><h2 id="services-heading">The right equipment.<br />For every challenge.</h2></div><p>From roadside towing and accident recovery to heavy-duty wreckers, specialized transport, and complex recoveries, our fleet is built to handle jobs of every scale with confidence.</p></div>
    <ServiceGrid />
    <div className="service-help"><span><Icon name="phone" /><strong>Not sure what you need?</strong> Describe the problem. We’ll help you take the next step.</span><Link href="/services">See all services <Icon name="arrow" /></Link></div>
  </div></section>;
}
