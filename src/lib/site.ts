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

export type Testimonial = {
  /** How the owner's document attributes the quote — a role, not a name. */
  role: string;
  quote: string;
};

/**
 * Word for word from the owner's content document, attributed by role exactly
 * as supplied. The document gives no star ratings, so none are shown, and no
 * review structured data is emitted.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    role: "Commercial Truck Driver",
    quote:
      "Our truck broke down at the worst possible time, and the Payless crew made the whole situation much easier. They arrived prepared, explained what needed to happen, and handled the tow professionally.",
  },
  {
    role: "Construction Customer",
    quote:
      "We needed heavy equipment moved between job sites and the entire process was straightforward. The team knew exactly what equipment was required and handled the transport with care.",
  },
  {
    role: "Roadside Assistance Customer",
    quote:
      "Great experience when I needed roadside help. Communication was clear, the response was quick, and the operator was friendly and professional throughout.",
  },
  {
    role: "Fleet Operator",
    quote:
      "We called Payless for a difficult heavy-duty recovery. Their crew came equipped for the job and handled a challenging situation with confidence. Very impressed with how everything was managed.",
  },
  {
    role: "Long-Distance Towing Customer",
    quote:
      "Professional service from the first call to the final delivery. Our vehicle had to be transported a considerable distance, and the team kept everything organized and made the process easy for us.",
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
