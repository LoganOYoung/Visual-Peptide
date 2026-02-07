import { Suspense } from "react";
import { CalculatorContent } from "./CalculatorContent";

function CalculatorFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="h-4 w-48 animate-pulse rounded-none bg-slate-200" />
      <div className="mt-4 h-8 w-72 animate-pulse rounded-none bg-slate-200" />
      <div className="mt-6 h-32 animate-pulse rounded-none bg-slate-200" />
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<CalculatorFallback />}>
      <CalculatorContent />
    </Suspense>
  );
}
