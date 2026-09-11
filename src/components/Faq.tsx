import { PRIMARY } from "@/lib/site";
import Icon from "./Icon";
const faqs = [
  ["How much will my tow cost?", "Call dispatch with your pickup location, destination, vehicle type and a description of the problem. Ask for an estimate and what it includes before arranging a tow; the equipment and recovery work needed can affect the cost."],
  ["How soon can a truck reach me?", "Call the nearest dispatch for current availability and an estimated arrival time. Traffic, weather, your location and the equipment required can affect timing."],
  ["Do you operate at night and on weekends?", "Yes. Payless provides 24-hour emergency towing and roadside assistance throughout the Sea-to-Sky Corridor. Call the dispatch office closest to your location."],
  ["Can you transport a luxury, AWD or electric vehicle?", "Payless offers flat-deck transport for family cars and luxury vehicles. Tell dispatch your exact make and model, including whether it is electric or all-wheel drive, so the team can confirm a suitable transport method."],
  ["Can I arrange a long-distance or equipment move?", "Yes. Long-haul towing, heavy equipment transport and flat-deck services are available. Call with the pickup and destination, the vehicle or equipment details, and your preferred timing to discuss the move."],
  ["Can I use my roadside assistance membership?", "Payless is an authorized service provider for leading auto service clubs. Check with your club and dispatch about the process and your coverage before booking; benefits depend on your membership."],
];
export default function Faq() {
  return <section id="faq" aria-labelledby="faq-heading" className="faq-section section-space"><div className="site-container faq-grid"><div><p className="section-kicker">A few things to know</p><h2 id="faq-heading">Towing questions,<br />answered.</h2><p>Need advice for your situation? Talk to a local dispatcher.</p><a className="text-call" href={`tel:${PRIMARY.tel}`}><Icon name="phone" />{PRIMARY.phone}</a></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question} name="towing-faq"><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></section>;
}
