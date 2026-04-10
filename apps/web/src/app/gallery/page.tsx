"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";

interface GalleryEntry {
  wallet_short: string;
  wallet: string;
  archetype: ArchetypeId;
  dna: { aggression: number; conviction: number; chaos: number; luck: number; survival: number };
  level: number;
  active_traits: string[];
}

// Sample gallery data — combines 3 fixture wallets
const GALLERY_SAMPLES: GalleryEntry[] = [
  {
    wallet_short: "0xmadG...0001",
    wallet: "0xmadgambler0000000000000000000000000000001",
    archetype: "mad_gambler",
    dna: { aggression: 85, conviction: 22, chaos: 72, luck: 48, survival: 30 },
    level: 3,
    active_traits: ["crown", "torn_clothes"],
  },
  {
    wallet_short: "0xrugN...0001",
    wallet: "0xrugnecromancer000000000000000000000000001",
    archetype: "rug_necromancer",
    dna: { aggression: 45, conviction: 38, chaos: 80, luck: 42, survival: 88 },
    level: 5,
    active_traits: ["zombie_eyes", "crown", "revenge_aura", "bandage"],
  },
  {
    wallet_short: "0xiceW...0001",
    wallet: "0xicewhale000000000000000000000000000000001",
    archetype: "ice_whale",
    dna: { aggression: 12, conviction: 91, chaos: 8, luck: 85, survival: 70 },
    level: 7,
    active_traits: ["crown", "gold_chain", "royal_cloak", "gold_tooth"],
  },
];

const ARCHETYPE_FILTERS: ArchetypeId[] = [
  "mad_gambler",
  "ice_whale",
  "rug_necromancer",
  "diamond_cultist",
  "sniper_jester",
  "ghost_bagholder",
];

const DNA_COLORS: Record<string, string> = {
  aggression: "#ff3d3d",
  conviction: "#00d4ff",
  chaos: "#9945ff",
  luck: "#ffd700",
  survival: "#00ff88",
};

const TRAIT_EMOJI: Record<string, string> = {
  crown: "👑", gold_chain: "⛓️", bandage: "🩹", torn_clothes: "🧥",
  tears: "😢", gold_tooth: "🦷", scar: "⚔️", zombie_eyes: "🧟",
  revenge_aura: "🔥", royal_cloak: "🔱", ghost_form: "👻", skull_ring: "💀",
};

export default function GalleryPage() {
  const [filter, setFilter] = useState<ArchetypeId | "all">("all");
  const [entries, setEntries] = useState<GalleryEntry[]>(GALLERY_SAMPLES);

  const filtered = filter === "all"
    ? entries
    : entries.filter((e) => e.archetype === filter);

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <h1 className="text-2xl font-black text-white">Monster Gallery</h1>
        <div className="text-xs text-gray-600">Vote in community</div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors font-mono ${
            filter === "all"
              ? "border-[var(--neon-green)] text-[var(--neon-green)] bg-[var(--neon-green)]/10"
              : "border-[var(--degen-border)] text-gray-500 hover:border-gray-500"
          }`}
        >
          ALL
        </button>
        {ARCHETYPE_FILTERS.map((a) => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize font-mono ${
              filter === a
                ? "border-[var(--neon-purple)] text-[var(--neon-purple)] bg-[var(--neon-purple)]/10"
                : "border-[var(--degen-border)] text-gray-500 hover:border-gray-500"
            }`}
          >
            {ARCHETYPE_PROFILES[a].name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((entry) => (
          <GalleryCard key={entry.wallet} entry={entry} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-600 py-16 text-sm">
          No {filter.replace(/_/g, " ")} entries yet.
        </div>
      )}

      <div className="mt-8 text-center text-xs text-gray-700">
        Community gallery · Four.meme Hackathon demo
      </div>
    </div>
  );
}

function GalleryCard({ entry }: { entry: GalleryEntry }) {
  const profile = ARCHETYPE_PROFILES[entry.archetype];

  const archetypeColors: Record<ArchetypeId, string> = {
    mad_gambler: "#ff3d3d",
    ice_whale: "#00d4ff",
    rug_necromancer: "#9945ff",
    diamond_cultist: "#88ccff",
    sniper_jester: "#ffd700",
    ghost_bagholder: "#aaaaaa",
  };
  const color = archetypeColors[entry.archetype] ?? "#ffffff";

  return (
    <div
      className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl overflow-hidden hover:border-opacity-80 transition-all hover:scale-[1.02]"
      style={{ borderColor: `${color}33` }}
    >
      {/* Archetype image area */}
      <div
        className="relative h-40 flex items-center justify-center"
        style={{ background: `radial-gradient(circle at 50% 60%, ${color}22, #0a0a0f)` }}
      >
        <img
          src={`/archetypes/${entry.archetype}_placeholder.svg`}
          alt={profile.name}
          className="h-32 w-32 object-contain"
        />
        <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-xs font-mono text-yellow-400">
          Lv.{entry.level}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="text-xs text-gray-600 font-mono mb-0.5">{entry.wallet_short}</div>
        <h3 className="font-black text-white text-base mb-0.5">{profile.name}</h3>
        <div className="text-xs font-mono mb-3" style={{ color }}>
          "{profile.tagline}"
        </div>

        {/* Mini DNA bars */}
        <div className="space-y-1 mb-3">
          {(Object.entries(entry.dna) as [string, number][]).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs w-6 font-mono uppercase">{key.slice(0, 3)}</span>
              <div className="flex-1 h-1 bg-[var(--degen-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${value}%`, backgroundColor: DNA_COLORS[key] }}
                />
              </div>
              <span className="text-gray-500 text-xs w-5 text-right font-mono">{value}</span>
            </div>
          ))}
        </div>

        {/* Active traits */}
        {entry.active_traits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.active_traits.slice(0, 5).map((t) => (
              <span
                key={t}
                title={t.replace(/_/g, " ")}
                className="text-sm"
              >
                {TRAIT_EMOJI[t] ?? "✦"}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/monster?wallet=${entry.wallet}`}
          className="mt-3 block text-center py-2 text-xs border rounded-lg transition-colors"
          style={{ borderColor: `${color}44`, color }}
        >
          View Monster →
        </Link>
      </div>
    </div>
  );
}
