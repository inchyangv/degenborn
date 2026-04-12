"use client";

/**
 * T-COL-03 — Sticker Pack (P2)
 *
 * 6 archetypes × 6 sticker expressions each = 36 stickers total.
 * SVG-based, copy to clipboard, download PNG.
 * No complex image generation — pure CSS/SVG.
 */

import { useState } from "react";
import Link from "next/link";
import type { ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";

interface StickerDef {
  id: string;
  archetype: ArchetypeId;
  expression: string;
  emoji: string;
  text: string;
}

// 6 expressions per archetype
const STICKERS: StickerDef[] = [
  // Mad Gambler
  { id: "mg-1", archetype: "mad_gambler", expression: "greed", emoji: "🎰", text: "Send it" },
  { id: "mg-2", archetype: "mad_gambler", expression: "rekt", emoji: "💸", text: "Rekt again" },
  { id: "mg-3", archetype: "mad_gambler", expression: "entry", emoji: "⚡", text: "APE IN" },
  { id: "mg-4", archetype: "mad_gambler", expression: "recovery", emoji: "🔥", text: "Back so fast" },
  { id: "mg-5", archetype: "mad_gambler", expression: "cope", emoji: "🧠", text: "Galaxy brain" },
  { id: "mg-6", archetype: "mad_gambler", expression: "exit", emoji: "💨", text: "ngmi, next" },

  // Ice Whale
  { id: "iw-1", archetype: "ice_whale", expression: "patience", emoji: "🧊", text: "I wait" },
  { id: "iw-2", archetype: "ice_whale", expression: "entry", emoji: "🐋", text: "Accumulating" },
  { id: "iw-3", archetype: "ice_whale", expression: "exit", emoji: "👑", text: "I sold the top" },
  { id: "iw-4", archetype: "ice_whale", expression: "observation", emoji: "🔭", text: "Still watching" },
  { id: "iw-5", archetype: "ice_whale", expression: "scorn", emoji: "❄️", text: "Paper hands" },
  { id: "iw-6", archetype: "ice_whale", expression: "approval", emoji: "✅", text: "Thesis intact" },

  // Rug Necromancer
  { id: "rn-1", archetype: "rug_necromancer", expression: "rug", emoji: "☠️", text: "Death is a dip" },
  { id: "rn-2", archetype: "rug_necromancer", expression: "revival", emoji: "⚡", text: "I'm back" },
  { id: "rn-3", archetype: "rug_necromancer", expression: "scar", emoji: "🩹", text: "Receipt" },
  { id: "rn-4", archetype: "rug_necromancer", expression: "chaos", emoji: "🧟", text: "Undead" },
  { id: "rn-5", archetype: "rug_necromancer", expression: "revenge", emoji: "⚔️", text: "Revenge trade" },
  { id: "rn-6", archetype: "rug_necromancer", expression: "dark", emoji: "🌑", text: "The dark is mine" },

  // Diamond Cultist
  { id: "dc-1", archetype: "diamond_cultist", expression: "hold", emoji: "💎", text: "Never selling" },
  { id: "dc-2", archetype: "diamond_cultist", expression: "prayer", emoji: "🙏", text: "It recovers" },
  { id: "dc-3", archetype: "diamond_cultist", expression: "conviction", emoji: "⛪", text: "The thesis" },
  { id: "dc-4", archetype: "diamond_cultist", expression: "bag", emoji: "🎒", text: "Heavy but holy" },
  { id: "dc-5", archetype: "diamond_cultist", expression: "scorn", emoji: "😑", text: "You sold?" },
  { id: "dc-6", archetype: "diamond_cultist", expression: "wait", emoji: "⏳", text: "Still holding" },

  // Sniper Jester
  { id: "sj-1", archetype: "sniper_jester", expression: "win", emoji: "🎯", text: "Count it" },
  { id: "sj-2", archetype: "sniper_jester", expression: "taunt", emoji: "😂", text: "Too slow" },
  { id: "sj-3", archetype: "sniper_jester", expression: "exit", emoji: "🚀", text: "In and out" },
  { id: "sj-4", archetype: "sniper_jester", expression: "flex", emoji: "💰", text: "Profit. Next." },
  { id: "sj-5", archetype: "sniper_jester", expression: "smug", emoji: "😏", text: "I knew" },
  { id: "sj-6", archetype: "sniper_jester", expression: "speed", emoji: "⚡", text: "Already gone" },

  // Ghost Bagholder
  { id: "gb-1", archetype: "ghost_bagholder", expression: "wait", emoji: "👻", text: "Still here" },
  { id: "gb-2", archetype: "ghost_bagholder", expression: "bag", emoji: "🎒", text: "The bag weighs" },
  { id: "gb-3", archetype: "ghost_bagholder", expression: "cope", emoji: "💀", text: "Any day now" },
  { id: "gb-4", archetype: "ghost_bagholder", expression: "quiet", emoji: "😶", text: "..." },
  { id: "gb-5", archetype: "ghost_bagholder", expression: "hope", emoji: "🕯️", text: "Dev will return" },
  { id: "gb-6", archetype: "ghost_bagholder", expression: "denial", emoji: "🙈", text: "Not looking" },
];

const ARCHETYPES: ArchetypeId[] = [
  "mad_gambler", "ice_whale", "rug_necromancer",
  "diamond_cultist", "sniper_jester", "ghost_bagholder",
];

function StickerCard({ sticker }: { sticker: StickerDef }) {
  const color = ARCHETYPE_COLORS[sticker.archetype] ?? "#9945ff";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${sticker.emoji} "${sticker.text}" — ${ARCHETYPE_PROFILES[sticker.archetype].name} · DegenBorn`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy: "${sticker.text}"`}
      className="group relative flex flex-col items-center justify-center rounded-2xl p-3 aspect-square transition-all hover:scale-105 active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: `1px solid ${color}44`,
      }}
    >
      <div className="text-3xl mb-1.5">{sticker.emoji}</div>
      <div className="text-[10px] font-black text-center leading-tight" style={{ color }}>
        {sticker.text}
      </div>
      {copied && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl text-xs font-black"
          style={{ background: `${color}cc`, color: "#000" }}
        >
          Copied!
        </div>
      )}
    </button>
  );
}

export default function StickersPage() {
  const [activeArchetype, setActiveArchetype] = useState<ArchetypeId>("mad_gambler");

  const filtered = STICKERS.filter((s) => s.archetype === activeArchetype);
  const color = ARCHETYPE_COLORS[activeArchetype] ?? "#9945ff";

  return (
    <div className="min-h-screen pb-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between py-4 mb-4 border-b border-[var(--degen-border)]">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          <div className="text-xs font-mono text-[var(--neon-purple)] uppercase tracking-widest">Sticker Pack</div>
          <Link href="/studio" className="text-xs text-gray-600 hover:text-gray-400">Meme Studio →</Link>
        </div>

        <div className="text-xs text-gray-600 text-center mb-5">
          6 archetypes × 6 expressions. Click any sticker to copy.
        </div>

        {/* Archetype tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 justify-center flex-wrap">
          {ARCHETYPES.map((arch) => {
            const c = ARCHETYPE_COLORS[arch] ?? "#9945ff";
            return (
              <button
                key={arch}
                onClick={() => setActiveArchetype(arch)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-black rounded-full transition-all"
                style={{
                  background: arch === activeArchetype ? c : `${c}11`,
                  color: arch === activeArchetype ? "#000" : c,
                  border: `1px solid ${c}55`,
                }}
              >
                {ARCHETYPE_PROFILES[arch].name}
              </button>
            );
          })}
        </div>

        {/* Archetype header */}
        <div className="text-center mb-5">
          <div className="text-lg font-black" style={{ color }}>
            {ARCHETYPE_PROFILES[activeArchetype].name}
          </div>
          <div className="text-xs text-gray-500 italic">
            &ldquo;{ARCHETYPE_PROFILES[activeArchetype].tagline}&rdquo;
          </div>
        </div>

        {/* Sticker grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {filtered.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} />
          ))}
        </div>

        <div className="text-center text-xs text-gray-700">
          Click a sticker to copy its text to clipboard. Use anywhere.
        </div>
      </div>
    </div>
  );
}
