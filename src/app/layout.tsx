import type { Metadata, Viewport } from "next";
import { Archivo, Geist } from "next/font/google";
import "./globals.css";
import { COMPANY, LOCATIONS, PRIMARY, SERVICES } from "@/lib/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MobileCallBar from "@/components/MobileCallBar";
import PageMotion from "@/components/PageMotion";
import shareImage from "@/assets/images/hero-towing-v2.webp";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.url),
  title: {
    default:
      "Payless Auto Towing — 24/7 Towing & Roadside Assistance | Sea-to-Sky, BC",
    template: "%s | Payless Auto Towing",
  },
  description:
    "24-hour towing, recovery and roadside assistance across North Vancouver, Squamish, Whistler and Pemberton. Serving the Sea-to-Sky Corridor since the 1970s.",
  keywords: [
    "towing North Vancouver",
    "Squamish towing",
    "Whistler towing",
    "Pemberton towing",
    "24 hour roadside assistance BC",
    "heavy duty towing Sea-to-Sky",
    "flat deck transport British Columbia",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: COMPANY.url,
    siteName: COMPANY.legalName,
    title: "Payless Auto Towing — 24/7 Towing & Roadside Assistance",
    description:
      "Professional towing and roadside assistance across North Vancouver, Squamish, Whistler and Pemberton.",
    images: [{ url: shareImage.src, width: shareImage.width, height: shareImage.height, alt: "Payless Auto Towing — a yellow flat deck tow truck in the Sea-to-Sky Corridor" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#171b1e",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AutoRepair",
      "@id": `${COMPANY.url}/#business`,
      name: COMPANY.legalName,
      alternateName: COMPANY.name,
      url: COMPANY.url,
      telephone: PRIMARY.phone,
      description:
        "24-hour towing, recovery and roadside assistance throughout the Sea-to-Sky Corridor, from Deep Cove to Lillooet.",
      areaServed: LOCATIONS.map((l) => ({
        "@type": "City",
        name: l.city,
      })),
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Towing & roadside services",
        itemListElement: SERVICES.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.name },
        })),
      },
    },
    ...LOCATIONS.map((l) => ({
      "@type": "AutoRepair",
      "@id": `${COMPANY.url}/#${l.city.toLowerCase().replace(/\s+/g, "-")}`,
      name: `${COMPANY.legalName} — ${l.city}`,
      parentOrganization: { "@id": `${COMPANY.url}/#business` },
      telephone: l.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: l.street,
        addressLocality: l.city,
        addressRegion: "BC",
        postalCode: l.postal,
        addressCountry: "CA",
      },
    })),
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      suppressHydrationWarning
      lang="en-CA"
      className={`${archivo.variable} ${geist.variable} h-full antialiased`}
    >
      <head>
        {/*
          Flags "motion is coming" before first paint so the hero can hold its
          opening pose instead of flashing the finished state during hydration.
          The attribute is dropped after 2.6s, so a blocked bundle or a thrown
          script can never leave copy hidden — and it is never set at all for
          readers who have asked for reduced motion.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-anim","");setTimeout(function(){d.removeAttribute("data-anim")},2600)}}catch(e){}` }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-paper"
        >
          Skip to content
        </a>
        <Nav />
        <PageMotion>{children}</PageMotion>
        <Footer />
        <MobileCallBar />
      </body>
    </html>
  );
}
