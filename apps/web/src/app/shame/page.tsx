"use client";

/**
 * T4-04 — Wall of Shame
 *
 * Corruption 80+, 5+ Scars, Ghost mood → red cards.
 * "Being rekt is also an achievement" — reverse prestige.
 */

import { useState } from "react";
import Link from "next/link";
import type { ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";
import type { CharacterState } from "@degenborn/shared";

interface ShameEntry {
  wallet: string;
  wallet_short: string;
  archetype: ArchetypeId;
  level: number;
  scar_count: number;
  corruption: number;
  reason: string;
  achievement: string;
}

const WALL_OF_SHAME: ShameEntry[] = [
  {
    wallet: "0xghostbagholder00000000000000000000000001",
    wallet_short: "0xghst...0001",
    archetype: "ghost_bagholder",
    level: 2,
    scar_count: 7,
    corruption: 95,
    reason: "Held $DEADCOIN through 14 successive ATHs of other tokens. Never sold anything.",
    achievement: "🏆 Ultimate Bagholder of Q1 2024",
  },
  {
    wallet: "0xdiamond0cultist00000000000000000000000002",
    wallet_short: "0xdiaC...0002",
    archetype: "diamond_cultist",
    level: 3,
    scar_count: 6,
    corruption: 88,
    reason: "Doubled down 5 consecutive times on the same rug. Never sold. Still holding.",
    achievement: "🎖️ Conviction Hall of Pain",
  },
  {
    wallet: "0xmadgambler0000000000000000000000000000002",
    wallet_short: "0xmadG...0002",
    archetype: "mad_gambler",
    level: 2,
    scar_count: 9,
    corruption: 85,
    reason: "Went all-in 9 times in 24 hours. Lost on 8 of them. Re-entered the 9th.",
    achievement: "⚡ Most Active Loser, 24h Record",
  },
  {
    wallet: "0xrugnecromancer000000000000000000000000002",
    wallet_short: "0xrugN...0002",
    archetype: "rug_necromancer",
    level: 4,
    scar_count: 11,
    corruption: 82,
    reason: "Found 11 separate rug pulls in one month. Held through every single one.",
    achievement: "☠️ Rug Magnet, Undefeated",
  },
  {
    wallet: "0xflatlineddemo00000000000000000000000002",
    wallet_short: "0xflat...0002",
    archetype: "diamond_cultist",
    level: 5,
    scar_count: 6,
    corruption: 90,
    reason: "Held $RUGPULL2X for 83 days. Portfolio peaked at +240%. Sold at -97%.",
    achievement: "💎 Diamond Hands Into Darkness",
  },
];

function ShameCard({ entry, rank }: { entry: ShameEntry; rank: number }) {
  const [roasted, setRoasted] = useState(false);
  const [roastCount, setRoastCount] = useState(Math.floor(Math.random() * 80) + 20);
  const color = ARCHETYPE_COLORS[entry.archetype] ?? "#9945ff";
  const profile = ARCHETYPE_PROFILES[entry.archetype];

  const state: CharacterState = {
    wallet_address: entry.wallet,
    archetype: entry.archetype,
    level: entry.level,
    mood: "ghost" as const,
    corruption: entry.corruption,
    prestige: 0,
    scar_count: entry.scar_count,
    crown_count: 0,
    survival_streak: 0,
    active_traits: ["zombie_eyes", "bandage", "scar"],
    updated_at: 0,
  };

  const handleRoast = () => {
    if (roasted) return;
    setRoastCount((c) => c + 1);
    setRoasted(true);
  };

  const shareToX = () => {
    const text = encodeURIComponent(
      `Wall of Shame nominee 💀\n\n${profile.name} · ${entry.corruption}% corrupted · ${entry.scar_count} scars\n\n"${entry.reason}"\n\nAchievement: ${entry.achievement}\n\nIs this you? → degenborn.xyz/shame\n#DegenBorn @four_meme`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener"
    );
  };

  return (
    <div
      className="rounded-2xl border-2 p-5 flex gap-4 items-start"
      style={{
        borderColor: "#ff3d3d",
        background: "linear-gradient(135deg, #ff3d3d08 0%, #0a0a0f 100%)",
        boxShadow: "0 0 20px #ff3d3d15",
      }}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-10 text-center pt-1">
        <div className="text-xl font-black text-[#ff3d3d]">#{rank + 1}</div>
      </div>

      {/* Character */}
      <div className="flex-shrink-0">
        <CharacterDisplay
          archetype={entry.archetype}
          state={state}
          wallet={entry.wallet}
          size={64}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <div className="font-black text-white text-sm">{profile.name}</div>
          <div className="text-[10px] font-mono text-gray-600">{entry.wallet_short}</div>
        </div>
        <div className="flex gap-3 text-[10px] font-mono mb-2">
          <span className="text-[#ff3d3d]">Corruption {entry.corruption}%</span>
          <span style={{ color }}>Lv.{entry.level}</span>
          <span className="text-gray-500">{"💀".repeat(Math.min(entry.scar_count, 5))} {entry.scar_count} scars</span>
        </div>
        <div className="text-xs text-gray-400 italic mb-2 leading-relaxed">
          {entry.reason}
        </div>
        <div
          className="text-[10px] font-black mb-3 px-2 py-1 rounded-lg inline-block"
          style={{ background: "#ff3d3d11", color: "#ff3d3d", border: "1px solid #ff3d3d44" }}
        >
          {entry.achievement}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRoast}
            className="px-3 py-1.5 text-[10px] font-black rounded-lg transition-all"
            style={{
              background: roasted ? "#ff3d3d22" : "#ff3d3d11",
              color: roasted ? "#ff3d3d" : "#666",
              border: `1px solid ${roasted ? "#ff3d3d55" : "#333"}`,
            }}
          >
            🔥 Roast {roastCount}
          </button>
          <button
            onClick={shareToX}
            className="px-3 py-1.5 text-[10px] font-black rounded-lg transition-all border border-gray-800 text-gray-600 hover:text-gray-400 hover:border-gray-600"
          >
            𝕏 Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShamePage() {
  const shareToX = () => {
    const text = encodeURIComponent(
      `DegenBorn Wall of Shame 💀\n\nThe most gloriously rekt Four.meme traders. Being rekt is also an achievement.\n\nDid you make the list? → degenborn.xyz/shame\n#DegenBorn @four_meme`
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
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#ff3d3d33]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
          ← Home
        </Link>
        <div className="text-xs text-[var(--neon-red)] font-mono uppercase tracking-widest">
          Wall of Shame
        </div>
        <Link
          href="/fame"
          className="text-xs text-gray-600 hover:text-[#ffd700] transition-colors"
        >
          Hall of Fame →
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">💀</div>
          <h1 className="text-3xl font-black text-[#ff3d3d] mb-2">Wall of Shame</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Corruption 80+. Five or more scars. Ghost mood. In meme culture,{" "}
            <span className="text-white font-black">being rekt is also an achievement.</span>
          </p>
          <div className="mt-3 flex justify-center gap-6 text-[10px] font-mono text-gray-700">
            <span>💀 Min: Corruption 80%</span>
            <span>🩹 Min: 5 Scars</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-xl p-3 mb-6 text-center text-xs text-gray-500 italic border border-gray-800"
        >
          "Every legend started as a warning. These wallets are both." — DegenBorn Academy
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-10">
          {WALL_OF_SHAME.map((entry, rank) => (
            <ShameCard key={entry.wallet} entry={entry} rank={rank} />
          ))}
        </div>

        {/* Share CTA */}
        <div className="text-center mb-8">
          <button
            onClick={shareToX}
            className="px-6 py-3 font-black text-sm rounded-xl text-white hover:brightness-110 transition-all"
            style={{ background: "#ff3d3d" }}
          >
            𝕏 Share Wall of Shame
          </button>
        </div>

        {/* Cross-link */}
        <div
          className="rounded-xl p-4 border text-center"
          style={{ borderColor: "#ffd70044", background: "#ffd70008" }}
        >
          <div className="text-sm text-gray-400 mb-2">
            Think you belong on the other side?
          </div>
          <Link
            href="/fame"
            className="text-sm font-black hover:brightness-125 transition-all"
            style={{ color: "#ffd700" }}
          >
            → Hall of Fame 👑
          </Link>
        </div>

        <div className="text-center mt-6 text-[10px] text-gray-800">
          Criteria: Corruption 80%+ · Scars 5+ · Ghost mood · Powered by Four.meme
        </div>
      </div>
    </div>
  );
}
