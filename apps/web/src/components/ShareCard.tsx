"use client";

import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { useRef, useState } from "react";

interface Props {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
  wallet: string;
}

export default function ShareCard({ dna, archetype, state, wallet }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const caption = generateCaption(dna, archetype, state);
  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  const copyCaption = async () => {
    await navigator.clipboard.writeText(`${caption}\n\nBuilt on DegenBorn × Four.meme`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCard = async () => {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: "#0a0a0f",
          scale: 2,
        });
        const link = document.createElement("a");
        link.download = `degenborn_${archetype.archetype}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card preview */}
      <div
        ref={cardRef}
        className="bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2a] border border-[var(--neon-purple)] rounded-2xl p-6 relative overflow-hidden"
        style={{ aspectRatio: "1/1", maxWidth: "400px", margin: "0 auto" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: "radial-gradient(circle at 50% 50%, #9945ff, transparent 70%)",
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Top bar */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-xs text-gray-600 font-mono">DEGENBORN</div>
            <div className="text-xs text-gray-600 font-mono">{shortWallet}</div>
          </div>

          {/* Archetype */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-xs text-[var(--neon-purple)] uppercase tracking-widest mb-2">
              Soul Core
            </div>
            <h2 className="text-3xl font-black text-white mb-1">{archetype.profile.name}</h2>
            <div className="text-[var(--neon-green)] text-sm font-mono mb-6">
              "{archetype.profile.tagline}"
            </div>

            {/* Mini DNA bars */}
            <div className="w-full max-w-[200px] space-y-1.5">
              {([
                ["AGG", dna.aggression, "#ff3d3d"],
                ["CON", dna.conviction, "#00d4ff"],
                ["CHA", dna.chaos, "#9945ff"],
                ["LCK", dna.luck, "#ffd700"],
                ["SRV", dna.survival, "#00ff88"],
              ] as [string, number, string][]).map(([label, score, color]) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 w-8 font-mono">{label}</span>
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-gray-400 w-6 text-right font-mono">{score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-4 flex justify-between items-end text-xs">
            <div className="text-gray-600">Lv.{state.level} · {state.mood}</div>
            <div className="text-gray-700">four.meme hackathon</div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4">
        <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Caption</div>
        <p className="text-sm text-gray-300 leading-relaxed">{caption}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={copyCaption}
          className="flex-1 py-3 border border-[var(--neon-purple)] text-[var(--neon-purple)] text-sm font-mono rounded-lg hover:bg-[var(--neon-purple)] hover:text-black transition-all"
        >
          {copied ? "Copied ✓" : "Copy Caption"}
        </button>
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="flex-1 py-3 bg-[var(--neon-green)] text-black text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Download Card"}
        </button>
      </div>

      <div className="text-xs text-gray-700 text-center">
        Share on X / Discord. Auto-posting is disabled by design.
      </div>
    </div>
  );
}

function generateCaption(
  dna: PersonaDNA,
  archetype: ArchetypeResult,
  state: CharacterState,
): string {
  const templates = {
    mad_gambler: `I'm a ${archetype.profile.name} on DegenBorn. Aggression ${dna.aggression}. Chaos ${dna.chaos}. I regret nothing. 🔥`,
    ice_whale: `Conviction ${dna.conviction}. Level ${state.level}. The ${archetype.profile.name} doesn't rush. 🧊`,
    rug_necromancer: `Rugged ${Math.floor(dna.chaos / 25)} times. Still here. Survival ${dna.survival}. I am the ${archetype.profile.name}. 💀`,
    diamond_cultist: `Conviction ${dna.conviction}. Luck ${dna.luck}. The bags don't move. Neither do I. 💎`,
    sniper_jester: `In. Out. +${dna.luck}% accuracy. The ${archetype.profile.name} never misses for long. 🎯`,
    ghost_bagholder: `Holding since whenever. Conviction ${dna.conviction}. The ${archetype.profile.name} remembers the floor price. 👻`,
  };

  return (
    (templates as Record<string, string>)[archetype.archetype] ??
    `I am the ${archetype.profile.name}. DNA: ${dna.aggression}/${dna.conviction}/${dna.chaos}/${dna.luck}/${dna.survival}`
  );
}
