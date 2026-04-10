"use client";

import type { PersonaDNA } from "@degenborn/shared";

interface Props {
  dna: PersonaDNA;
  animated?: boolean;
}

const DNA_FIELDS: { key: keyof PersonaDNA; label: string; color: string }[] = [
  { key: "aggression", label: "AGGRESSION", color: "#ff3d3d" },
  { key: "conviction", label: "CONVICTION", color: "#00d4ff" },
  { key: "chaos", label: "CHAOS", color: "#9945ff" },
  { key: "luck", label: "LUCK", color: "#ffd700" },
  { key: "survival", label: "SURVIVAL", color: "#00ff88" },
];

function ScoreLabel(score: number): string {
  if (score >= 65) return "HIGH";
  if (score >= 35) return "MID";
  return "LOW";
}

export default function DNAPanel({ dna, animated }: Props) {
  return (
    <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-6 mb-6">
      <div className="text-xs tracking-widest text-gray-600 uppercase mb-4">Persona DNA</div>
      <div className="space-y-3">
        {DNA_FIELDS.map(({ key, label, color }) => {
          const score = dna[key] as number;
          const pct = `${score}%`;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-mono">{label}</span>
                <span className="font-mono font-bold" style={{ color }}>
                  {score} <span className="text-gray-600 font-normal">({ScoreLabel(score)})</span>
                </span>
              </div>
              <div className="h-2 bg-[var(--degen-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: animated ? pct : pct,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}66`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
