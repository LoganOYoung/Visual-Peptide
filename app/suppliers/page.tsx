import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { supplierList } from "@/lib/suppliers";

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Third-party tested and community-vetted peptide suppliers. Verify reports first.",
};

export default function SuppliersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Suppliers" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Suppliers & Sourcing</h1>
      <p className="mt-2 text-slate-600">
        We aim to list suppliers that have been third-party tested (e.g. Janoshik) or are otherwise vetted by the research community. Listing is for information only; always verify purity and compliance yourself.
      </p>

      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Verification first</h2>
        <p className="mt-2 text-slate-600">
          Before choosing a supplier, check the{" "}
          <Link href="/verify" className="text-teal-600 hover:underline">
            Purity & Verify
          </Link>{" "}
          page and use the public Janoshik database to see which batches and vendors have test reports.
        </p>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Supplier directory</h2>
        <p className="mt-1 text-sm text-slate-600">
          Labs/suppliers with available third-party test results. We add entries as reports are verified. Listing does not imply endorsement.
        </p>
        {supplierList.length === 0 ? (
          <p className="mt-4 text-slate-500">
            No suppliers listed yet. We will add entries as third-party test reports (e.g. Janoshik) are verified. If you are a supplier and want to be considered, ensure your batches are tested and reports are verifiable via the lab&apos;s official site.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600 text-left">
                  <th className="py-3 pr-4 font-medium text-slate-600">Name</th>
                  <th className="py-3 px-4 font-medium text-slate-600">Region</th>
                  <th className="py-3 px-4 font-medium text-slate-600">Test reports</th>
                  <th className="py-3 px-4 font-medium text-slate-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {supplierList.map((s, i) => (
                  <tr key={i} className="border-b border-slate-200 last:border-0">
                    <td className="py-3 pr-4 text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.region}</td>
                    <td className="py-3 px-4">
                      {s.reportsLink ? (
                        <a
                          href={s.reportsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
