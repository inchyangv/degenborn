"use client";

import type { ArchetypeResult } from "@degenborn/shared";
import { useEffect, useState } from "react";

interface Props {
  archetype: ArchetypeResult;
}

export default function ArchetypeReveal({ archetype }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const confidenceLabel = archetype.confidence >= 0.8 ? "Perfect Match" : archetype.confidence >= 0.6 ? "Strong Match" : "Probable Match";

  return (
    <div
      className={`bg-[var(--degen-card)] border border-[var(--neon-purple)] rounded-xl p-6 mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="text-xs tracking-widest text-[var(--neon-purple)] uppercase mb-3">
        You Are
      </div>

      <div className="mb-1">
        <h2
          className="text-3xl md:text-4xl font-black text-white glitch-text"
          data-text={archetype.profile.name}
        >
          {archetype.profile.name}
        </h2>
      </div>

      <div className="text-[var(--neon-green)] text-sm font-mono mb-3">
        "{archetype.profile.tagline}"
      </div>

      <p className="text-gray-400 text-sm leading-relaxed mb-3">
        {archetype.profile.description}
      </p>

      {/* Confidence bar: 0–100% proportional, not pixel-clamped */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <div className="flex-1 max-w-[120px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--neon-purple)] transition-all duration-700"
            style={{ width: `${Math.round(archetype.confidence * 100)}%` }}
          />
        </div>
        <span className="text-gray-500">{confidenceLabel} · {Math.round(archetype.confidence * 100)}%</span>
        {archetype.runner_up && (
          <span className="ml-1 text-gray-700">
            / {archetype.runner_up.replace(/_/g, " ")}
          </span>
        )}
      </div>
    </div>
  );
}
