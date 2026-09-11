# Image credits

## Owner-supplied photographs

Photographs of Payless trucks and crew, supplied by the owner over WhatsApp on 11 September 2026 and confirmed as the business's own equipment. The trucks are lettered "Payless Towing Ltd" with a 780 number. Screenshot UI, black bars, a phone scan-text button, a photographer's shadow and a dealer's sign were cropped out. Duplicates were dropped, and files were re-encoded as WebP without metadata.

| Asset in src/assets/images | Shows | Current use |
| --- | --- | --- |
| photo-wrecker-towing-semi.webp | Blue heavy wrecker towing a white semi | Main hero, social preview |
| photo-red-rotator.webp | Red rotator at an indoor truck show | Roadside service, fleet page hero |
| photo-semi-on-trailer.webp | Black semi-tractor on a low-deck trailer | Light/medium service, contact page hero, fleet equipment float |
| photo-white-heavy-wrecker.webp | White heavy wrecker in a truck yard | Heavy-duty service, fleet heavy-duty wrecker |
| photo-lowboy-tank-dusk.webp | Stainless tank on a low-deck trailer at dusk | Heavy equipment service |
| photo-lowboy-highway-dawn.webp | Semi-tractor hauled on a low-deck trailer at sunrise | Long-haul service, fleet flat deck |
| photo-winter-crane-recovery.webp | Payless Towing & Recovery wrecker towing a crane truck | Accident & freight clean-up service |
| photo-crew-rotator.webp | Four crew members beside a red rotator | About section, fleet roadside unit |
| photo-building-move.webp | Blue heavy wrecker towing a portable site office | Final call section |
| photo-orange-wrecker.webp | Orange heavy wrecker | Services page hero |
| photo-red-payless-wrecker.webp | Red wrecker with "Payless Towing Ltd" on the boom | About page hero |

The site uses these photographs only. None of them shows roadside work or a car on a flat deck, so the roadside and light/medium service cards and the flat-deck and roadside fleet units carry the closest photo. Each one's alt text describes what the photo actually shows. If the owner sends a roadside call or a car on a flat deck, swap them in and update the alt text in src/lib/site.ts.

The unedited originals were delivered to public/. The site does not use them, so they should be removed or kept out of the repository (anything in public/ is served as-is).

## Retired concept illustrations

The AI-generated concepts from 10 September 2026 (the -v2.webp files and the older JPGs in src/assets/images) are no longer used anywhere on the site. [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md) is kept as a record of how they were made.

The logo in src/assets/brand/payless-logo.webp is the genuine Payless wordmark previously downloaded from paylesstowing.ca. The app icon is a crop of that wordmark. Neither was regenerated.
