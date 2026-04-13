"use client";

import type { ArchetypeResult } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { useEffect, useState } from "react";

interface Props {
  archetype: ArchetypeResult;
}

const ARCHETYPE_DECLARATIONS: Record<string, string> = {
  mad_gambler: "I don't wait. I ape in.",
  ice_whale: "I don't trade. I wait. Then I destroy.",
  rug_necromancer: "I've been rugged 7 times. Still here.",
  diamond_cultist: "The bags are heavy. So is my conviction.",
  sniper_jester: "In. Out. Profit. Next.",
  ghost_bagholder: "I'm still holding. Always will be.",
};

function useTypewriter(text: string, speed = 40, start = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!start) { setDisplayed(""); return; }
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, start]);
  return displayed;
}

export default function ArchetypeReveal({ archetype }: Props) {
  const [phase, setPhase] = useState<"hidden" | "flash" | "name" | "detail">("hidden");

  const accentColor = ARCHETYPE_COLORS[archetype.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#9945ff";
  const declaration = ARCHETYPE_DECLARATIONS[archetype.archetype] ?? `"${archetype.profile.tagline}"`;
  const displayedDeclaration = useTypewriter(declaration, 38, phase === "detail");

  useEffect(() => {
    // Suspense: hidden → flash → name → detail
    const t1 = setTimeout(() => setPhase("flash"), 50);
    const t2 = setTimeout(() => setPhase("name"), 700);
    const t3 = setTimeout(() => setPhase("detail"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const confidenceLabel = archetype.confidence >= 0.8 ? "Perfect Match" : archetype.confidence >= 0.6 ? "Strong Match" : "Probable Match";

  return (
    <>
      {/* Fullscreen color flash — T1-01 */}
      {phase === "flash" && (
        <div
          className="fixed inset-0 z-50 pointer-events-none animate-ping"
          style={{
            background: accentColor,
            opacity: 0,
            animation: "archetype-flash 0.6s ease-out forwards",
          }}
        />
      )}

      <style>{`
        @keyframes archetype-flash {
          0%   { opacity: 0.55; }
          100% { opacity: 0; }
        }
      `}</style>

      <div
        className={`bg-[var(--degen-card)] border-2 rounded-xl p-6 mb-6 transition-all duration-700 ${phase !== "hidden" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ borderColor: `${accentColor}77` }}
      >
        <div className="text-xs tracking-widest uppercase mb-3" style={{ color: accentColor }}>
          You Are
        </div>

        <div className="mb-2">
          <h2
            className={`text-3xl md:text-4xl font-black text-white glitch-text transition-all duration-500 ${phase !== "hidden" ? "opacity-100" : "opacity-0"}`}
            data-text={archetype.profile.name}
            style={{ color: "#fff", textShadow: `0 0 30px ${accentColor}66` }}
          >
            {archetype.profile.name}
          </h2>
        </div>

        {/* Declaration — typewriter effect */}
        <div
          className="text-lg font-black mb-3 min-h-[1.8em]"
          style={{ color: accentColor }}
        >
          {phase === "detail" ? (
            <>
              &ldquo;{displayedDeclaration}
              {displayedDeclaration.length < declaration.length && (
                <span className="animate-pulse">_</span>
              )}
              &rdquo;
            </>
          ) : phase === "name" ? (
            <span className="text-gray-700 animate-pulse">...</span>
          ) : null}
        </div>

        <p className={`text-gray-400 text-sm leading-relaxed mb-3 transition-opacity duration-500 ${phase === "detail" ? "opacity-100" : "opacity-0"}`}>
          {archetype.profile.description}
        </p>

        {/* Confidence bar */}
        <div className={`flex items-center gap-2 text-xs text-gray-600 transition-opacity duration-500 ${phase === "detail" ? "opacity-100" : "opacity-0"}`}>
          <div className="flex-1 max-w-[120px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: phase === "detail" ? `${Math.round(archetype.confidence * 100)}%` : "0%", background: accentColor }}
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
    </>
  );
}
