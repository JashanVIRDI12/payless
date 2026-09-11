"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Icon from "./Icon";
import { NAV_LINKS, PRIMARY } from "@/lib/site";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    const onOutside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node) && !menuButton.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onOutside); desktop.removeEventListener("change", closeOnDesktop); };
  }, [open]);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header className="site-header">
      <div className="utility-bar"><div className="site-container"><span><Icon name="clock" />24/7 towing &amp; roadside assistance</span><span>Serving the Sea-to-Sky since the 1970s</span></div></div>
      <nav aria-label="Primary" className="nav-main site-container">
        <Link href="/" aria-label="Payless Auto Towing home" className="brand-link"><Logo className="nav-logo" /></Link>
        <ul className="desktop-links">{NAV_LINKS.map((link) => <li key={link.href}><Link href={link.href} aria-current={current(link.href)}>{link.label}</Link></li>)}</ul>
        <a href={`tel:${PRIMARY.tel}`} className="button button-yellow nav-call"><Icon name="phone" /><span>{PRIMARY.phone}</span></a>
        <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "×" : "☰"}</span></button>
      </nav>
      <div ref={menu} id="mobile-menu" hidden={!open} className="mobile-menu"><nav aria-label="Mobile navigation">{NAV_LINKS.map((link) => <Link key={link.href} href={link.href} aria-current={current(link.href)} onClick={() => setOpen(false)}>{link.label}<Icon name="arrow" /></Link>)}<a href={`tel:${PRIMARY.tel}`} className="mobile-menu-call"><Icon name="phone" /> Call dispatch: {PRIMARY.phone}</a></nav></div>
    </header>
  );
}
