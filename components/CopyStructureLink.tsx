"use client";

import { useState, useRef, useEffect } from "react";

export function CopyStructureLink({ pdbId }: { pdbId: string }) {
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleCopy = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/structure?pdb=${pdbId}`
        : "";
    if (!url) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    navigator.clipboard
      .writeText(url)
      .then(
        () => setStatus("ok"),
        () => setStatus("fail")
      )
      .finally(() => {
        timeoutRef.current = setTimeout(() => {
          setStatus("idle");
          timeoutRef.current = null;
        }, 2000);
      });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="link-inline inline-flex min-h-[44px] items-center font-medium sm:min-h-0"
      title="Copy structure URL"
    >
      {status === "ok" ? "Copied!" : status === "fail" ? "Copy failed" : "Copy link"}
    </button>
  );
}
