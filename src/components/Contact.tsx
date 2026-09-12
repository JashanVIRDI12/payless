"use client";
import { useActionState } from "react";
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
  return <section id="contact-form" className="contact-section section-space" aria-labelledby="contact-heading"><div className="site-container contact-grid"><div><p className="section-kicker">Plan your next move</p><h2 id="contact-heading">Have something heavy to move?<br />We’re up for it.</h2><p>Planning a vehicle tow, equipment haul, or specialized transport? Share the job details with our team and we’ll help determine the right equipment and approach for the move.</p><a className="text-call" href={`tel:${PRIMARY.tel}`}><Icon name="phone" />{PRIMARY.phone}</a><p className="contact-urgent">Need immediate towing or recovery? <a href={`tel:${PRIMARY.tel}`}>Call our 24/7 dispatch team.</a></p></div>{enabled ? <EnquiryForm /> : <div className="quote-call-panel"><Icon name="truck" /><h3>Get a quote for your move.</h3><p>Have these details ready when you call:</p><ul className="check-list"><li><Icon name="check" />Pickup &amp; destination</li><li><Icon name="check" />Vehicle or equipment details</li><li><Icon name="check" />Preferred date &amp; time</li></ul><a href={`tel:${PRIMARY.tel}`} className="button button-dark"><Icon name="phone" />Discuss your transport</a></div>}</div></section>;
}
