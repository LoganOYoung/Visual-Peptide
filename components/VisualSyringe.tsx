"use client";

import { useMemo } from "react";

const SYRINGE_CONFIG = {
  "0.3": { maxUnits: 30, height: 120 },
  "0.5": { maxUnits: 50, height: 140 },
  "1": { maxUnits: 100, height: 180 },
} as const;

interface VisualSyringeProps {
  syringeMl: "0.3" | "0.5" | "1";
  units: number;
  concentrationMgPerMl: number;
  doseMcg: number;
}

export function VisualSyringe({
  syringeMl,
  units,
  concentrationMgPerMl,
  doseMcg,
}: VisualSyringeProps) {
  const { maxUnits, height } = SYRINGE_CONFIG[syringeMl];
  const clampedUnits = Math.min(Math.max(0, units), maxUnits);
  const fillPercent = maxUnits > 0 ? (clampedUnits / maxUnits) * 100 : 0;
  const fitsInSyringe = units <= maxUnits;

  const tickMarks = useMemo(() => {
    const step = syringeMl === "0.3" ? 5 : syringeMl === "0.5" ? 10 : 10;
    const marks: number[] = [];
    for (let u = 0; u <= maxUnits; u += step) {
      marks.push(u);
    }
    return marks;
  }, [syringeMl, maxUnits]);

  const barrelHeight = height - 24;

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative">
        <svg
          width={80}
          height={height + 20}
          viewBox={`0 0 80 ${height + 20}`}
          className="drop-shadow-md"
        >
          {/* Plunger (top) */}
          <rect x={28} y={0} width={24} height={12} rx={0} fill="#64748b" />
          <rect x={30} y={2} width={20} height={8} rx={0} fill="#94a3b8" />

          {/* Barrel outline */}
          <rect
            x={20}
            y={12}
            width={40}
            height={barrelHeight}
            rx={0}
            fill="none"
            stroke="#64748b"
            strokeWidth={2}
          />

          {/* Fill (teal) */}
          {concentrationMgPerMl > 0 && doseMcg > 0 && (
            <rect
              x={22}
              y={12 + barrelHeight - (fillPercent / 100) * barrelHeight}
              width={36}
              height={(fillPercent / 100) * barrelHeight}
              rx={0}
              fill="rgba(20, 184, 166, 0.6)"
              stroke="#14b8a6"
              strokeWidth={1}
            />
          )}

          {/* Tick marks */}
          {tickMarks.map((u) => {
            const y = 12 + barrelHeight - (u / maxUnits) * barrelHeight;
            const isMajor = u % (syringeMl === "0.3" ? 10 : 20) === 0;
            return (
              <g key={u}>
                <line
                  x1={60}
                  y1={y}
                  x2={64}
                  y2={y}
                  stroke="#64748b"
                  strokeWidth={isMajor ? 1.5 : 1}
                />
                {isMajor && u > 0 && (
                  <text
                    x={68}
                    y={y + 4}
                    fontSize={10}
                    fill="#94a3b8"
                    fontFamily="ui-monospace, monospace"
                  >
                    {u}
                  </text>
                )}
              </g>
            );
          })}

          {/* Target line (red dashed) */}
          {concentrationMgPerMl > 0 && doseMcg > 0 && clampedUnits > 0 && (
            <line
              x1={20}
              y1={12 + barrelHeight - (fillPercent / 100) * barrelHeight}
              x2={60}
              y2={12 + barrelHeight - (fillPercent / 100) * barrelHeight}
              stroke="#f87171"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          )}

          {/* Needle hub */}
          <rect
            x={32}
            y={12 + barrelHeight}
            width={16}
            height={8}
            rx={0}
            fill="#475569"
          />
          <rect
            x={36}
            y={12 + barrelHeight + 8}
            width={8}
            height={12}
            fill="#94a3b8"
          />
        </svg>
      </div>
      <div className="mt-3 text-center">
        <p className="text-lg font-bold text-teal-600">
          Draw to <span className="text-slate-900">{clampedUnits}</span> units
        </p>
        <p className="text-sm text-slate-600">
          ({((clampedUnits / 100) * (syringeMl === "0.3" ? 0.3 : syringeMl === "0.5" ? 0.5 : 1)).toFixed(2)} mL)
        </p>
        {!fitsInSyringe && (
          <p className="mt-1 text-sm text-amber-700">
            Exceeds {syringeMl} mL syringe — use 0.5 or 1 mL
          </p>
        )}
      </div>
    </div>
  );
}
