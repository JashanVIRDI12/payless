# Payless Towing website

A Next.js site for Payless Towing Service & Recovery, serving Edmonton and surrounding areas. Copy comes from the owner's content document, "Payless Towing Website Content"; the dispatch number is the one lettered on their trucks.

## Run locally

```sh
npm install
npm run dev
npm run lint
npm run build:cpanel
```

On Windows with PowerShell script execution disabled, use npm.cmd in place of npm.

## Deploy to cPanel

Upload the generated **`cpanel-upload.zip`**, extracting its contents directly into the domain's document root. It includes `.htaccess`, page directories with `index.html`, and explicit Unix permissions (files 0644, folders 0755). Do not reuse the old `public_html.zip` or manually compress the Windows build folder.

Follow [CPANEL-DEPLOY.md](CPANEL-DEPLOY.md), including the one-time repair of existing `_next` directory permissions. The reported Apache `AH00529` error means Apache cannot check `_next/static/.htaccess`; changing application code cannot repair permissions already on the server.

After upload, run `npm run verify:deployment -- https://paylestowing.ca` (the domain in the supplied Apache log). The source's canonical domain is currently `paylesstowing.ca`; confirm the intended canonical domain separately before changing business metadata.

This project uses `output: "export"`. The production files are in `out/`; serve them as static files. `next start` requires a server build and does not serve this export.

## Page structure

- Nav and Hero: genuine brand logo, main call action, owner photography and the 24/7 dispatch number.
- Trust and Services: insured service, local coverage and six towing/transport categories.
- HowItWorks: what to have ready when calling dispatch.
- About and Reviews: business background and a concise selection of existing testimonials.
- Locations: the service area — Edmonton and surrounding areas, with long-distance towing beyond it.
- Faq: accessible native details/summary controls.
- Contact: scheduled transport enquiry form when connected; a call-for-quote panel otherwise.
- FinalCta, Footer and MobileCallBar: continued access to calling and local dispatch.

Business details live in src/lib/site.ts (one dispatch line, six services, four fleet units). Design tokens and responsive styles live in src/app/globals.css. Most sections are server components revealed by the shared PageMotion. Sections with their own choreography — Hero, Trust, HowItWorks, About and the fleet page's FleetShowroom — are client components marked `data-motion="self"`, which PageMotion skips so nothing is animated twice. SmoothScroll, Marquee, HeroShader and Cursor are retained but not mounted anywhere.

## Enquiry delivery (server deployment only)

The current cPanel export uses the call-for-quote panel. Server Actions do not run on static hosting. The retained server handler is inactive; enabling an online form requires a separately hosted backend and reconnecting the form.

For a future server deployment, set CONTACT_WEBHOOK_URL to an endpoint that accepts a JSON POST. The endpoint must implement this contract; an email provider’s API is not automatically compatible.

Payload: name, phone, email, message, source and receivedAt.

The form requires a name, a message, and at least one reply method (phone or email). Field errors and sending feedback are shown inline. The existing hidden honeypot remains in place.

Setting CONTACT_WEBHOOK_URL alone does not enable the form in this static version.

A success response means the configured endpoint accepted the request. Configure and verify actual email/CRM delivery at that endpoint. No production enquiries were sent during the redesign.

## Alternative hosting: Vercel

The current build is a static export. The previous Node.js deployment workflow below requires removing `output: "export"` and restoring the server integration if online enquiries are needed.

1. Push this folder to a Git repository. This folder (`payless/`) is the project root — if the repository also contains its parent directory, set Vercel's Root Directory to `payless`.
2. In Vercel choose Add New → Project and import the repository. Next.js is detected automatically; leave the build command and output directory at their defaults.
3. Optional: add `CONTACT_WEBHOOK_URL` under Settings → Environment Variables (see `.env.example`), then redeploy — the pages are prerendered, so a variable added later only takes effect on the next build.
4. When ready to go live, add `paylesstowing.ca` under Settings → Domains.

Worth knowing:

- Node 20.9 or newer is required and pinned in `package.json` `engines`.
- Preview deployments are kept out of search: `robots.txt` disallows everything when `VERCEL_ENV` is `preview`, on top of Vercel's own noindex header for previews.
- Canonical tags, `sitemap.xml` and Open Graph URLs all use `https://paylesstowing.ca` (`COMPANY.url` in `src/lib/site.ts`). Until that domain points at Vercel they point at the current live site, which is intended — a staging copy on `*.vercel.app` will not be indexed as a duplicate.
- cPanel response headers are set in `public/.htaccess`. Other hosts need equivalent header configuration.
- Vercel builds on Linux, where file names are case-sensitive. Imports have been checked against on-disk case; keep them exact when adding files on Windows.

## Images and research

- [WEBSITE-AUDIT.md](WEBSITE-AUDIT.md): findings, sources, implemented improvements and prioritized next additions.
- [CREDITS.md](CREDITS.md): image provenance and the current asset map.
- [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md): full prompts used for the six new generated assets.

Every image on the site is an owner-supplied photograph of Payless trucks and crew, optimized to WebP. The earlier AI concept illustrations are retired. CREDITS.md maps every asset to where it is used.
