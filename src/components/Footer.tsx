import Link from "next/link";
import Logo from "./Logo";
import { COMPANY, LOCATIONS, NAV_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <Link href="/" aria-label="Payless Auto Towing home" className="brand-link"><Logo className="footer-logo" /></Link>
            <p>Towing, recovery and roadside assistance.<br />Here for the Sea-to-Sky, day and night.</p>
          </div>
          <nav aria-label="Footer">
            <h2>Explore</h2>
            {NAV_LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <nav aria-label="Dispatch telephone numbers">
            <h2>24/7 dispatch</h2>
            {LOCATIONS.map((location) => <a className="footer-dispatch" key={location.city} href={`tel:${location.tel}`}><span>{location.city}</span><span>{location.phone}</span></a>)}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {COMPANY.legalName}</p>
          <p>Concept towing imagery. Photos do not depict the actual Payless fleet.</p>
        </div>
      </div>
    </footer>
  );
}
