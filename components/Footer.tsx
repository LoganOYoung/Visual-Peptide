import Link from "next/link";
import { navLinks } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom,0)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <img src="/logo.svg" alt="" className="h-8 w-8 shrink-0" width={32} height={32} />
            Visual Peptide
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-[44px] py-2 text-sm text-slate-600 transition hover:text-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-none inline-flex items-center"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/LoganOYoung/Visual-Peptide/issues/new?title=Feedback%3A%20&body=**Page**%3A%20%0A**What%20went%20wrong%20or%20suggestion**%3A%20%0A"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] py-2 text-sm text-slate-600 transition hover:text-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-none inline-flex items-center"
              aria-label="Send feedback (opens GitHub Issues)"
            >
              Feedback
            </a>
          </nav>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          For research and education only. Not medical advice. Verify purity with third-party testing (e.g. Janoshik) when sourcing.
        </p>
      </div>
    </footer>
  );
}
