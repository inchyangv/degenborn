"use client";

/**
 * T4-03 — Graveyard (upgraded)
 *
 * - Ghost-state monsters auto-registered (corruption 80+ fixture)
 * - "Last Words" per tombstone
 * - "F to Pay Respects" button (in-memory counter)
 * - "Pour One Out" X share per soul
 * - Resurrected souls (survival_streak > 0) get gold border
 * - Epitaph line: "held $TOKEN for N days"
 */

import { useState } from "react";
import Link from "next/link";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";
import { formatDate } from "@/lib/flatline";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

interface FlatlinedSoul {
  wallet: string;
  archetype: ArchetypeId;
  name: string;
  title: string;
  lastActiveAt: number;
  level: number;
  scar_count: number;
  corruption: number;
  survival_streak: number;
  last_words: string;
  epitaph: string;
}

const now = Math.floor(Date.now() / 1000);

// Static fixture list — includes both Ghost-state (corruption 80+) and legacy
const FLATLINED_SOULS: FlatlinedSoul[] = [
  {
    wallet: DEMO_WALLETS.flatline_1,
    archetype: "ghost_bagholder",
    name: "Wraith",
    title: "the Still-Holding",
    lastActiveAt: now - 45 * 86400,
    level: 3,
    scar_count: 4,
    corruption: 85,
    survival_streak: 0,
    last_words: "It'll recover. I'm not selling.",
    epitaph: "Held $GHOSTCOIN for 127 days. Price: $0.000000.",
  },
  {
    wallet: DEMO_WALLETS.flatline_2,
    archetype: "diamond_cultist",
    name: "Krag",
    title: "the Unflinching",
    lastActiveAt: now - 62 * 86400,
    level: 5,
    scar_count: 6,
    corruption: 90,
    survival_streak: 0,
    last_words: "The thesis is intact. Just wait.",
    epitaph: "Held $RUGPULL2X for 83 days. Down 99.8%.",
  },
  {
    wallet: DEMO_WALLETS.flatline_3,
    archetype: "mad_gambler",
    name: "Vex",
    title: "the All-In",
    lastActiveAt: now - 38 * 86400,
    level: 2,
    scar_count: 2,
    corruption: 55,
    survival_streak: 0,
    last_words: "One more. Just one more.",
    epitaph: "Sent everything into $MOONSHOT. Dev wallet dumped in 4 minutes.",
  },
  {
    wallet: DEMO_WALLETS.flatline_4,
    archetype: "rug_necromancer",
    name: "Drex",
    title: "the Thrice-Rugged",
    lastActiveAt: now - 15 * 86400,
    level: 7,
    scar_count: 8,
    corruption: 70,
    survival_streak: 2,
    last_words: "I'll be back. I always come back.",
    epitaph: "Survived 3 rugs. Then went quiet. Probably buying again.",
  },
  {
    wallet: DEMO_WALLETS.flatline_5,
    archetype: "sniper_jester",
    name: "Mox",
    title: "the Missed Exit",
    lastActiveAt: now - 33 * 86400,
    level: 4,
    scar_count: 3,
    corruption: 60,
    survival_streak: 1,
    last_words: "I had the exit queued. Just one more green candle.",
    epitaph: "Held $PUMPIT48H for 51 hours past the optimal exit.",
  },
  {
    wallet: DEMO_WALLETS.flatline_6,
    archetype: "ice_whale",
    name: "Seryn",
    title: "the Frozen",
    lastActiveAt: now - 120 * 86400,
    level: 9,
    scar_count: 1,
    corruption: 80,
    survival_streak: 0,
    last_words: "I'm waiting for the right moment.",
    epitaph: "The right moment never came. Held $WHALE4EVER for 180 days.",
  },
  {
    wallet: DEMO_WALLETS.flatline_7,
    archetype: "ghost_bagholder",
    name: "Phasm",
    title: "the Invisible",
    lastActiveAt: now - 88 * 86400,
    level: 1,
    scar_count: 5,
    corruption: 95,
    survival_streak: 0,
    last_words: "...",
    epitaph: "Never spoke. Never sold. $SPECTRE3 is at $0. Still in the wallet.",
  },
  {
    wallet: DEMO_WALLETS.flatline_8,
    archetype: "rug_necromancer",
    name: "Zael",
    title: "the Resurrected",
    lastActiveAt: now - 8 * 86400,
    level: 6,
    scar_count: 7,
    corruption: 82,
    survival_streak: 3,
    last_words: "You can't kill what's already dead.",
    epitaph: "Rugged 3 times. Bought back each time. Currently: unaccounted for.",
  },
];

function daysSinceFlatline(lastActiveAt: number): number {
  return Math.round((Math.floor(Date.now() / 1000) - lastActiveAt) / 86400);
}

function GraveyardCard({ soul }: { soul: FlatlinedSoul }) {
  const [fCount, setFCount] = useState(Math.floor(Math.random() * 40) + 3);
  const [fPressed, setFPressed] = useState(false);

  const isResurrected = soul.survival_streak > 0;
  const isGhost = soul.corruption >= 80;
  const color = ARCHETYPE_COLORS[soul.archetype] ?? "#9945ff";
  const profile = ARCHETYPE_PROFILES[soul.archetype];
  const daysSince = daysSinceFlatline(soul.lastActiveAt);

  const handleF = () => {
    if (fPressed) return;
    setFCount((c) => c + 1);
    setFPressed(true);
  };

  const shareToX = () => {
    const text = encodeURIComponent(
      `R.I.P. ${soul.name} ${soul.title}\n"${soul.last_words}"\n\n${soul.epitaph}\n\nPour one out → degenborn.xyz/graveyard\n#DegenBorn @four_meme`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener"
    );
  };

  return (
    <div
      className="rounded-2xl p-4 border-2 transition-all"
      style={{
        background: isGhost
          ? `linear-gradient(160deg, ${color}0a 0%, #0a0a0f 100%)`
          : `linear-gradient(160deg, ${color}06 0%, #0a0a0f 100%)`,
        borderColor: isResurrected ? "#ffd700" : `${color}44`,
        boxShadow: isResurrected ? "0 0 20px #ffd70033" : undefined,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{isResurrected ? "✨" : "💀"}</div>
          {isResurrected && (
            <div className="text-[9px] font-black text-[#ffd700] uppercase tracking-widest">
              Resurrected
            </div>
          )}
          {isGhost && !isResurrected && (
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
              Ghost State
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-600 font-mono">{daysSince}d ago</div>
          <div className="text-[10px]" style={{ color: `${color}99` }}>
            Lv.{soul.level} · {soul.scar_count} scars
          </div>
        </div>
      </div>

      {/* Name + archetype */}
      <div className="mb-2">
        <div className="text-sm font-black text-white leading-tight">{soul.name}</div>
        <div className="text-[10px] text-gray-500 font-mono">{soul.title}</div>
      </div>
      <div
        className="text-[10px] font-mono uppercase tracking-wider mb-3"
        style={{ color }}
      >
        {profile.name}
      </div>

      {/* Epitaph */}
      <div className="text-[10px] text-gray-500 italic leading-relaxed mb-2 border-t border-gray-800 pt-2">
        R.I.P. — {soul.epitaph}
      </div>

      {/* Last words */}
      <div
        className="text-xs italic text-gray-400 mb-4 rounded-lg p-2"
        style={{ background: `${color}08`, borderLeft: `2px solid ${color}44` }}
      >
        &ldquo;{soul.last_words}&rdquo;
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* F to Pay Respects */}
        <button
          onClick={handleF}
          className="flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
          style={{
            background: fPressed ? `${color}33` : `${color}11`,
            color: fPressed ? color : "#666",
            border: `1px solid ${fPressed ? color + "66" : "#333"}`,
          }}
        >
          <span className="font-mono font-black">F</span>
          <span className="text-[10px]">{fCount}</span>
        </button>

        {/* Pour One Out */}
        <button
          onClick={shareToX}
          className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
          style={{
            background: "#1a1a2a",
            color: "#888",
            border: "1px solid #333",
          }}
        >
          🍺 Pour One Out
        </button>
      </div>

      {/* Eulogy link */}
      <Link
        href={`/eulogy/${soul.wallet}`}
        className="block mt-2 text-center text-[10px] font-mono transition-colors hover:text-gray-300"
        style={{ color: `${color}55` }}
      >
        Read eulogy →
      </Link>
    </div>
  );
}

export default function GraveyardPage() {
  const ghostCount = FLATLINED_SOULS.filter((s) => s.corruption >= 80).length;
  const resurrectedCount = FLATLINED_SOULS.filter((s) => s.survival_streak > 0).length;

  return (
    <div className="min-h-screen pb-12">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
          ← Home
        </Link>
        <div className="text-xs text-gray-600 font-mono uppercase tracking-widest">
          The Graveyard
        </div>
        <Link href="/gallery" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          Gallery →
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚰️</div>
          <h1 className="text-2xl font-black text-white mb-2">The Graveyard</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Wallets that have gone dark. 30+ days of silence. Their story lives on.
          </p>
          <div className="flex justify-center gap-4 mt-3 text-[10px] font-mono text-gray-700">
            <span>💀 {FLATLINED_SOULS.length} flatlined</span>
            <span>👻 {ghostCount} ghost state</span>
            <span className="text-[#ffd700]">✨ {resurrectedCount} resurrected</span>
          </div>
          <div className="mt-2 text-[10px] text-gray-800">
            Gold border = survival_streak &gt; 0. They came back.
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FLATLINED_SOULS.map((soul) => (
            <GraveyardCard key={soul.wallet} soul={soul} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-700 space-y-1">
          <div>Flatline declared after 30 days of inactivity on Four.meme.</div>
          <div>
            Ghost State = corruption 80+.{" "}
            <span className="text-[#ffd700]">Gold border = resurrection confirmed.</span>
          </div>
          <div className="pt-1 text-gray-800">
            Powered by Four.meme · DegenBorn
          </div>
        </div>
      </div>
    </div>
  );
}
