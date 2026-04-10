"use client";

import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { useRef, useState } from "react";
import CharacterDisplay from "./CharacterDisplay";

interface Props {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
  wallet: string;
}

const CAPTION_BANK: Record<string, string[]> = {
  mad_gambler: [
    "Ape in. Ape out. Ape in again. The ritual never ends.",
    "I don't have a plan. I have aggression.",
    "100x or the morgue. There is no in between.",
    "Chart? That's my enemy. Vibes? That's my edge.",
  ],
  ice_whale: [
    "I don't trade. I wait. Then I destroy.",
    "The market moves around me. I am the floor.",
    "Patience is the most violent thing in crypto.",
    "You sold at the bottom. I bought. That's the whole story.",
  ],
  rug_necromancer: [
    "Rugged three times this week. Still here. Still cursed.",
    "I died. The bag survived. Close enough.",
    "Down 1400. Back 1200. The necromancer returns.",
    "Every rug is just a scar I haven't named yet.",
  ],
  diamond_cultist: [
    "The bags don't move. Neither do I.",
    "Red candles are just character development.",
    "I've been averaging down since 2021. This is fine.",
    "The price means nothing. The conviction means everything.",
  ],
  sniper_jester: [
    "In. Out. +400%. In again. Out again. Repeat.",
    "I don't time the market. I am the market.",
    "Fast hands. No heart. Perfect accuracy.",
    "They called it luck. I call it reflexes.",
  ],
  ghost_bagholder: [
    "I don't check the price anymore. It's better this way.",
    "The bag is heavy. The ghost is light.",
    "I remember the floor price. I will always remember.",
    "Somewhere between bagholding and enlightenment.",
  ],
};

function pickCaption(archetype: string, state: CharacterState): string {
  const bank = CAPTION_BANK[archetype] ?? [`I am the ${archetype.replace(/_/g, " ")}.`];
  // Pick based on mood + crown for some determinism
  const idx = ((state.crown_count ?? 0) + (state.scar_count ?? 0)) % bank.length;
  return bank[idx]!;
}

export default function ShareCard({ dna, archetype, state, wallet }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const caption = pickCaption(archetype.archetype, state);
  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  const archetypeColor = ARCHETYPE_COLORS[archetype.archetype] ?? "#9945ff";

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
          useCORS: true,
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
        className="border rounded-2xl p-5 relative overflow-hidden"
        style={{
          aspectRatio: "1/1",
          maxWidth: "400px",
          margin: "0 auto",
          background: `linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 100%)`,
          borderColor: archetypeColor,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 50%, ${archetypeColor}, transparent 70%)` }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Top bar */}
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-gray-600 font-mono">DEGENBORN</div>
            <div className="text-xs text-gray-600 font-mono">{shortWallet}</div>
          </div>

          {/* Character portrait — top 40% of card */}
          <div className="flex justify-center mb-3">
            <CharacterDisplay
              archetype={archetype.archetype as any}
              state={state}
              wallet={wallet}
              size={150}
              showTraitBadges
            />
          </div>

          {/* Archetype name + tagline */}
          <div className="text-center mb-3">
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: archetypeColor }}>
              Soul Core
            </div>
            <h2 className="text-2xl font-black text-white mb-0.5">{archetype.profile.name}</h2>
            <div className="text-[var(--neon-green)] text-xs font-mono">
              "{archetype.profile.tagline}"
            </div>
          </div>

          {/* Mini DNA bars */}
          <div className="w-full space-y-1 mb-2">
            {([
              ["AGG", dna.aggression, "#ff3d3d"],
              ["CON", dna.conviction, "#00d4ff"],
              ["CHA", dna.chaos, "#9945ff"],
              ["LCK", dna.luck, "#ffd700"],
              ["SRV", dna.survival, "#00ff88"],
            ] as [string, number, string][]).map(([label, score, color]) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="text-gray-600 w-7 font-mono">{label}</span>
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
                </div>
                <span className="text-gray-400 w-5 text-right font-mono">{score}</span>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-auto flex justify-between items-end text-xs">
            <div className="text-gray-600">Lv.{state.level} · {state.mood}</div>
            <div className="text-gray-700">four.meme hackathon</div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4">
        <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Caption</div>
        <p className="text-sm text-gray-300 leading-relaxed italic">"{caption}"</p>
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

const ARCHETYPE_COLORS: Record<string, string> = {
  mad_gambler: "#ff3d3d",
  ice_whale: "#00d4ff",
  rug_necromancer: "#9945ff",
  diamond_cultist: "#88ccff",
  sniper_jester: "#ffd700",
  ghost_bagholder: "#aaaaaa",
};
