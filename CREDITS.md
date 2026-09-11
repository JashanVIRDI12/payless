# Image credits

The homepage uses six new AI-generated concept photographs, created with the built-in image-generation tool on 10 September 2026. They do not show actual Payless trucks, employees or verified locations. The page identifies illustrative imagery, and its footer explains that the photos are not the actual fleet.

The yellow trucks, natural daylight, coastal mountains and charcoal equipment connect the photography to the existing Payless yellow-and-black brand.

| Asset in src/assets/images | Current use |
| --- | --- |
| hero-towing-v2.webp | Main hero, light/medium service, social preview |
| roadside-v2.webp | Roadside service and about section |
| heavy-towing-v2.webp | Heavy-duty towing service |
| equipment-v2.webp | Equipment transport service |
| long-haul-v2.webp | Long-haul service and final call section |
| recovery-v2.webp | Accident and freight clean-up service |

The original generated PNGs remain in the generation tool’s output directory; optimized WebP files are stored in this project. All prompts are recorded in [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md).

The older JPG concepts are retained in the asset directory but are no longer used by the homepage.

The logo in src/assets/brand/payless-logo.webp is the genuine Payless wordmark previously downloaded from paylesstowing.ca. The app icon is a crop of that wordmark. Neither was regenerated.

For a production photography upgrade, replace the concepts with owner-supplied photographs of actual vehicles and recoveries. Update descriptive alt text in src/lib/site.ts and the section components to match.
