import type { Metadata, Viewport } from "next";
import { Archivo, Geist } from "next/font/google";
import "./globals.css";
import { COMPANY, PRIMARY, SERVICES } from "@/lib/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MobileCallBar from "@/components/MobileCallBar";
import PageMotion from "@/components/PageMotion";
import shareImage from "@/assets/images/photo-wrecker-towing-semi.webp";

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
      "Payless Towing — 24/7 Towing, Recovery & Roadside Support | Edmonton, AB",
    template: "%s | Payless Towing",
  },
  description:
    "24/7 towing, recovery and roadside assistance across Edmonton and surrounding areas. Heavy-duty wreckers, equipment transport and long-distance towing.",
  keywords: [
    "towing Edmonton",
    "heavy duty towing Edmonton",
    "24 hour roadside assistance Edmonton",
    "accident recovery Alberta",
    "heavy equipment transport Edmonton",
    "long distance towing Alberta",
    "Landoll trailer transport",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: COMPANY.url,
    siteName: COMPANY.legalName,
    title: "Payless Towing — 24/7 Towing, Recovery & Roadside Support",
    description:
      "Towing, recovery, roadside assistance and specialized transport across Edmonton and surrounding areas.",
    images: [{ url: shareImage.src, width: shareImage.width, height: shareImage.height, alt: "Payless Towing — a blue Payless heavy wrecker towing a white semi-truck" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#042054",
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
      logo: `${COMPANY.url}/payless-logo.webp`,
      telephone: PRIMARY.phone,
      description:
        "24/7 towing, recovery, roadside assistance and specialized transport across Edmonton and surrounding areas, with long-distance towing available.",
      address: {
        "@type": "PostalAddress",
        addressLocality: COMPANY.city,
        addressRegion: "AB",
        addressCountry: "CA",
      },
      areaServed: { "@type": "City", name: COMPANY.city },
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
