import { PRIMARY } from "@/lib/site";
import Icon from "./Icon";
const faqs = [
  ["How much will my tow cost?", "Pricing depends on factors such as the vehicle, location, towing distance, equipment required, and complexity of the job. Contact our team with the details and we’ll provide an estimate based on your situation."],
  ["How quickly can you reach me?", "Response times vary depending on your location, current availability, traffic, weather, and the equipment your job requires. Our dispatch team will provide the best available timeframe when you call."],
  ["Are your towing services available 24/7?", "Yes. Payless Towing Service & Recovery provides 24/7 towing, recovery, and roadside assistance, so help is available day or night."],
  ["Can you handle heavy-duty trucks and commercial vehicles?", "Yes. Our heavy-duty capabilities include specialized equipment such as 50 Ton and 60 Ton Wreckers for large commercial vehicles and demanding towing and recovery operations."],
  ["Do you provide long-distance towing and equipment transport?", "Yes. We provide long-distance towing as well as heavy equipment and specialized transport solutions, including Landoll Trailer service."],
  ["Can you handle complex accident and recovery situations?", "Yes. Our team is equipped for accident recovery, heavy-duty recovery, freight clean-up, and complex operations requiring specialized recovery equipment."],
];
export default function Faq() {
  return <section id="faq" aria-labelledby="faq-heading" className="faq-section section-space"><div className="site-container faq-grid"><div><p className="section-kicker">A few things to know</p><h2 id="faq-heading">Towing questions,<br />answered.</h2><p>Need help with a specific situation? Our dispatch team can help determine the right service and equipment for your needs.</p><a className="text-call" href={`tel:${PRIMARY.tel}`}><Icon name="phone" />{PRIMARY.phone}</a></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question} name="towing-faq"><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></section>;
}
