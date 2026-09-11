"use client";
import { useActionState } from "react";
import Link from "next/link";
import { submitContact, type ContactState } from "@/app/actions";
import { PRIMARY } from "@/lib/site";
import Icon from "./Icon";

const INITIAL: ContactState = { status: "idle", message: "" };

function EnquiryForm() {
  const [state, action, pending] = useActionState(submitContact, INITIAL);
  return <form action={action} className="enquiry-form">
    <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
    <div className="form-fields">{[
      { name: "name", label: "Your name", type: "text", autoComplete: "name", required: true },
      { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", required: false },
      { name: "email", label: "Email address", type: "email", autoComplete: "email", required: false },
    ].map((field) => <div key={field.name} className={field.name === "name" ? "field field-wide" : "field"}><label htmlFor={`enquiry-${field.name}`}>{field.label}{field.required ? " (required)" : ""}</label><input id={`enquiry-${field.name}`} name={field.name} type={field.type} autoComplete={field.autoComplete} required={field.required} maxLength={field.name === "name" ? 120 : field.name === "phone" ? 40 : 160} aria-invalid={state.errors?.[field.name] ? true : undefined} aria-describedby={state.errors?.[field.name] ? `error-${field.name}` : undefined} />{state.errors?.[field.name] && <span className="field-error" id={`error-${field.name}`}>{state.errors[field.name]}</span>}</div>)}</div>
    <p className="form-hint">Include a phone number or email so we can reply.</p>
    <div className="field"><label htmlFor="enquiry-message">What do you need moved? (required)</label><textarea id="enquiry-message" name="message" rows={4} minLength={10} maxLength={4000} required aria-invalid={state.errors?.message ? true : undefined} aria-describedby="message-hint error-message" /><span id="message-hint" className="form-hint">Include your pickup, destination, vehicle or equipment, and preferred date.</span><span id="error-message" className="field-error">{state.errors?.message}</span></div>
    <button type="submit" disabled={pending} className="button button-dark">{pending ? "Sending…" : "Send enquiry"}<Icon name="arrow" /></button>
    <p role="status" aria-live="polite" className={state.status === "error" ? "field-error" : "form-hint"}>{state.message}</p>
  </form>;
}

export default function Contact({ enabled = false }: { enabled?: boolean }) {
  return <section id="contact-form" className="contact-section section-space" aria-labelledby="contact-heading"><div className="site-container contact-grid"><div><p className="section-kicker">Plan your next move</p><h2 id="contact-heading">A scheduled haul?<br />Let’s talk details.</h2><p>Moving a vehicle across the province or getting equipment to site? Tell us what needs moving, where it’s going and when.</p><a className="text-call" href={`tel:${PRIMARY.tel}`}><Icon name="phone" />{PRIMARY.phone}</a><p className="contact-urgent">Need roadside help now? Call your <Link href="/contact#locations">nearest dispatch</Link> for immediate enquiries.</p></div>{enabled ? <EnquiryForm /> : <div className="quote-call-panel"><Icon name="truck" /><h3>Get a quote for your move.</h3><p>Have these details ready when you call:</p><ul className="check-list"><li><Icon name="check" />Pickup address and destination</li><li><Icon name="check" />Vehicle or equipment details</li><li><Icon name="check" />Your preferred date and time</li></ul><a href={`tel:${PRIMARY.tel}`} className="button button-dark"><Icon name="phone" />Call to discuss your move</a></div>}</div></section>;
}
