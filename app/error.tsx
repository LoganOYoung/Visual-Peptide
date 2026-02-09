"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

/** Catches errors in root layout children (pages). */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="Something went wrong"
      message="The page failed to load. Try again or go back."
      error={error}
      onReset={reset}
      links={[{ href: "/", label: "Go home", primary: true }]}
    />
  );
}
