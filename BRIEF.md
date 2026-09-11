# Payless homepage rebuild
Based on the user's complete creative brief and supplied component code. Implementation choices below are authored within the requested full redesign.

## Direction
Modern, clean, minimal, confident and interactive. Keep existing genuine logo, yellow #FFC50C, charcoal #171B1E, white and steel grey. Archivo display is broad and clear, Geist body is restrained. No repeated eyebrow labels. White opening, clear support information, atmospheric full-width photography, an asymmetrical service gallery, staggered testimonials and a useful dispatch surface.

## Journey and feeling curve
1. Relief: immediate calling and a real-looking truck supported by local mountain scenery.
2. Confidence: insured/local facts and six visible service categories.
3. Clarity: a short checklist names the information dispatch needs.
4. Familiarity: a large operator photograph and the company's local history.
5. Reassurance: real customer quotes in the user's staggered-card component.
6. Agency: trace Highway 99, select a dispatch office, then call or open directions.
7. Resolve: clear FAQs and an intentional yellow closing panel with the supplied arrow-fill action.

## Grammar
Dispatch showroom. Fixed compact white navigation with a call action; natural flow and jump links; a dimensional truck hero; asymmetrical photo galleries and useful interactive sections; closes with a large yellow contact panel and city links. Bans: full-page video, scroll hijacking, pinned text acts, autoplay carousels, invisible emergency actions.
The eight stock grammars were considered: filmic one-shot blocks jumping, chaptered editorial deprioritizes hero photography, live surface implies a software product, and the remaining specialist grammars do not match the supplied nine-section service-page sequence. A concrete new grammar preserves that sequence without a generic card-grid scaffold.
Fingerprint registry has no prior rows at planning time, so there is no historic row to conflict with. Compared with the previous local homepage, navigation treatment, hero device, service layout, close pattern and signature move all change.

## Layer contract and peak
Far: subject-free original mountain/road plate. Small y/scale change on scroll.
Subject: genuine alpha cutout of original yellow flatbed and SUV, including its contact shadow. Larger scale change about wheel/road contact near 72% 79%; no hover that makes tires float.
Foreground: semantic dispatch rail over the edge of the scene. It advances in normal document flow.
Typography/actions: independent HTML, primary action always visible.
Opening: truck already grounded and headline fully legible.
Midpoint: short, unpinned depth move makes the truck more prominent while scenery recedes.
Exit: the four dispatch choices meet the foreground and the scene resolves into the trust strip.
This is the main photographic peak; the services are larger only because they must explain six distinct capabilities, not to stretch scrolling.

## Score
Hero: masked typography + true layered parallax.
Trust: static, compact.
Services: image clipping reveals, useful hover/focus service details.
Process: static sequence.
About: one measured photographic reveal.
Testimonials: user-driven staggered card movement; no auto-advance.
Coverage: SVG path draw on entry, selected route marker moves to the chosen office and highlights the corresponding contact information.
FAQ: native details with interruptible content fades.
Close: static yellow, supplied expanding arrow-fill button.

## Supplied components
Adapt arrow-fill-button under src/components/ui, preserving its expanding circle/arrow treatment, with immediate SSR visibility, keyboard focus, sane mobile sizing, reduced motion and proper forwarded props.
Adapt stagger-testimonials under src/components/ui, preserving clipped staggered cards, a lifted centre card and previous/next controls. Use existing verified reviews and initials, never fictional portraits or demo business quotes.
Add shadcn-compatible components.json, theme aliases and cn utility to the existing Tailwind 4 + TypeScript setup. No wholesale CLI reset.

## Constraints and verification
No invented claims, prices, memberships or times. All new scene assets are illustrative.
Next.js installed docs read before implementation. GSAP context/matchMedia cleanup, no render-time randomness, reduced-motion changes revert cleanly, native scrolling and full no-JavaScript reading.
Verify desktop, tablet, compact/mobile, intermediate hero positions, carousel wraparound and rapid interaction, dispatch selection/keyboard controls, FAQs, menu, no-JS, reduced motion, no failed images or overflow.

