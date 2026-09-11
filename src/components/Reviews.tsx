import { COMPANY } from "@/lib/site";
import Icon from "./Icon";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
export default function Reviews() {
  return <section id="reviews" className="reviews-section section-space" aria-labelledby="reviews-heading"><div className="site-container"><div className="section-heading"><div><p className="section-kicker">From drivers we’ve helped</p><h2 id="reviews-heading">Good people.<br />When it matters most.</h2></div><a className="reviews-source" href={COMPANY.url} target="_blank" rel="noreferrer">Reviews published by Payless <Icon name="arrow" /></a></div><StaggerTestimonials /></div></section>;
}
