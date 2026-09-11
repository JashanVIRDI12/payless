"use server";

import { PRIMARY } from "@/lib/site";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message: string;
  /** Field-level errors, keyed by input name. */
  errors?: Record<string, string>;
};

const MAX = { name: 120, phone: 40, email: 160, message: 4000 };

function clean(v: FormDataEntryValue | null, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Contact form handler.
 *
 * Delivery is intentionally pluggable: set CONTACT_WEBHOOK_URL to any endpoint
 * that accepts a JSON POST (Resend, Formspree, a Zapier hook, an internal
 * mailer). Until that is set the form does not pretend to have sent anything —
 * it tells the visitor to phone instead, which for this business is the better
 * channel anyway.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Honeypot: a hidden field real people never fill in.
  if (clean(formData.get("company"), 100)) {
    return { status: "ok", message: "Thanks — we'll be in touch." };
  }

  const name = clean(formData.get("name"), MAX.name);
  const phone = clean(formData.get("phone"), MAX.phone);
  const email = clean(formData.get("email"), MAX.email);
  const message = clean(formData.get("message"), MAX.message);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!phone && !email) {
    errors.phone = "Give us a phone number or an email so we can reply.";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That email address doesn't look right.";
  }
  if (message.length < 10) {
    errors.message = "Please tell us a little more about what you need.";
  }

  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the fields below.", errors };
  }

  const endpoint = process.env.CONTACT_WEBHOOK_URL;
  if (!endpoint) {
    console.error(
      "[contact] CONTACT_WEBHOOK_URL is not set — the form cannot deliver mail. See README."
    );
    return {
      status: "error",
      message: `Online enquiries are currently unavailable. Please call ${PRIMARY.phone} — dispatch answers 24/7.`,
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        message,
        source: "paylesstowing.ca homepage",
        receivedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);

    return {
      status: "ok",
      message: "Thanks — we've got your message and will be in touch.",
    };
  } catch (err) {
    console.error("[contact] delivery failed:", err);
    return {
      status: "error",
      message: `Something went wrong sending that. Please call ${PRIMARY.phone} and we'll help right away.`,
    };
  }
}
