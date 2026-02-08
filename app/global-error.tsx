"use client";

/** Catches root layout errors. Must include own html/body (replaces root layout). Only runs in production. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: "32rem", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem", color: "#475569" }}>
          The app failed to load. Try clearing cache and restarting.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #cbd5e1",
              background: "white",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              padding: "0.5rem 1rem",
              background: "#0d9488",
              color: "white",
              textDecoration: "none",
              borderRadius: "2px",
            }}
          >
            Go home
          </a>
        </div>
        <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#94a3b8" }}>
          Run: <code style={{ background: "#f1f5f9", padding: "0.125rem 0.25rem" }}>rm -rf .next && npm run dev</code>
        </p>
      </body>
    </html>
  );
}
