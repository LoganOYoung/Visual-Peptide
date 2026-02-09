"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function StructureDemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="Something went wrong"
      message="The 3D demo failed to load. This can happen with cached builds or network issues."
      error={error}
      onReset={reset}
      links={[{ href: "/structure", label: "Go to 3D Structure", primary: true }]}
      footer={
        <p className="text-xs text-slate-500">
          Try: <code className="rounded bg-slate-100 px-1">rm -rf .next && npm run dev</code>
        </p>
      }
    />
  );
}
