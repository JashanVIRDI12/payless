import { COMPANY } from "@/lib/site";
import Icon from "./Icon";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
export default function Reviews() {
  return <section id="reviews" className="reviews-section section-space" aria-labelledby="reviews-heading"><div className="site-container"><div className="section-heading"><div><p className="section-kicker">From the people we’ve helped</p><h2 id="reviews-heading">Trusted on the road.<br />Remembered for the service.</h2></div><p>Every call is different, but the standard stays the same: show up prepared, treat people right, and get the job handled properly.</p></div><StaggerTestimonials /><a className="reviews-source" href={COMPANY.url} target="_blank" rel="noreferrer">Reviews published by Payless <Icon name="arrow" /></a></div></section>;
}
