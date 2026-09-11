/**
 * Business facts sourced from paylesstowing.ca. Nothing here is invented —
 * no reviews, awards, certifications or response-time claims.
 */

import svcRoadside from "@/assets/images/roadside-v2.webp";
import svcLightMedium from "@/assets/images/hero-towing-v2.webp";
import svcHeavyDuty from "@/assets/images/heavy-towing-v2.webp";
import svcHeavyEquipment from "@/assets/images/equipment-v2.webp";
import svcLongHaul from "@/assets/images/long-haul-v2.webp";
import svcCleanup from "@/assets/images/recovery-v2.webp";
import type { StaticImageData } from "next/image";

export const COMPANY = {
  name: "Payless Auto Towing",
  legalName: "Payless Auto Towing Ltd.",
  url: "https://paylesstowing.ca",
  since: "1970s",
  years: "53+",
  region: "Sea-to-Sky Corridor",
  province: "British Columbia",
  /** Their stated coverage, verbatim in spirit: "Deep Cove to Lillooet". */
  coverage: "Deep Cove to Lillooet",
} as const;

export type Location = {
  city: string;
  phone: string;
  tel: string;
  street: string;
  postal: string;
};

/** Dispatch locations, in geographic order up the corridor. */
export const LOCATIONS: readonly Location[] = [
  {
    city: "North Vancouver",
    phone: "604-988-4176",
    tel: "+16049884176",
    street: "311 Mansfield Place",
    postal: "V7J 1E4",
  },
  {
    city: "Squamish",
    phone: "604-892-5206",
    tel: "+16048925206",
    street: "39550 Galbraith Avenue",
    postal: "V8B 0A3",
  },
  {
    city: "Whistler",
    phone: "604-932-3222",
    tel: "+16049323222",
    street: "1212 Alpha Lake Road",
    postal: "V0N 1B1",
  },
  {
    city: "Pemberton",
    phone: "604-894-0024",
    tel: "+16048940024",
    street: "1931 Carpenter Road",
    postal: "V0N 2L0",
  },
] as const;

/** Main office — used for every global "call now" affordance. */
export const PRIMARY = LOCATIONS[0];

export type Service = {
  id: string;
  index: string;
  name: string;
  description: string;
  details: readonly string[];
  image: StaticImageData;
  imagePosition: string;
  alt: string;
};

export const SERVICES: readonly Service[] = [
  {
    id: "roadside",
    index: "01",
    name: "24-Hour Roadside Assistance",
    description:
      "A breakdown or lock-out can interrupt any trip. Reach our team day or night for roadside assistance and help getting your vehicle moving again.",
    details: ["24-hour emergency assistance", "Vehicle lock-out service", "Breakdown and recovery support"],
    image: svcRoadside,
    imagePosition: "82% 50%",
    alt: "A technician in a hi-vis jacket kneeling at the wheel of a grey pickup, a yellow flat deck tow truck waiting behind on a wet coastal pull-out",
  },
  {
    id: "light-medium",
    index: "02",
    name: "Light & Medium Duty Towing",
    description:
      "Flat-deck towing for everyday vehicles and commercial vans. Tell dispatch what you drive, its condition and where it needs to go.",
    details: ["Cars, SUVs and luxury vehicles", "Mid-size commercial vans", "Flat-deck vehicle transport"],
    image: svcLightMedium,
    imagePosition: "66% 50%",
    alt: "A yellow flat deck tow truck carrying a dark SUV at a Sea-to-Sky viewpoint, snow-capped peaks across the water behind",
  },
  {
    id: "heavy-duty",
    index: "03",
    name: "Heavy Duty Towing",
    description:
      "Larger vehicles need the right equipment and experienced operators. Our heavy-duty team handles towing and recovery for commercial vehicles along the corridor.",
    details: ["Semi-trucks and buses", "Commercial vehicle recovery", "Operators trained for heavy work"],
    image: svcHeavyDuty,
    imagePosition: "0% 50%",
    alt: "A yellow heavy-duty wrecker with its recovery boom raised, snow-capped mountains behind",
  },
  {
    id: "heavy-equipment",
    index: "04",
    name: "Heavy Equipment",
    description:
      "Move machinery and oversized loads across the Sea-to-Sky. Share the load dimensions and site access details so dispatch can help plan the transport.",
    details: ["Heavy machinery and equipment", "Oversized load transport", "Flat-deck hauling across the corridor"],
    image: svcHeavyEquipment,
    imagePosition: "78% 50%",
    alt: "A yellow tractor unit with an excavator chained down to its lowboy trailer, water and snow-capped peaks behind",
  },
  {
    id: "long-haul",
    index: "05",
    name: "Long-Haul Towing",
    description:
      "Need to move a vehicle further afield? Talk to dispatch about transport from Deep Cove to Lillooet and destinations beyond the local corridor.",
    details: ["Long-distance vehicle transport", "Moves beyond the Sea-to-Sky", "Discuss your pickup and destination"],
    image: svcLongHaul,
    imagePosition: "55% 50%",
    alt: "A yellow flat deck tow truck carrying a silver sedan along a coastal mountain highway",
  },
  {
    id: "cleanup",
    index: "06",
    name: "Accident & Freight Clean-Up",
    description:
      "Support for large accidents and freight clean-up, with lane control held at the scene. Share your location and describe the vehicles and load involved.",
    details: ["Accident scene recovery", "Freight and debris clean-up", "Lane control at the scene"],
    image: svcCleanup,
    imagePosition: "85% 50%",
    alt: "A crew in hi-vis clearing debris beside a damaged SUV, a yellow heavy wrecker and traffic cones holding the lane",
  },
] as const;

export type Review = {
  name: string;
  quote: string;
  /** Every review shown on their site carries five stars. */
  rating: 5;
};

/**
 * Verbatim from the Google reviews published on paylesstowing.ca, typos and
 * all — editing a testimonial is putting words in someone's mouth.
 *
 * The site states "Based on 70 reviews" but does not publish the numeric
 * average, so no aggregate score is claimed anywhere, and no review structured
 * data is emitted (self-serving review markup on a business's own site is
 * against Google's guidelines).
 */
export const REVIEW_COUNT = 70;

/**
 * Order matters: the first entry is set as the large pull quote, so it needs
 * to be a short one. The second is given the wide card directly beneath it.
 */
export const REVIEWS: readonly Review[] = [
  {
    name: "Natalie York",
    rating: 5,
    quote:
      "Dan is a legend! Unlocked my car for me and had exceptional customer service - put a huge smile on my face!",
  },
  {
    name: "Kirsten Walker",
    rating: 5,
    quote:
      "Outstanding towing experience! Dan went above and beyond in saving our day when we broke down in -10 on the highway to whis. Great communication (never heard anything from bcaa). This is a man with so much passion and pride for his clients, job and company. The world needs more people like dan!",
  },
  {
    name: "Gord Lyster",
    rating: 5,
    quote:
      "First class, top shelf service from our attendee. DAN was knowledgeable and personable … and very efficient. Thank you. We will highly recommend you.",
  },
  {
    name: "Luke Arsenault",
    rating: 5,
    quote:
      "Dan showed up faster then BCAA said. Super nice guy, went above & beyond to help me out. Highly recommend!",
  },
  {
    name: "leannegr",
    rating: 5,
    quote:
      "We need more people in the world like Dan at Payless! Couldn't be kinder or more helpful. Got my van out of a really tricky spot (had broken down in the most awkward place at the bottom of my icy, slippery driveway). Great to meet someone with so much professionalism and love for the job.",
  },
  {
    name: "Niket Kalra",
    rating: 5,
    quote:
      "Dan picked me up bright and early. Safely loaded the car and made sure I got home safe. Couldn't ask for better service and customer experience.",
  },
  {
    name: "Nicholas Helt",
    rating: 5,
    quote:
      "Great experience with Dan! Guy knows his stuff very well and helped us make an educated decision on a tough a situation. Not to mention just how friendly and kind the guy is! 12/10 would recommend.",
  },
  {
    name: "Philip G",
    rating: 5,
    quote: "Dan was amazing and saved me a huge headache from my truck problems",
  },
] as const;

export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Fleet", href: "/fleet" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export type FleetUnit = {
  id: string;
  name: string;
  summary: string;
  handles: readonly string[];
  image: StaticImageData;
  alt: string;
};

/**
 * Described by capability, not by inventory. Payless does not publish unit
 * counts, makes or capacities, so nothing here claims any — each entry only
 * restates the work the published service list already covers.
 */
export const FLEET: readonly FleetUnit[] = [
  {
    id: "flat-deck",
    name: "Flat deck",
    summary:
      "The default for anything that should not touch the road on the way — low clearance, all-wheel drive, electric, or simply worth keeping off its own wheels.",
    handles: ["Family cars", "Luxury vehicles", "AWD and electric", "Long-distance moves"],
    image: svcLightMedium,
    alt: "A yellow flat deck tow truck carrying a dark SUV at a Sea-to-Sky viewpoint, snow-capped peaks across the water behind",
  },
  {
    id: "roadside",
    name: "Roadside service",
    summary:
      "The unit that reaches you first for the problems that do not need a tow at all — a lock-out, a flat, a battery, or a vehicle that needs help getting clear of the lane.",
    handles: ["Lock-outs", "Wheel changes", "Battery help", "Recovery on scene"],
    image: svcRoadside,
    alt: "A technician in a hi-vis jacket kneeling at the wheel of a grey pickup, a yellow flat deck tow truck waiting behind on a wet coastal pull-out",
  },
  {
    id: "heavy-wrecker",
    name: "Heavy-duty wrecker",
    summary:
      "For commercial units and recoveries that need real lifting capacity, worked by operators trained for heavy jobs and the lane control that comes with them.",
    handles: ["Semis and tractors", "Buses", "Commercial units", "Difficult recoveries"],
    image: svcHeavyDuty,
    alt: "A yellow heavy-duty wrecker coupled to a white semi tractor, snow-capped mountains behind",
  },
  {
    id: "equipment-float",
    name: "Equipment float",
    summary:
      "Low-deck transport for machinery and oversized loads moving to and from site anywhere along the corridor.",
    handles: ["Excavators and loaders", "Oversized loads", "Site-to-site moves", "Freight"],
    image: svcHeavyEquipment,
    alt: "A yellow tractor unit with an excavator chained down to its lowboy trailer, water and snow-capped peaks behind",
  },
] as const;
