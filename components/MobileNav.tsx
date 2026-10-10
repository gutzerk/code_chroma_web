"use client";

import { useEffect, useState } from "react";
import NavLink from "./shared/NavLink";
import { NAV_ITEMS } from "./shared/nav-links";

/**
 * Mobile-only hamburger menu. On `sm:` and up the desktop nav links are shown
 * and this button is hidden. Contains the links that Nav hides on small
 * screens so users can reach Home / Documentation / Configuration / Install.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--border)] text-[color:var(--text-2)] transition-colors hover:text-[color:var(--text-1)]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[57px] border-t border-[color:var(--border-faint)] bg-[rgba(16,22,18,0.97)] px-5 py-4 backdrop-blur sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-[color:var(--text-2)] transition-colors hover:text-[color:var(--text-1)]"
                activeClassName="!bg-[color:var(--surface-2)] !text-[color:var(--text-1)]"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
