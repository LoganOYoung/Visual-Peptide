import { ImageResponse } from "next/og";

export const alt = "Visual Peptide — Reconstitution, Dosing & Purity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Visual Peptide
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#475569",
            maxWidth: 720,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Precision without the math — reconstitution, dosing, 3D structure, purity verification
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 24,
            color: "#0d9488",
          }}
        >
          BPC-157 · Semaglutide · Tirzepatide · and more
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
