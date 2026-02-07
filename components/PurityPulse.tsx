import Link from "next/link";
import { purityPulseEntries } from "@/lib/purityPulse";

function formatDate(d: string | undefined) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m || "1", 10) - 1]} ${parseInt(day || "1", 10)}, ${y}`;
}

export function PurityPulse() {
  return (
    <aside className="card border-teal-200">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Peptide Transparency Board</h2>
        <span className="rounded-none bg-teal-500/20 px-2 py-0.5 text-xs font-medium text-teal-600">
          Live
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Crowdsourced batch verifications from independent labs.{" "}
        <Link href="/verify" className="link-inline">
          Verify reports →
        </Link>
      </p>
      <ul className="mt-4 space-y-0">
        {purityPulseEntries.map((entry, i) => (
          <li
            key={i}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-200 py-2.5 first:pt-0 last:border-0 last:pb-0"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-slate-500">{entry.batch}</span>
              <span className="font-medium text-slate-900">{entry.peptide}</span>
            </div>
            <span className="rounded-none bg-teal-100 px-1.5 py-0.5 font-mono text-sm text-teal-600">
              {entry.purity}
            </span>
            <span className="w-full text-xs text-slate-500 sm:w-auto">
              {entry.verifiedBy}
              {entry.date && (
                <span className="ml-1.5 text-slate-600">· {formatDate(entry.date)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
