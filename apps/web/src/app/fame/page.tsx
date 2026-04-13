"use client";

/**
 * T4-04 — Hall of Fame
 *
 * Level 7+, Prestige 70+, Crown 3+ → gold cards.
 * Top performers across Four.meme history.
 */

import Link from "next/link";
import type { ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";
import type { CharacterState } from "@degenborn/shared";

interface FameEntry {
  wallet: string;
  wallet_short: string;
  archetype: ArchetypeId;
  level: number;
  crown_count: number;
  prestige: number;
  survival_streak: number;
  reason: string;
  tagline: string;
}

const HALL_OF_FAME: FameEntry[] = [
  {
    wallet: "0xicewhale000000000000000000000000000000001",
    wallet_short: "0xiceW...0001",
    archetype: "ice_whale",
    level: 9,
    crown_count: 5,
    prestige: 91,
    survival_streak: 4,
    reason: "Held through 3 bear markets. Exited at ATH each time.",
    tagline: "Patience incarnate.",
  },
  {
    wallet: "0xsniperjester000000000000000000000000001",
    wallet_short: "0xsniJ...0001",
    archetype: "sniper_jester",
    level: 8,
    crown_count: 4,
    prestige: 82,
    survival_streak: 6,
    reason: "12-trade win streak. Average hold time: 8 minutes.",
    tagline: "In and out. Always green.",
  },
  {
    wallet: "0xrugnecromancer000000000000000000000000001",
    wallet_short: "0xrugN...0001",
    archetype: "rug_necromancer",
    level: 7,
    crown_count: 3,
    prestige: 74,
    survival_streak: 5,
    reason: "Survived 5 consecutive rugs. Came back profitable after each.",
    tagline: "Death is just a dip.",
  },
  {
    wallet: "0xdiamond0cultist00000000000000000000000001",
    wallet_short: "0xdiaC...0001",
    archetype: "diamond_cultist",
    level: 7,
    crown_count: 3,
    prestige: 70,
    survival_streak: 2,
    reason: "Held $DIAMONDHAND for 147 days. Token 40x'd.",
    tagline: "The thesis was always right.",
  },
];

export default function FamePage() {
  const shareToX = () => {
    const text = encodeURIComponent(
      `DegenBorn Hall of Fame 👑\n\nThe greatest Four.meme traders, immortalized.\n\nThink you belong here? → degenborn.xyz/fame\n#DegenBorn @four_meme`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener"
    );
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#ffd70033]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
          ← Home
        </Link>
        <div className="text-xs text-[#ffd700] font-mono uppercase tracking-widest">
          Hall of Fame
        </div>
        <Link
          href="/shame"
          className="text-xs text-gray-600 hover:text-[var(--neon-red)] transition-colors"
        >
          Wall of Shame →
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">👑</div>
          <h1 className="text-3xl font-black text-[#ffd700] mb-2">Hall of Fame</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Level 7+. Prestige 70+. Three or more crowns. These traders transcended the
            noise and became legend.
          </p>
          <div className="mt-3 flex justify-center gap-6 text-[10px] font-mono text-gray-700">
            <span>👑 Min: Level 7</span>
            <span>✨ Min: Prestige 70</span>
            <span>🏆 Min: 3 Crowns</span>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-10">
          {HALL_OF_FAME.map((entry, rank) => {
            const color = ARCHETYPE_COLORS[entry.archetype] ?? "#9945ff";
            const profile = ARCHETYPE_PROFILES[entry.archetype];
            const state: CharacterState = {
              wallet_address: entry.wallet,
              archetype: entry.archetype,
              level: entry.level,
              mood: "euphoria" as const,
              corruption: 0,
              prestige: entry.prestige,
              scar_count: 0,
              crown_count: entry.crown_count,
              survival_streak: entry.survival_streak,
              active_traits: ["crown", "gold_chain", "royal_cloak"],
              updated_at: 0,
            };

            return (
              <div
                key={entry.wallet}
                className="rounded-2xl border-2 p-5 flex gap-4 items-center"
                style={{
                  borderColor: "#ffd700",
                  background: "linear-gradient(135deg, #ffd70008 0%, #0a0a0f 100%)",
                  boxShadow: "0 0 30px #ffd70020",
                }}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 text-center">
                  <div className="text-2xl font-black text-[#ffd700]">
                    {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`}
                  </div>
                </div>

                {/* Character */}
                <div className="flex-shrink-0">
                  <CharacterDisplay
                    archetype={entry.archetype}
                    state={state}
                    wallet={entry.wallet}
                    size={72}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="font-black text-white text-sm">{profile.name}</div>
                    <div className="text-[10px] font-mono text-gray-600">{entry.wallet_short}</div>
                  </div>
                  <div className="flex gap-3 text-[10px] font-mono mb-2">
                    <span style={{ color: "#ffd700" }}>Lv.{entry.level}</span>
                    <span style={{ color }}>Prestige {entry.prestige}</span>
                    <span className="text-white">{"👑".repeat(Math.min(entry.crown_count, 5))}</span>
                    {entry.survival_streak > 0 && (
                      <span className="text-[var(--neon-green)]">
                        Streak ×{entry.survival_streak}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 italic mb-1 leading-relaxed">
                    {entry.reason}
                  </div>
                  <div className="text-[10px] font-black" style={{ color }}>
                    &ldquo;{entry.tagline}&rdquo;
                  </div>
                </div>

                {/* View */}
                <div className="flex-shrink-0">
                  <Link
                    href={`/monster?wallet=${entry.wallet}`}
                    className="px-3 py-1.5 text-[10px] font-black rounded-lg transition-all hover:brightness-110"
                    style={{
                      background: "#ffd70011",
                      color: "#ffd700",
                      border: "1px solid #ffd70044",
                    }}
                  >
                    Soul Room →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Share CTA */}
        <div className="text-center mb-8">
          <button
            onClick={shareToX}
            className="px-6 py-3 font-black text-sm rounded-xl text-black hover:brightness-110 transition-all"
            style={{ background: "#ffd700" }}
          >
            𝕏 Share Hall of Fame
          </button>
        </div>

        {/* Cross-link */}
        <div
          className="rounded-xl p-4 border text-center"
          style={{ borderColor: "#ff3d3d44", background: "#ff3d3d08" }}
        >
          <div className="text-sm text-gray-400 mb-2">
            Didn&apos;t make the cut? Check the other side.
          </div>
          <Link
            href="/shame"
            className="text-sm font-black hover:brightness-125 transition-all"
            style={{ color: "#ff3d3d" }}
          >
            → Wall of Shame 💀
          </Link>
        </div>

        <div className="text-center mt-6 text-[10px] text-gray-800">
          Criteria: Level 7+ · Prestige 70+ · Crown Count 3+ · Powered by Four.meme
        </div>
      </div>
    </div>
  );
}
