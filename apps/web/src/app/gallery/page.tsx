"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArchetypeId, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";

interface GalleryEntry {
  wallet_short: string;
  wallet: string;
  archetype: ArchetypeId;
  dna: { aggression: number; conviction: number; chaos: number; luck: number; survival: number };
  level: number;
  active_traits: string[];
  state: Partial<CharacterState>;
}

const GALLERY_SAMPLES: GalleryEntry[] = [
  {
    wallet_short: "0xmadG...0001",
    wallet: "0xmadgambler0000000000000000000000000000001",
    archetype: "mad_gambler",
    dna: { aggression: 85, conviction: 22, chaos: 72, luck: 48, survival: 30 },
    level: 3,
    active_traits: ["crown", "torn_clothes"],
    state: { level: 3, mood: "greed", corruption: 0, prestige: 10, scar_count: 1, crown_count: 1, survival_streak: 0, active_traits: ["crown", "torn_clothes"] },
  },
  {
    wallet_short: "0xrugN...0001",
    wallet: "0xrugnecromancer000000000000000000000000001",
    archetype: "rug_necromancer",
    dna: { aggression: 45, conviction: 38, chaos: 80, luck: 42, survival: 88 },
    level: 5,
    active_traits: ["zombie_eyes", "crown", "revenge_aura", "bandage"],
    state: { level: 5, mood: "revenge", corruption: 40, prestige: 15, scar_count: 2, crown_count: 1, survival_streak: 3, active_traits: ["zombie_eyes", "crown", "revenge_aura", "bandage"] },
  },
  {
    wallet_short: "0xiceW...0001",
    wallet: "0xicewhale000000000000000000000000000000001",
    archetype: "ice_whale",
    dna: { aggression: 12, conviction: 91, chaos: 8, luck: 85, survival: 70 },
    level: 7,
    active_traits: ["crown", "gold_chain", "royal_cloak", "gold_tooth"],
    state: { level: 7, mood: "neutral", corruption: 0, prestige: 75, scar_count: 0, crown_count: 3, survival_streak: 2, active_traits: ["crown", "gold_chain", "royal_cloak", "gold_tooth"] },
  },
  {
    wallet_short: "0xdiaC...0002",
    wallet: "0xdiamondcultist00000000000000000000000002",
    archetype: "diamond_cultist",
    dna: { aggression: 20, conviction: 88, chaos: 30, luck: 18, survival: 82 },
    level: 4,
    active_traits: ["bandage", "skull_ring", "torn_clothes"],
    state: { level: 4, mood: "neutral", corruption: 10, prestige: 5, scar_count: 3, crown_count: 0, survival_streak: 4, active_traits: ["bandage", "skull_ring", "torn_clothes"] },
  },
  {
    wallet_short: "0xsnpJ...0003",
    wallet: "0xsniperjester0000000000000000000000000003",
    archetype: "sniper_jester",
    dna: { aggression: 78, conviction: 15, chaos: 45, luck: 90, survival: 40 },
    level: 6,
    active_traits: ["crown", "gold_tooth", "skull_ring"],
    state: { level: 6, mood: "euphoria", corruption: 0, prestige: 50, scar_count: 0, crown_count: 2, survival_streak: 1, active_traits: ["crown", "gold_tooth", "skull_ring"] },
  },
  {
    wallet_short: "0xghsB...0004",
    wallet: "0xghostbagholder000000000000000000000000004",
    archetype: "ghost_bagholder",
    dna: { aggression: 10, conviction: 75, chaos: 60, luck: 22, survival: 15 },
    level: 2,
    active_traits: ["ghost_form", "tears", "bandage"],
    state: { level: 2, mood: "ghost", corruption: 25, prestige: 0, scar_count: 2, crown_count: 0, survival_streak: 0, active_traits: ["ghost_form", "tears", "bandage"] },
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

const SORT_OPTIONS = ["level", "traits", "random"] as const;
type SortOption = typeof SORT_OPTIONS[number];

export default function GalleryPage() {
  const [filter, setFilter] = useState<ArchetypeId | "all">("all");
  const [sort, setSort] = useState<SortOption>("level");

  const filtered = (filter === "all" ? GALLERY_SAMPLES : GALLERY_SAMPLES.filter((e) => e.archetype === filter))
    .slice()
    .sort((a, b) => {
      if (sort === "level") return b.level - a.level;
      if (sort === "traits") return b.active_traits.length - a.active_traits.length;
      return Math.random() - 0.5;
    });

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <h1 className="text-2xl font-black text-white">Monster Gallery</h1>
        <div className="text-xs text-gray-600">Vote in community</div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6 text-xs text-gray-600">
        <span>Sort:</span>
        {SORT_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`capitalize transition-colors ${sort === s ? "text-[var(--neon-green)]" : "hover:text-gray-400"}`}
          >
            {s === "level" ? "Highest Level" : s === "traits" ? "Most Traits" : "Random"}
          </button>
        ))}
      </div>

      {/* Grid — 2 cols mobile, 3 cols md */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((entry) => (
          <GalleryCard key={entry.wallet} entry={entry} />
        ))}
        {/* "Want your own?" CTA card */}
        <Link
          href="/"
          className="bg-[var(--degen-card)] border border-dashed border-[var(--degen-border)] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 gap-3 hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] transition-all group min-h-[300px]"
        >
          <div className="text-3xl group-hover:scale-110 transition-transform">+</div>
          <div className="text-xs text-center text-gray-600 group-hover:text-[var(--neon-green)] transition-colors">
            Want your own?<br />Connect wallet to start.
          </div>
        </Link>
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
  const color = ARCHETYPE_COLORS[entry.archetype] ?? "#ffffff";

  return (
    <div
      className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl overflow-hidden hover:border-opacity-80 transition-all hover:scale-[1.02]"
      style={{ borderColor: `${color}33` }}
    >
      {/* Character image area */}
      <div
        className="relative flex items-center justify-center py-4"
        style={{ background: `radial-gradient(circle at 50% 60%, ${color}22, #0a0a0f)` }}
      >
        <CharacterDisplay
          archetype={entry.archetype}
          state={entry.state as CharacterState}
          wallet={entry.wallet}
          size={140}
          showTraitBadges={false}
        />
        <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-xs font-mono text-yellow-400">
          Lv.{entry.level}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-xs text-gray-600 font-mono mb-0.5">{entry.wallet_short}</div>
        <h3 className="font-black text-white text-sm mb-0.5">{profile.name}</h3>
        <div className="text-xs font-mono mb-2 truncate" style={{ color }}>
          "{profile.tagline}"
        </div>

        {/* Mini DNA bars */}
        <div className="space-y-1 mb-2">
          {(Object.entries(entry.dna) as [string, number][]).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-gray-600 text-[10px] w-5 font-mono uppercase">{key.slice(0, 3)}</span>
              <div className="flex-1 h-1 bg-[var(--degen-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${value}%`, backgroundColor: DNA_COLORS[key] }}
                />
              </div>
              <span className="text-gray-500 text-[10px] w-5 text-right font-mono">{value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/monster?wallet=${entry.wallet}`}
          className="mt-2 block text-center py-1.5 text-xs border rounded-lg transition-colors"
          style={{ borderColor: `${color}44`, color }}
        >
          View Monster →
        </Link>
      </div>
    </div>
  );
}
