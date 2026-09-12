/**
 * Business facts taken from the owner's content document, "Payless Towing
 * Website Content". Nothing here is invented — no awards, certifications,
 * response times or coverage beyond what that document states.
 *
 * The dispatch number is the one lettered on the trucks in the owner's own
 * photographs; the document leaves it as a placeholder.
 */

// Owner-supplied photographs of Payless equipment — the only imagery used.
import photoRedRotator from "@/assets/images/photo-red-rotator.webp";
import photoCrew from "@/assets/images/photo-crew-rotator.webp";
import photoHeavyWrecker from "@/assets/images/photo-white-heavy-wrecker.webp";
import photoTankHaul from "@/assets/images/photo-lowboy-tank-dusk.webp";
import photoHighwayHaul from "@/assets/images/photo-lowboy-highway-dawn.webp";
import photoRecovery from "@/assets/images/photo-winter-crane-recovery.webp";
import photoSemiOnTrailer from "@/assets/images/photo-semi-on-trailer.webp";
import type { StaticImageData } from "next/image";

export const COMPANY = {
  name: "Payless Towing",
  legalName: "Payless Towing Service & Recovery",
  url: "https://paylesstowing.ca",
  city: "Edmonton",
  province: "Alberta",
  /** Their stated coverage, verbatim: "Edmonton and surrounding areas". */
  coverage: "Edmonton and surrounding areas",
} as const;

export type Dispatch = {
  city: string;
  phone: string;
  tel: string;
};

/** One 24/7 dispatch line, behind every "call now" affordance on the site. */
export const PRIMARY: Dispatch = {
  city: "Edmonton",
  phone: "780-233-0088",
  tel: "+17802330088",
};

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
    name: "24/7 Roadside Assistance",
    description:
      "Vehicle trouble can happen without warning. Our team is available around the clock to provide practical roadside support and help get you moving again with minimal disruption.",
    details: ["Flat tire assistance", "Fuel delivery support", "Vehicle lockout assistance"],
    image: photoRedRotator,
    imagePosition: "55% 50%",
    alt: "A red heavy rotator wrecker with its boom raised, on display at an indoor truck show",
  },
  {
    id: "light-medium",
    index: "02",
    name: "Light & Medium Duty Towing",
    description:
      "Dependable towing and transport for everyday vehicles and light commercial needs. Our team handles each vehicle with care, using the right equipment for secure loading and transportation.",
    details: ["Cars, SUVs & pickup trucks", "Vans & light commercial vehicles", "Flatbed / tilt deck transport"],
    image: photoSemiOnTrailer,
    imagePosition: "45% 50%",
    alt: "A black semi-tractor chained down on a low-deck trailer in a snowy yard, a heavy wrecker parked behind",
  },
  {
    id: "heavy-duty",
    index: "03",
    name: "Heavy Duty Towing",
    description:
      "Built for the demands of larger commercial vehicles, our heavy-duty towing capabilities combine experienced operators with specialized equipment for dependable towing and recovery.",
    details: ["Semi-trucks, buses & commercial vehicles", "50 ton & 60 ton wrecker capability", "Heavy-duty towing & recovery"],
    image: photoHeavyWrecker,
    imagePosition: "12% 50%",
    alt: "A white heavy-duty wrecker with blue fenders and a chrome bumper, parked in a truck yard",
  },
  {
    id: "heavy-equipment",
    index: "04",
    name: "Heavy Equipment Transport",
    description:
      "Moving heavy machinery requires the right transport equipment and careful planning. Our team provides secure hauling solutions for heavy equipment, machinery, and specialized loads.",
    details: ["Heavy machinery & equipment", "Landoll trailer transport", "Oversized & specialized loads"],
    image: photoTankHaul,
    imagePosition: "45% 50%",
    alt: "A white semi hauling a stainless-steel tank on a low-deck trailer at dusk, a heavy wrecker lit up behind it",
  },
  {
    id: "long-haul",
    index: "05",
    name: "Long-Distance Towing",
    description:
      "Dependable towing and transport for vehicles that need to travel beyond the local area. Our team plans each move with the right equipment for secure, efficient long-distance transportation.",
    details: ["Long-distance vehicle transport", "Commercial trucks & heavy vehicles", "Planned pickup & destination support"],
    image: photoHighwayHaul,
    imagePosition: "35% 50%",
    alt: "A white semi hauling a second semi-tractor on a low-deck trailer along a highway at sunrise",
  },
  {
    id: "cleanup",
    index: "06",
    name: "Accident & Freight Clean-Up",
    description:
      "For complex accident scenes involving commercial vehicles or spilled cargo, our team provides coordinated recovery and clean-up support to help clear the roadway and restore safe traffic flow.",
    details: ["Accident scene recovery", "Freight & debris clean-up", "Traffic control support"],
    image: photoRecovery,
    imagePosition: "0% 50%",
    alt: "A white Payless Towing & Recovery heavy wrecker towing a crane truck across a snowy yard, a crew member in hi-vis standing by",
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
  /** object-position for the cover crop; centred when omitted. */
  imagePosition?: string;
};

/**
 * Described by capability, not by inventory: no unit counts, makes or
 * capacities beyond the wrecker capability the owner's document states.
 */
export const FLEET: readonly FleetUnit[] = [
  {
    id: "flat-deck",
    name: "Flatbed / Tilt Deck",
    summary:
      "Safe, secure transport for vehicles that require careful handling. The tilt deck allows for easier loading while keeping the vehicle securely positioned during transport, making it a versatile option for a wide range of towing needs.",
    handles: ["Cars & SUVs", "Light commercial vehicles", "Low-clearance vehicles", "Long-distance transport"],
    image: photoHighwayHaul,
    alt: "A white semi hauling a second semi-tractor on a low-deck trailer along a highway at sunrise",
  },
  {
    id: "roadside",
    name: "Roadside Service",
    summary:
      "Quick support for common roadside problems that may not require a tow. Our roadside service team is available 24/7 to assist with unexpected vehicle issues and help get you moving again.",
    handles: ["Vehicle lockouts", "Flat tire assistance", "Fuel delivery", "Roadside support"],
    image: photoCrew,
    // Keeps the truck's grille in the 5:4 stage; the crew stands mid-frame.
    imagePosition: "0% 50%",
    alt: "Four Payless crew members standing beside a red heavy rotator wrecker inside a large service bay",
  },
  {
    id: "heavy-wrecker",
    name: "Heavy-Duty Wrecker",
    summary:
      "Built for large commercial vehicles and demanding recovery operations that require serious towing and lifting capability. Our heavy-duty wreckers give experienced operators the strength and control needed to manage challenging jobs.",
    handles: ["Semi-trucks & tractors", "Buses & commercial vehicles", "Heavy-duty towing", "Complex recoveries"],
    image: photoHeavyWrecker,
    alt: "A white heavy-duty wrecker with blue fenders and a chrome bumper, parked in a truck yard",
  },
  {
    id: "equipment-float",
    name: "Equipment Transport",
    summary:
      "Built to move heavy machinery, equipment, and specialized loads with secure transport and careful handling. Our transport capabilities support planned equipment moves for commercial, construction, and industrial needs.",
    handles: ["Heavy machinery & equipment", "Construction equipment", "Oversized & specialized loads", "Site-to-site transport"],
    image: photoSemiOnTrailer,
    alt: "A black semi-tractor chained down on a low-deck trailer in a snowy yard, a heavy wrecker parked behind",
  },
] as const;
