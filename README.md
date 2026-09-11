# Payless Auto Towing homepage

A Next.js homepage for Payless Auto Towing, serving British Columbia’s Sea-to-Sky Corridor. The redesign leads with towing imagery, local dispatch, service choices and practical help.

## Run locally

```sh
npm install
npm run dev
npm run lint
npm run build
npm run start
```

On Windows with PowerShell script execution disabled, use npm.cmd in place of npm.

## Page structure

- Nav and Hero: genuine brand logo, main call action, yellow-truck imagery and four dispatch numbers.
- Trust and Services: insured service, local coverage and six towing/transport categories.
- HowItWorks: what to have ready when calling dispatch.
- About and Reviews: business background and a concise selection of existing testimonials.
- Locations: local phone numbers, addresses, directions and a labeled schematic route.
- Faq: accessible native details/summary controls.
- Contact: scheduled transport enquiry form when connected; a call-for-quote panel otherwise.
- FinalCta, Footer and MobileCallBar: continued access to calling and local dispatch.

Business details live in src/lib/site.ts. Design tokens and responsive styles live in src/app/globals.css. Most sections are server components revealed by the shared PageMotion. Sections with their own choreography — Hero, Trust, HowItWorks, About and the fleet page's FleetShowroom — are client components marked `data-motion="self"`, which PageMotion skips so nothing is animated twice. SmoothScroll, Marquee, HeroShader and Cursor are retained but not mounted anywhere.

## Enquiry delivery

Set CONTACT_WEBHOOK_URL to an endpoint that accepts a JSON POST. The endpoint must implement this contract; an email provider’s API is not automatically compatible.

Payload: name, phone, email, message, source and receivedAt.

The form requires a name, a message, and at least one reply method (phone or email). Field errors and sending feedback are shown inline. The existing hidden honeypot remains in place.

Without CONTACT_WEBHOOK_URL, the server renders a call-for-quote panel instead of asking visitors to complete a form that cannot deliver. Because the homepage is prerendered, set this environment variable before building and rebuild when enabling delivery.

A success response means the configured endpoint accepted the request. Configure and verify actual email/CRM delivery at that endpoint. No production enquiries were sent during the redesign.

## Deploy to Vercel

1. Push this folder to a Git repository. This folder (`payless/`) is the project root — if the repository also contains its parent directory, set Vercel's Root Directory to `payless`.
2. In Vercel choose Add New → Project and import the repository. Next.js is detected automatically; leave the build command and output directory at their defaults.
3. Optional: add `CONTACT_WEBHOOK_URL` under Settings → Environment Variables (see `.env.example`), then redeploy — the pages are prerendered, so a variable added later only takes effect on the next build.
4. When ready to go live, add `paylesstowing.ca` under Settings → Domains.

Worth knowing:

- Node 20.9 or newer is required and pinned in `package.json` `engines`.
- Preview deployments are kept out of search: `robots.txt` disallows everything when `VERCEL_ENV` is `preview`, on top of Vercel's own noindex header for previews.
- Canonical tags, `sitemap.xml` and Open Graph URLs all use `https://paylesstowing.ca` (`COMPANY.url` in `src/lib/site.ts`). Until that domain points at Vercel they point at the current live site, which is intended — a staging copy on `*.vercel.app` will not be indexed as a duplicate.
- Security headers are set in `next.config.ts`. There is no Content-Security-Policy yet: the layout's two inline scripts (the motion flag and the JSON-LD) would need nonces first.
- Vercel builds on Linux, where file names are case-sensitive. Imports have been checked against on-disk case; keep them exact when adding files on Windows.

## Images and research

- [WEBSITE-AUDIT.md](WEBSITE-AUDIT.md): findings, sources, implemented improvements and prioritized next additions.
- [CREDITS.md](CREDITS.md): image provenance and the current asset map.
- [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md): full prompts used for the six new generated assets.

Every image on the site is an owner-supplied photograph of Payless trucks and crew, optimized to WebP. The earlier AI concept illustrations are retired. CREDITS.md maps every asset to where it is used.
