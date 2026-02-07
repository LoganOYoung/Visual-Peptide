"use client";

import { useState } from "react";

const JANOSHIK_VERIFY_BASE = "https://janoshik.com/tests/rawdata/";

export function ReportVerifier() {
  const [taskId, setTaskId] = useState("");

  const trimmed = taskId.trim();
  const verifyUrl = trimmed ? `${JANOSHIK_VERIFY_BASE}${trimmed}` : null;

  return (
    <div className="card mt-8">
      <h2 className="text-lg font-semibold text-slate-900">Report verification helper</h2>
      <p className="mt-2 text-slate-400">
        Enter a Janoshik task ID to open the official verification page or follow steps to verify the report.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          placeholder="e.g. task ID from report"
          className="input max-w-[280px] font-mono"
        />
        {verifyUrl ? (
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Open verify page →
          </a>
        ) : (
          <span className="rounded-none border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
            Enter task ID
          </span>
        )}
      </div>
      <ol className="mt-4 list-decimal list-inside space-y-1 text-sm text-slate-400">
        <li>Open the link above (or go to janoshik.com and use “Verify report”).</li>
        <li>Enter the task ID from your report.</li>
        <li>Check that the report content matches what you received.</li>
      </ol>
    </div>
  );
}
