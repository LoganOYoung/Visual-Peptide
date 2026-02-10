"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBaseUrl } from "@/lib/site";

const INQUIRY_EMAIL = typeof process !== "undefined" && process.env.NEXT_PUBLIC_INQUIRY_EMAIL?.trim()
  ? process.env.NEXT_PUBLIC_INQUIRY_EMAIL
  : "inquiry@visualpeptide.com";

export default function InquiryPage() {
  const [email, setEmail] = useState("");
  const [peptide, setPeptide] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Synthesis / quote request — Visual Peptide");
    const bodyParts: string[] = [];
    if (email) bodyParts.push(`Email: ${email}`);
    if (peptide) bodyParts.push(`Peptide / sequence: ${peptide}`);
    if (message) bodyParts.push(`Message:\n${message}`);
    const body = encodeURIComponent(bodyParts.join("\n\n"));
    const mailto = `mailto:${INQUIRY_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request quote" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Request quote / Send to synthesis lab</h1>
      <p className="mt-2 text-slate-600">
        Need custom peptide synthesis or a quote? Fill in the form below. Your email client will open to send the request. We may forward it to partner CROs; you will hear back from them or from us.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Email <span className="text-slate-500">(required)</span></span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Peptide name or sequence</span>
          <input
            type="text"
            value={peptide}
            onChange={(e) => setPeptide(e.target.value)}
            className="input mt-1"
            placeholder="e.g. BPC-157, or sequence"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input mt-1 min-h-[100px] resize-y"
            placeholder="Quantity, purity, modification, timeline, etc."
            rows={4}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">
            Open email to send request
          </button>
          <Link href="/suppliers" className="link-inline text-sm">
            View suppliers →
          </Link>
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        For research use only. We do not sell peptides; we connect you with synthesis labs. Verify purity via third-party testing (e.g. Janoshik) when sourcing.{" "}
        <Link href="/verify" className="link-inline">Purity & Verify</Link>
      </p>
    </div>
  );
}
