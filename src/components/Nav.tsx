"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
    const trigger = menuButton.current;
    const panel = menu.current;
    const outside = (target: EventTarget | null) =>
      !panel?.contains(target as Node) && !trigger?.contains(target as Node);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger?.focus(); }
    };
    const onPointer = (event: PointerEvent) => { if (outside(event.target)) setOpen(false); };
    // Tabbing past the end closes the menu, so focus never lands on page
    // content the full-screen panel is covering.
    const onFocus = (event: FocusEvent) => { if (outside(event.target)) setOpen(false); };
    // The menu only exists below the desktop breakpoint.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => { if (desktop.matches) setOpen(false); };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    desktop.addEventListener("change", onBreakpoint);
    document.documentElement.classList.add("nav-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
      desktop.removeEventListener("change", onBreakpoint);
      document.documentElement.classList.remove("nav-locked");
    };
  }, [open]);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header className="site-header">
      <nav aria-label="Primary" className="nav-main site-container">
        <Link href="/" aria-label="Payless Towing home" className="brand-link">
          <Logo className="nav-logo" />
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} aria-current={current(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a href={`tel:${PRIMARY.tel}`} className="button button-yellow nav-call" data-cursor="call">
            <Icon name="phone" />
            <span>
              <small>Call 24/7</small>
              {PRIMARY.phone}
            </span>
          </a>

          <button
            ref={menuButton}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
            <span className="menu-toggle-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      <div ref={menu} id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile navigation" className="site-container">
          <ul className="mobile-menu-links">
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} style={{ "--i": index } as CSSProperties}>
                <Link
                  href={link.href}
                  aria-current={current(link.href)}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="menu-dispatch">
            <p>
              <span className="nav-beacon" aria-hidden="true" />
              Need help now? Our team is ready 24/7.
            </p>
            <a href={`tel:${PRIMARY.tel}`} className="button button-yellow" data-cursor="call">
              <Icon name="phone" />
              Call {PRIMARY.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
