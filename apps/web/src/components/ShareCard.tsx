"use client";

import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import {
  ARCHETYPE_COLORS,
  pickCaption,
  pickFlexCaption,
  pickRoastCaption,
  pickShowcaseBadges,
  evaluateBadges,
} from "@degenborn/shared";
import type { LoyaltyScore } from "@degenborn/scoring";
import { useRef, useState } from "react";
import CharacterDisplay from "./CharacterDisplay";

interface Props {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
  wallet: string;
  loyalty?: LoyaltyScore | null;
}

type CardMode = "flex" | "roast";

export default function ShareCard({ dna, archetype, state, wallet, loyalty }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mode, setMode] = useState<CardMode>("flex");

  const archetypeColor = ARCHETYPE_COLORS[archetype.archetype] ?? "#9945ff";

  // Mode-dependent values
  const isRoast = mode === "roast";
  const caption = isRoast
    ? pickRoastCaption(archetype.archetype, state)
    : pickFlexCaption(archetype.archetype, state);

  const borderColor = isRoast ? "#ff3d3d" : "#ffd700";
  const frameBg = isRoast
    ? "linear-gradient(135deg, #1a0000 0%, #2a0a0a 100%)"
    : "linear-gradient(135deg, #0a0a00 0%, #1a1400 100%)";
  const glowColor = isRoast ? "#ff3d3d" : "#ffd700";
  const modeLabel = isRoast ? "ROAST" : "FLEX";
  const modeEmoji = isRoast ? "💀" : "👑";

  // Badge row — top 3 showcase badges
  const earnedBadges = evaluateBadges(state);
  const showcaseBadges = pickShowcaseBadges(earnedBadges, 3);

  const copyCaption = async () => {
    await navigator.clipboard.writeText(`${caption}\n\nBuilt on DegenBorn × Four.meme`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToX = () => {
    const text = encodeURIComponent(`${caption}\n\nTrade on @four_meme to evolve your monster 👾\n#DegenBorn #fourmeme`);
    const profileUrl = encodeURIComponent(`${window.location.origin}/m/${wallet}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${profileUrl}`, "_blank", "noopener");
  };

  const shareNative = async () => {
    if (!navigator.share) { shareToX(); return; }
    try {
      await navigator.share({ title: `DegenBorn — ${archetype.profile.name}`, text: `${caption}\n\nTrade on @four_meme to evolve your monster 👾\n#DegenBorn #fourmeme`, url: `${window.location.origin}/m/${wallet}` });
    } catch {
      // user cancelled or not supported
    }
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
        link.download = `degenborn_${archetype.archetype}_${mode}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 justify-center">
        <span className="text-xs text-gray-500 font-mono uppercase">Tone:</span>
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <button
            onClick={() => setMode("flex")}
            className={`px-4 py-1.5 text-xs font-bold transition-all ${
              mode === "flex"
                ? "bg-[#ffd700] text-black"
                : "text-gray-400 hover:text-[#ffd700]"
            }`}
          >
            👑 Flex this
          </button>
          <button
            onClick={() => setMode("roast")}
            className={`px-4 py-1.5 text-xs font-bold transition-all ${
              mode === "roast"
                ? "bg-[#ff3d3d] text-black"
                : "text-gray-400 hover:text-[#ff3d3d]"
            }`}
          >
            💀 Roast this
          </button>
        </div>
      </div>

      {/* Card preview */}
      <div
        ref={cardRef}
        className="border-2 rounded-2xl p-5 relative overflow-hidden"
        style={{
          aspectRatio: "1/1",
          maxWidth: "400px",
          margin: "0 auto",
          background: frameBg,
          borderColor,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)` }}
        />

        {/* Corner mode badge */}
        <div
          className="absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded"
          style={{ background: borderColor, color: "#000" }}
        >
          {modeEmoji} {modeLabel}
        </div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Top bar */}
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-gray-600 font-mono">DEGENBORN</div>
            <div className="text-xs text-gray-600 font-mono">{shortWallet}</div>
          </div>

          {/* Character portrait */}
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
            <div className="text-xs font-mono" style={{ color: borderColor }}>
              "{isRoast ? archetype.profile.description.split(".")[0] : archetype.profile.tagline}"
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
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${score}%`,
                      backgroundColor: isRoast && score < 40 ? "#ff3d3d" : color,
                    }}
                  />
                </div>
                <span className="text-gray-400 w-5 text-right font-mono">{score}</span>
              </div>
            ))}
          </div>

          {/* Badge row */}
          {showcaseBadges.length > 0 && (
            <div className="flex justify-center gap-2 mb-2">
              {showcaseBadges.map((badge) => (
                <span
                  key={badge.id}
                  title={badge.name}
                  className="text-base"
                >
                  {badge.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Loyalty badge row */}
          {loyalty && (
            <div className="flex items-center justify-center mb-2">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                style={{
                  color:
                    loyalty.grade === "Legendary" ? "#ffd700"
                    : loyalty.grade === "Diamond" ? "#00d4ff"
                    : loyalty.grade === "Gold" ? "#f59e0b"
                    : loyalty.grade === "Silver" ? "#94a3b8"
                    : "#92400e",
                  borderColor:
                    loyalty.grade === "Legendary" ? "#ffd70055"
                    : loyalty.grade === "Diamond" ? "#00d4ff55"
                    : loyalty.grade === "Gold" ? "#f59e0b55"
                    : loyalty.grade === "Silver" ? "#94a3b855"
                    : "#92400e55",
                  background: "rgba(0,0,0,0.3)",
                }}
              >
                {loyalty.grade === "Legendary" ? "⭐"
                  : loyalty.grade === "Diamond" ? "💎"
                  : loyalty.grade === "Gold" ? "🥇"
                  : loyalty.grade === "Silver" ? "🥈"
                  : "🥉"}{" "}
                {loyalty.grade} · Four.meme Loyalty {loyalty.score}
              </span>
            </div>
          )}

          {/* Bottom bar */}
          <div className="mt-auto flex justify-between items-end text-xs">
            <div className="text-gray-600">Lv.{state.level} · {state.mood}</div>
            <div className="text-right">
              <div style={{ color: archetypeColor, opacity: 0.8 }} className="text-[10px] font-bold">
                ⚡ Built on Four.meme data
              </div>
              <div className="text-gray-700">#DegenBorn</div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div
        className="border rounded-xl p-4"
        style={{
          background: isRoast ? "rgba(255,61,61,0.05)" : "rgba(255,215,0,0.05)",
          borderColor: isRoast ? "rgba(255,61,61,0.3)" : "rgba(255,215,0,0.3)",
        }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: borderColor }}
        >
          {mode === "flex" ? "Flex Caption" : "Roast Caption"}
        </div>
        <p className="text-sm text-gray-300 leading-relaxed italic">"{caption}"</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={shareNative}
          className="flex-1 min-w-[120px] py-3 text-black text-sm font-black rounded-lg hover:brightness-110 transition-all"
          style={{ backgroundColor: borderColor }}
        >
          𝕏 Share to X
        </button>
        <button
          onClick={copyCaption}
          className="flex-1 min-w-[100px] py-3 border text-sm font-mono rounded-lg hover:opacity-80 transition-all"
          style={{ borderColor, color: borderColor }}
        >
          {copied ? "Copied ✓" : "Copy Text"}
        </button>
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="flex-1 min-w-[110px] py-3 border border-gray-700 text-gray-400 text-sm font-mono rounded-lg hover:border-gray-500 hover:text-gray-300 transition-all disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Save PNG"}
        </button>
      </div>

      <div className="text-xs text-gray-700 text-center">
        Auto-posting is disabled by design — you control when to share.
      </div>
    </div>
  );
}
