"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StructureDemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Structure demo error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">
        The 3D demo failed to load. This can happen with cached builds or network issues.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
        <Link
          href="/structure"
          className="rounded-none border border-teal-500 bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
        >
          Go to 3D Structure
        </Link>
      </div>
      <p className="mt-8 text-xs text-slate-500">
        Try: <code className="rounded bg-slate-100 px-1">rm -rf .next && npm run dev</code>
      </p>
    </div>
  );
}
