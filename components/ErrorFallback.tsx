"use client";

import { useEffect } from "react";
import Link from "next/link";

export type ErrorFallbackLink = { href: string; label: string; primary?: boolean };

interface ErrorFallbackProps {
  title: string;
  message: string;
  error?: Error & { digest?: string };
  onReset: () => void;
  /** Try again + additional links (e.g. Open structure page, Go home). */
  links: ErrorFallbackLink[];
  /** Optional footer (e.g. dev hint). */
  footer?: React.ReactNode;
}

/** Shared error UI for error boundaries. */
export function ErrorFallback({
  title,
  message,
  error,
  onReset,
  links,
  footer,
}: ErrorFallbackProps) {
  useEffect(() => {
    if (error) console.error("Error boundary:", error?.message ?? error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
        {links.map(({ href, label, primary }) => (
          <Link
            key={href}
            href={href}
            className={
              primary
                ? "rounded-none border border-teal-500 bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
                : "rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            {label}
          </Link>
        ))}
      </div>
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
}
