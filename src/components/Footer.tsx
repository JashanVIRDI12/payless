import Link from "next/link";
import Logo from "./Logo";
import { COMPANY, NAV_LINKS, PRIMARY } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <Link href="/" aria-label="Payless Towing home" className="brand-link"><Logo className="footer-logo" onDark /></Link>
            <p>Towing, recovery and roadside assistance.<br />Here for Edmonton, day and night.</p>
          </div>
          <nav aria-label="Footer">
            <h2>Explore</h2>
            {NAV_LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <nav aria-label="Dispatch telephone numbers">
            <h2>24/7 dispatch</h2>
            <a className="footer-dispatch" href={`tel:${PRIMARY.tel}`}><span>{PRIMARY.city}</span><span>{PRIMARY.phone}</span></a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {COMPANY.legalName}</p>
        </div>
      </div>
    </footer>
  );
}
