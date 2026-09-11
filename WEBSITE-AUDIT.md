# Payless website review and redesign

Reviewed 10 September 2026. Scope: the local Next.js homepage, Payless’s public business information, and relevant towing websites serving the region.

## What made the previous page feel empty

The first screen devoted most of its height to a dark landscape with a relatively small truck. Oversized generic headlines and repeated large section padding made the page feel like a brand presentation. Heavy photo overlays reduced the visibility of equipment. The four dispatch numbers were harder to reach than the central office number, and service links jumped to the final call section instead of the local dispatch choices.

The site already contained six services, business history, testimonials, addresses and a mobile call action. Its main problem was hierarchy and practical detail, not an absence of all content.

## Implemented

| Gap | Change |
| --- | --- |
| Weak towing identity | Six coordinated yellow-truck concept photographs; the hero visibly leads with a flatbed and its load. |
| Excessive empty space | Smaller headings, tighter sections, visible service imagery and a compact trust strip. |
| Local emergency contact was buried | Four dispatch numbers directly under the hero, plus persistent mobile call and local-dispatch actions. |
| Unclear next step | A three-step calling checklist covering location, vehicle details and estimates. |
| Common customer questions unanswered | Native accessible FAQs about costs, timing, availability, vehicle requirements, long-distance transport and auto-club coverage. |
| Addresses lacked directions | Separate call and Google Maps directions links for each office. The corridor line is explicitly schematic. |
| Enquiry form could not send without configuration | A call-for-quote panel is shown until CONTACT_WEBHOOK_URL is configured. The form remains available when delivery is enabled. |
| Repeated testimonial section was too long | Three existing testimonials retained with source attribution; no unverified live aggregate score is shown. |
| Missing visual link preview | Added the new hero image to Open Graph metadata. |
| Content depended on motion startup | Main content now renders in its finished state without animation flags, shader loading or custom scrolling. |

Generated photos are labeled as illustrative. They are visual concepts rather than evidence of the real fleet.

## Research behind the additions

- [Payless Auto Towing](https://paylesstowing.ca/) lists four dispatch locations, round-the-clock service, the six core service categories, insured service and auto-club provider status. The redesign retains those facts and avoids adding unconfirmed service capabilities.
- [Mitchell’s Towing](https://www.mitchellstowing.ca/) makes vehicle categories, local dispatch and fleet imagery explicit. My design inference: Payless benefits from equally visible equipment and service choices, while using its own visual identity.
- [RoadSide Link](https://towtrucknow.ca/) explains the information dispatch needs, factors affecting pricing, and why arrival times vary. My recommendation is to answer those questions with a checklist and FAQ rather than invent fixed prices or guaranteed arrival times. Search-index content was available; direct page access returned 403.
- [Sea to Sky Towing’s Squamish page](https://seatoskytowing.ca/squamish.html) publishes local contact details and payment methods. My recommendation is to add Payless’s actual payment options once confirmed; competitor payment methods are not evidence of Payless’s policies.
- [Mitchell’s vehicle retrieval information](https://www.mitchellstowing.ca/general-5) separates roadside operations from vehicle collection. If Payless offers vehicle release or impound services, its actual hours and process deserve a dedicated page.

## Recommended next additions

| Priority | Addition | Information needed |
| --- | --- | --- |
| First | Real fleet and recovery gallery | Approved photographs, vehicle descriptions and permission to show identifiable customers. |
| First | Working online enquiry delivery | A JSON-compatible webhook endpoint and a verified destination for enquiries; test delivery before relying on the form. |
| First | Clear payment and quote policy | Accepted methods, call-out/minimum charges if applicable, after-hours or storage fees, and what an estimate includes. |
| Next | Dedicated service and location pages | Original, useful details for each service and city, linked from the homepage. Avoid duplicating the same generic paragraph across locations. |
| Next | Verified membership/partner information | The actual auto clubs served, the booking process and approved logos. |
| Next | Fleet capabilities | Confirmed capacity, clearance restrictions, EV/AWD procedures and the types of equipment available. |
| Next | Vehicle retrieval information, if applicable | Confirmed yard hours, release documents, contact procedure and fees. |
| Next | Contact privacy information | The actual purpose, recipients and retention policy for enquiry data. |
| Later | Measured lead conversion | Call-click and enquiry events connected to the owner’s analytics setup, without collecting message contents. |

Do not add made-up pricing, response-time guarantees, live availability indicators, certifications, insurer relationships or review scores.

## Design direction

- Palette: charcoal #171B1E, steel #252B30, brand yellow #FFC50C, white #FFFFFF, cool grey #E9EDEF and slate #5F6971.
- Typography: existing Archivo, narrower and heavier for compact headings; existing Geist for clear body copy.
- Layout: a left-aligned emergency message beside a dominant towing photograph, followed by a dispatch strip and readable image-led services. Mobile stacks the image below the short call section.
- Subject-specific decisions: actual brand logo, road-route motif, local dispatch numbers, heavy equipment imagery and a call-first journey.
- Review against the brief: yellow/charcoal is justified by Payless’s existing brand. Removed general-purpose cursor effects, shader treatment, marquees and oversized generic headlines so the equipment and help remain the focus.
- The UI/UX search script could not run because Python is unavailable. Applied the skill’s static accessibility, responsive layout and interaction guidelines as the fallback.

## Validation

- npm run build: passed, including TypeScript and prerendering.
- npm run lint: passed. Vendored agent-skill scripts are excluded from application linting.
- Production browser checks at 375, 390, 768, 1024 and 1440 pixels: no horizontal overflow, broken local anchors, broken images or page errors.
- Confirmed all six service cards and all four correct dispatch telephone links.
- FAQ opening/closing and exclusive expansion passed; mobile menu toggling, Escape closing and navigation closing passed.
- Content and service cards remain visible with JavaScript disabled; reduced-motion checks passed.
- Additional 320-pixel and landscape checks found no horizontal overflow. Landscape menus scroll within the available viewport.
- Desktop and mobile screenshot review completed. No production browser console warnings were reported.
- Without a webhook, the call-for-quote panel appears and no nonfunctional enquiry form is rendered. Live email/CRM delivery is not configured or verified.

Local production preview: http://localhost:3002. No deployment or external message sending was performed.
