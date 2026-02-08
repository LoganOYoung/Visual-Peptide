import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test",
  description: "Next.js response test page. Not for production indexing.",
  robots: { index: false, follow: false },
};

export default function TestPage() {
  return (
    <div className="p-8 text-white">
      <h1>Test OK</h1>
      <p>If you see this, Next.js is responding.</p>
    </div>
  );
}
