"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerLinks, toolsSubLinks, peptidesSubLinks, structureSubLinks, helpSubLinks } from "@/lib/nav";

const DROPDOWN_LINKS: Record<string, { href: string; label: string }[]> = {
  "/tools": toolsSubLinks as unknown as { href: string; label: string }[],
  "/peptides": peptidesSubLinks as unknown as { href: string; label: string }[],
  "/structure": structureSubLinks as unknown as { href: string; label: string }[],
  "/guide": helpSubLinks as unknown as { href: string; label: string }[],
};

const CLOSE_DELAY_MS = 120;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const openAndCancelClose = useCallback((key: string) => {
    clearCloseTimer();
    setOpenDropdown(key);
  }, [clearCloseTimer]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <img src="/logo.svg" alt="" className="h-8 w-8 shrink-0" width={32} height={32} />
          Visual Peptide
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {headerLinks.map((link) => {
            const sub = DROPDOWN_LINKS[link.href];
            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href + "/") ||
              (link.href === "/guide" && ["/guide", "/faq", "/about"].includes(pathname));
            if (sub && sub.length > 0) {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => openAndCancelClose(link.href)}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={link.href}
                    className={`rounded-none px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white inline-flex items-center gap-1 ${
                      isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                    <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {openDropdown === link.href && (
                    <ul
                      className="absolute left-0 top-full mt-0.5 min-w-[180px] rounded-none border border-slate-200 bg-white py-1 shadow-lg"
                      onMouseEnter={() => openAndCancelClose(link.href)}
                      onMouseLeave={scheduleClose}
                    >
                      {sub.map((s) => (
                        <li key={s.href}>
                          {s.href.startsWith("http") ? (
                            <a
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {s.label}
                            </a>
                          ) : (
                            <Link
                              href={s.href}
                              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {s.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-none px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-none text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white md:hidden" aria-label="Mobile menu">
          <ul className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {headerLinks.map((link) => {
              const sub = DROPDOWN_LINKS[link.href];
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/") ||
                (link.href === "/guide" && ["/guide", "/faq", "/about"].includes(pathname));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex min-h-[44px] items-center rounded-none px-3 py-3 text-sm font-medium transition ${
                      isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {sub && sub.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                      {sub.map((s) => (
                        <li key={s.href}>
                          {s.href.startsWith("http") ? (
                            <a
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMobileOpen(false)}
                              className="flex min-h-[40px] items-center py-2 text-sm text-slate-600 hover:text-teal-600"
                            >
                              {s.label}
                            </a>
                          ) : (
                            <Link
                              href={s.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex min-h-[40px] items-center py-2 text-sm text-slate-600 hover:text-teal-600"
                            >
                              {s.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
