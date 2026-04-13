"use client";

/**
 * T4-02 — Degen Zodiac
 *
 * 6 archetypes as "Degen Signs". 6×6 compatibility matrix.
 * Select two archetypes → get compatibility result + share card.
 */

import { useState } from "react";
import Link from "next/link";
import type { ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";

interface Compatibility {
  emoji: string;
  label: string;
  description: string;
  verdict: "legendary" | "great" | "neutral" | "bad" | "toxic";
}

// 6×6 compatibility matrix — ordered: [a][b] where a <= b (symmetric)
const COMPAT: Record<string, Compatibility> = {
  "mad_gambler:mad_gambler": {
    emoji: "💥",
    label: "Chaos Supernova",
    description: "Two rockets. Zero parachutes. No stop-loss. No survivors.",
    verdict: "toxic",
  },
  "mad_gambler:ice_whale": {
    emoji: "💀",
    label: "Irreconcilable Differences",
    description:
      "One apes in before the chart loads. One waits 30 days to enter. Same token, opposite fate.",
    verdict: "bad",
  },
  "mad_gambler:rug_necromancer": {
    emoji: "🔥",
    label: "Chaos Brothers",
    description:
      "Both thrive in destruction. One creates it. One survives it. Dangerous together.",
    verdict: "great",
  },
  "mad_gambler:diamond_cultist": {
    emoji: "⚡",
    label: "Explosive Faith",
    description:
      "The gambler exits in 3 minutes. The cultist holds for 3 months. RIP shared portfolio.",
    verdict: "bad",
  },
  "mad_gambler:sniper_jester": {
    emoji: "💰",
    label: "Speed Demons",
    description:
      "Both fast. One's sloppy. One's surgical. Surprisingly effective, chaotically profitable.",
    verdict: "great",
  },
  "mad_gambler:ghost_bagholder": {
    emoji: "😰",
    label: "Bad Influence",
    description:
      "The gambler teaches the bagholder to yolo. The bagholder is ruined. The gambler is already gone.",
    verdict: "toxic",
  },
  "ice_whale:ice_whale": {
    emoji: "👑",
    label: "Ice Age",
    description:
      "Two whales in the same pool. Glacial patience. Immovable conviction. Inevitable domination.",
    verdict: "legendary",
  },
  "ice_whale:rug_necromancer": {
    emoji: "❄️",
    label: "Cold Fire",
    description:
      "One freezes and waits. One burns and returns. Opposites that earn each other's respect.",
    verdict: "great",
  },
  "ice_whale:diamond_cultist": {
    emoji: "🏰",
    label: "Diamond Fortress",
    description:
      "Maximum conviction. Absolutely unbreakable. Also absolutely unmoving. Forever.",
    verdict: "neutral",
  },
  "ice_whale:sniper_jester": {
    emoji: "🎯",
    label: "Precision Duo",
    description:
      "The sniper fires fast. The whale holds long. Complementary strategies. Actually thriving.",
    verdict: "legendary",
  },
  "ice_whale:ghost_bagholder": {
    emoji: "😶‍🌫️",
    label: "Frozen Grief",
    description:
      "One holds by conviction. One holds by inertia. Similar charts. Very different emotions.",
    verdict: "neutral",
  },
  "rug_necromancer:rug_necromancer": {
    emoji: "☠️",
    label: "Graveyard Party",
    description:
      "Two undead degens comparing rug stories over a dead token. More scars = more respect.",
    verdict: "great",
  },
  "rug_necromancer:diamond_cultist": {
    emoji: "💎",
    label: "Cult of the Undead",
    description:
      "Both refuse to admit defeat. Both rise from ruin. Darkly inspiring. Statistically improbable.",
    verdict: "great",
  },
  "rug_necromancer:sniper_jester": {
    emoji: "🎯",
    label: "Hit and Ghost",
    description:
      "The jester enters and exits in seconds. The necromancer survives whatever's left. Clean.",
    verdict: "neutral",
  },
  "rug_necromancer:ghost_bagholder": {
    emoji: "👻",
    label: "Ghost Resurrection",
    description:
      "One haunts dead tokens. One comes back from them. Maybe the ghost will too, someday.",
    verdict: "neutral",
  },
  "diamond_cultist:diamond_cultist": {
    emoji: "🙏",
    label: "Diamond Temple",
    description:
      "Two cultists reinforcing each other's delusion. The bags double. The faith never wavers.",
    verdict: "bad",
  },
  "diamond_cultist:sniper_jester": {
    emoji: "⚔️",
    label: "The Eternal Standoff",
    description:
      "One never sells. One always exits. Irreconcilable. Somehow still friends on CT.",
    verdict: "bad",
  },
  "diamond_cultist:ghost_bagholder": {
    emoji: "😭",
    label: "Bag Brothers",
    description:
      "Maximum holding. Minimum exits. Eternal conviction. Same chart. Same ending.",
    verdict: "toxic",
  },
  "sniper_jester:sniper_jester": {
    emoji: "⚡",
    label: "Double Headshot",
    description:
      "Both in and out before you noticed. Both profitable. Zero explanation. Lethal duo.",
    verdict: "legendary",
  },
  "sniper_jester:ghost_bagholder": {
    emoji: "🤔",
    label: "Speed vs. Stillness",
    description:
      "One moves at light speed. One doesn't move at all. They don't understand each other.",
    verdict: "bad",
  },
  "ghost_bagholder:ghost_bagholder": {
    emoji: "👻",
    label: "The Still Room",
    description:
      "Two ghosts in the same room. The bags grow heavier. Neither speaks. The chart is offline.",
    verdict: "toxic",
  },
};

const VERDICT_STYLES: Record<
  Compatibility["verdict"],
  { label: string; color: string; bg: string }
> = {
  legendary: { label: "Legendary Match", color: "#ffd700", bg: "#ffd70011" },
  great: { label: "Great Pair", color: "#00ff88", bg: "#00ff8811" },
  neutral: { label: "Neutral", color: "#00d4ff", bg: "#00d4ff11" },
  bad: { label: "Rough Combo", color: "#ff8800", bg: "#ff880011" },
  toxic: { label: "Toxic Pair 💀", color: "#ff3d3d", bg: "#ff3d3d11" },
};

const ARCHETYPES: ArchetypeId[] = [
  "mad_gambler",
  "ice_whale",
  "rug_necromancer",
  "diamond_cultist",
  "sniper_jester",
  "ghost_bagholder",
];

const ZODIAC_SYMBOLS: Record<ArchetypeId, string> = {
  mad_gambler: "🎰",
  ice_whale: "🐋",
  rug_necromancer: "☠️",
  diamond_cultist: "💎",
  sniper_jester: "🎯",
  ghost_bagholder: "👻",
};

function compatKey(a: ArchetypeId, b: ArchetypeId): string {
  // ensure canonical order (alphabetical)
  return [a, b].sort().join(":");
}

function getCompat(a: ArchetypeId, b: ArchetypeId): Compatibility {
  const key = compatKey(a, b);
  return (
    COMPAT[key] ?? {
      emoji: "❓",
      label: "Unknown",
      description: "The cosmos have not aligned on this pairing.",
      verdict: "neutral",
    }
  );
}

export default function ZodiacPage() {
  const [signA, setSignA] = useState<ArchetypeId>("mad_gambler");
  const [signB, setSignB] = useState<ArchetypeId>("ice_whale");
  const [revealed, setRevealed] = useState(false);

  const compat = getCompat(signA, signB);
  const verdictStyle = VERDICT_STYLES[compat.verdict];
  const colorA = ARCHETYPE_COLORS[signA] ?? "#9945ff";
  const colorB = ARCHETYPE_COLORS[signB] ?? "#9945ff";

  const handleReveal = () => setRevealed(true);

  const shareToX = () => {
    const nameA = ARCHETYPE_PROFILES[signA].name;
    const nameB = ARCHETYPE_PROFILES[signB].name;
    const text = encodeURIComponent(
      `${nameA} × ${nameB} = ${compat.emoji} ${compat.label}\n\n"${compat.description}"\n\nWhat's your Degen Sign? → degenborn.xyz/zodiac\n#DegenBorn #DegenZodiac @four_meme`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener"
    );
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
          ← Home
        </Link>
        <div className="text-center">
          <div className="text-xs text-[var(--neon-purple)] uppercase tracking-widest font-mono">
            Degen Zodiac
          </div>
          <div className="text-[10px] text-gray-700">What&apos;s your degen sign?</div>
        </div>
        <Link
          href="/quiz"
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Quiz →
        </Link>
      </div>

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          ♈ Degen{" "}
          <span className="text-[var(--neon-purple)]">Zodiac</span>
        </h1>
        <p className="text-sm text-gray-500">
          6 degen signs. 36 compatibility combos. Powered by Four.meme trade data.
        </p>
      </div>

      {/* Sign selector */}
      <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Sign A */}
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 text-center">
              Your Sign
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ARCHETYPES.map((arch) => {
                const c = ARCHETYPE_COLORS[arch] ?? "#9945ff";
                const isSelected = signA === arch;
                return (
                  <button
                    key={arch}
                    onClick={() => { setSignA(arch); setRevealed(false); }}
                    className="flex flex-col items-center p-2 rounded-xl text-center transition-all hover:scale-105"
                    style={{
                      background: isSelected ? `${c}22` : "transparent",
                      border: `1px solid ${isSelected ? c : c + "33"}`,
                    }}
                  >
                    <div className="text-xl mb-0.5">{ZODIAC_SYMBOLS[arch]}</div>
                    <div
                      className="text-[9px] font-black leading-tight"
                      style={{ color: isSelected ? c : "#666" }}
                    >
                      {ARCHETYPE_PROFILES[arch].name.split(" ").join("\n")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign B */}
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 text-center">
              Their Sign
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ARCHETYPES.map((arch) => {
                const c = ARCHETYPE_COLORS[arch] ?? "#9945ff";
                const isSelected = signB === arch;
                return (
                  <button
                    key={arch}
                    onClick={() => { setSignB(arch); setRevealed(false); }}
                    className="flex flex-col items-center p-2 rounded-xl text-center transition-all hover:scale-105"
                    style={{
                      background: isSelected ? `${c}22` : "transparent",
                      border: `1px solid ${isSelected ? c : c + "33"}`,
                    }}
                  >
                    <div className="text-xl mb-0.5">{ZODIAC_SYMBOLS[arch]}</div>
                    <div
                      className="text-[9px] font-black leading-tight"
                      style={{ color: isSelected ? c : "#666" }}
                    >
                      {ARCHETYPE_PROFILES[arch].name.split(" ").join("\n")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected pair preview */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: `${colorA}22`, color: colorA, border: `1px solid ${colorA}55` }}
          >
            {ZODIAC_SYMBOLS[signA]} {ARCHETYPE_PROFILES[signA].name}
          </div>
          <div className="text-gray-600 font-mono">×</div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: `${colorB}22`, color: colorB, border: `1px solid ${colorB}55` }}
          >
            {ZODIAC_SYMBOLS[signB]} {ARCHETYPE_PROFILES[signB].name}
          </div>
        </div>

        <button
          onClick={handleReveal}
          className="mt-4 w-full py-3 font-black text-sm rounded-xl text-black hover:brightness-110 transition-all"
          style={{ background: "var(--neon-purple)" }}
        >
          ✨ Check Compatibility
        </button>
      </div>

      {/* Result card */}
      {revealed && (
        <div
          className="rounded-2xl border-2 p-6 mb-6 animate-fade-in"
          style={{
            borderColor: verdictStyle.color,
            background: verdictStyle.bg,
          }}
        >
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{compat.emoji}</div>
            <div
              className="text-xl font-black mb-1"
              style={{ color: verdictStyle.color }}
            >
              {compat.label}
            </div>
            <div
              className="text-xs font-black px-3 py-1 rounded-full inline-block mb-4"
              style={{
                background: `${verdictStyle.color}22`,
                color: verdictStyle.color,
                border: `1px solid ${verdictStyle.color}55`,
              }}
            >
              {verdictStyle.label}
            </div>
          </div>

          <div className="bg-[#0a0a0f] rounded-xl p-4 mb-5">
            <p className="text-sm text-gray-300 text-center italic leading-relaxed">
              &ldquo;{compat.description}&rdquo;
            </p>
          </div>

          <button
            onClick={shareToX}
            className="w-full py-3 font-black text-sm rounded-xl text-black hover:brightness-110 transition-all"
            style={{ background: verdictStyle.color }}
          >
            𝕏 Share Compatibility
          </button>
        </div>
      )}

      {/* Full matrix (collapsed reference) */}
      <details className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl overflow-hidden">
        <summary className="p-4 text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors uppercase tracking-widest">
          View Full Compatibility Matrix (6×6)
        </summary>
        <div className="p-4 overflow-x-auto">
          {/* Header row */}
          <div className="grid gap-px text-[8px]" style={{ gridTemplateColumns: `40px repeat(6, 1fr)` }}>
            <div />
            {ARCHETYPES.map((arch) => (
              <div
                key={arch}
                className="text-center p-1 font-black"
                style={{ color: ARCHETYPE_COLORS[arch] ?? "#9945ff" }}
              >
                {ZODIAC_SYMBOLS[arch]}
              </div>
            ))}
            {ARCHETYPES.map((rowArch) => (
              <>
                <div
                  key={`row-${rowArch}`}
                  className="flex items-center justify-center p-1 font-black text-[8px]"
                  style={{ color: ARCHETYPE_COLORS[rowArch] ?? "#9945ff" }}
                >
                  {ZODIAC_SYMBOLS[rowArch]}
                </div>
                {ARCHETYPES.map((colArch) => {
                  const c = getCompat(rowArch, colArch);
                  return (
                    <button
                      key={`${rowArch}-${colArch}`}
                      onClick={() => {
                        setSignA(rowArch);
                        setSignB(colArch);
                        setRevealed(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="aspect-square flex items-center justify-center text-base hover:scale-125 transition-transform"
                      title={c.label}
                    >
                      {c.emoji}
                    </button>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </details>

      <div className="text-center mt-6 text-[10px] text-gray-700">
        Powered by Four.meme trade data · DegenBorn · BNB Smart Chain
      </div>
    </div>
  );
}
