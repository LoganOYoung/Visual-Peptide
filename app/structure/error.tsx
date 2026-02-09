"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Catches errors on the /structure page. */
export default function StructureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Structure page error:", error?.message, error?.digest);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900">3D Structure page error</h1>
      <p className="mt-2 text-slate-600">
        The structure viewer failed to load. Try again or go back.
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
          className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Open structure page
        </Link>
        <Link
          href="/"
          className="rounded-none border border-teal-500 bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
