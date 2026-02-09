"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

/** Catches errors on the /structure page. */
export default function StructureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="3D Structure page error"
      message="The structure viewer failed to load. Try again or go back."
      error={error}
      onReset={reset}
      links={[
        { href: "/structure", label: "Open structure page" },
        { href: "/", label: "Go home", primary: true },
      ]}
    />
  );
}
