"use client";

import { useState } from "react";

const JANOSHIK_VERIFY_BASE = "https://janoshik.com/tests/rawdata/";

export function ReportVerifier() {
  const [taskId, setTaskId] = useState("");

  const trimmed = taskId.trim();
  const verifyUrl = trimmed ? `${JANOSHIK_VERIFY_BASE}${trimmed}` : null;

  return (
    <div className="card mt-8 border-teal-200 bg-teal-50/20">
      <h2 className="text-lg font-semibold text-slate-900">Verify a report</h2>
      <p className="mt-2 text-slate-600">
        Enter the <strong>task ID</strong> from your Janoshik report (e.g. on the report PDF). We&apos;ll open the lab&apos;s official verification page for that ID.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          placeholder="Task ID from report"
          className="input max-w-[280px] font-mono"
          aria-label="Janoshik task ID"
        />
        {verifyUrl ? (
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            aria-label="Open Janoshik verification page in new tab"
          >
            Open verification page →
          </a>
        ) : (
          <span className="rounded-none border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
            Enter task ID above
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-600">
        On the lab&apos;s page, confirm that the report content matches what you received. We do not store or validate reports; verification is done on Janoshik&apos;s site.
      </p>
    </div>
  );
}
