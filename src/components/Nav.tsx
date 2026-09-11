"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Icon from "./Icon";
import { LOCATIONS, NAV_LINKS, PRIMARY } from "@/lib/site";

type Panel = "dispatch" | "menu";

/**
 * The four offices drawn as stops on the highway, south to north. Shared by
 * the desktop dispatch board and the mobile menu so both read the same way.
 */
function DispatchRoute() {
  return (
    <div className="dispatch-board-body">
      <p className="dispatch-board-title">Call the dispatch nearest you</p>
      <ul className="dispatch-route">
        {LOCATIONS.map((location) => (
          <li key={location.city}>
            <a href={`tel:${location.tel}`}>
              <span className="dispatch-route-city">{location.city}</span>
              <span className="dispatch-route-number">{location.phone}</span>
              <Icon name="phone" />
            </a>
          </li>
        ))}
      </ul>
      <p className="dispatch-board-note">
        24-hour emergency service, every day of the year.
      </p>
    </div>
  );
}

export default function Nav() {
  const [open, setOpen] = useState<Panel | null>(null);
  const dispatchButton = useRef<HTMLButtonElement>(null);
  const dispatchBoard = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const trigger = open === "menu" ? menuButton.current : dispatchButton.current;
    const panel = open === "menu" ? menu.current : dispatchBoard.current;
    const outside = (target: EventTarget | null) =>
      !panel?.contains(target as Node) && !trigger?.contains(target as Node);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(null); trigger?.focus(); }
    };
    const onPointer = (event: PointerEvent) => { if (outside(event.target)) setOpen(null); };
    // Tabbing past the end closes the panel, so focus never lands on page
    // content the full-screen menu is covering.
    const onFocus = (event: FocusEvent) => { if (outside(event.target)) setOpen(null); };
    // Each panel only exists on one side of the breakpoint.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => { if (desktop.matches === (open === "menu")) setOpen(null); };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    desktop.addEventListener("change", onBreakpoint);
    if (open === "menu") document.documentElement.classList.add("nav-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
      desktop.removeEventListener("change", onBreakpoint);
      document.documentElement.classList.remove("nav-locked");
    };
  }, [open]);

  const current = (href: string) => (pathname === href ? "page" : undefined);
  const toggle = (panel: Panel) => setOpen((now) => (now === panel ? null : panel));

  return (
    <header className="site-header">
      <nav aria-label="Primary" className="nav-main site-container">
        <Link href="/" aria-label="Payless Towing home" className="brand-link">
          <Logo className="nav-logo" priority />
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
          <button
            ref={dispatchButton}
            type="button"
            className="nav-dispatch-toggle"
            aria-expanded={open === "dispatch"}
            aria-controls="dispatch-board"
            onClick={() => toggle("dispatch")}
          >
            <span className="nav-beacon" aria-hidden="true" />
            Local dispatch
            <Icon name="chevron" />
          </button>
          <div
            ref={dispatchBoard}
            id="dispatch-board"
            className="dispatch-board"
            hidden={open !== "dispatch"}
          >
            <DispatchRoute />
          </div>

          <a href={`tel:${PRIMARY.tel}`} className="button button-yellow nav-call">
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
            aria-expanded={open === "menu"}
            aria-controls="mobile-menu"
            onClick={() => toggle("menu")}
          >
            {open === "menu" ? "Close" : "Menu"}
            <span className="menu-toggle-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      <div ref={menu} id="mobile-menu" className="mobile-menu" hidden={open !== "menu"}>
        <nav aria-label="Mobile navigation" className="site-container">
          <ul className="mobile-menu-links">
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} style={{ "--i": index } as CSSProperties}>
                <Link
                  href={link.href}
                  aria-current={current(link.href)}
                  onClick={() => setOpen(null)}
                >
                  {link.label}
                  <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ul>
          <DispatchRoute />
        </nav>
      </div>
    </header>
  );
}
