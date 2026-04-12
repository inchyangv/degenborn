"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ArchetypeId, CharacterState, PersonaDNA } from "@degenborn/shared";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";

interface GalleryProfile {
  wallet_address: string;
  wallet_short: string;
  archetype: ArchetypeId;
  dna: PersonaDNA;
  last_scored_at: number;
  is_fixture: boolean;
}

const DNA_COLORS: Record<string, string> = {
  aggression: "#ff3d3d",
  conviction: "#00d4ff",
  chaos: "#9945ff",
  luck: "#ffd700",
  survival: "#00ff88",
};

const ARCHETYPE_FILTERS: ArchetypeId[] = [
  "mad_gambler",
  "ice_whale",
  "rug_necromancer",
  "diamond_cultist",
  "sniper_jester",
  "ghost_bagholder",
];

const SORT_OPTIONS = ["level", "traits", "random"] as const;
type SortOption = typeof SORT_OPTIONS[number];

export default function GalleryPage() {
  const [profiles, setProfiles] = useState<GalleryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ArchetypeId | "all">("all");
  const [sort, setSort] = useState<SortOption>("level");
  const [fromStore, setFromStore] = useState(false);

  useEffect(() => {
    fetch("/api/profiles?limit=30")
      .then((r) => r.json())
      .then((data: { profiles: GalleryProfile[]; from_store: boolean }) => {
        setProfiles(data.profiles ?? []);
        setFromStore(data.from_store ?? false);
      })
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (filter === "all" ? profiles : profiles.filter((p) => p.archetype === filter)).slice().sort((a, b) => {
    if (sort === "level") return (b.last_scored_at) - (a.last_scored_at);
    if (sort === "traits") return a.archetype.localeCompare(b.archetype);
    return Math.random() - 0.5;
  });

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <h1 className="text-2xl font-black text-white">Monster Gallery</h1>
        <div className="text-xs text-gray-600">
          {fromStore ? `${profiles.length} souls` : "Demo souls"}
        </div>
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
            {s === "level" ? "Most Recent" : s === "traits" ? "By Archetype" : "Random"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <GalleryCard key={p.wallet_address} profile={p} />
          ))}
          {/* "Want your own?" CTA card */}
          <Link
            href="/"
            className="bg-[var(--degen-card)] border border-dashed border-[var(--degen-border)] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 gap-3 hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] transition-all group min-h-[300px]"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">+</div>
            <div className="text-sm text-center text-gray-600 group-hover:text-[var(--neon-green)] transition-colors">
              Want your own?<br />Connect wallet to start.
            </div>
          </Link>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-600 py-16 text-sm">
          No {filter.replace(/_/g, " ")} entries yet.
        </div>
      )}

      <div className="mt-8 text-center text-xs text-gray-700">
        Community gallery · Four.meme Hackathon
        {!fromStore && <span className="ml-2 text-gray-800">· demo souls</span>}
      </div>
    </div>
  );
}

function GalleryCard({ profile }: { profile: GalleryProfile }) {
  const { wallet_address, wallet_short, archetype, dna } = profile;
  const profileInfo = ARCHETYPE_PROFILES[archetype as ArchetypeId];
  const color = ARCHETYPE_COLORS[archetype as ArchetypeId] ?? "#ffffff";

  const dummyState: Partial<CharacterState> = {
    level: 1,
    mood: "neutral",
    corruption: Math.round(dna.chaos * 0.4),
    prestige: Math.round(dna.luck * 0.5),
    scar_count: dna.survival < 40 ? 2 : 0,
    crown_count: dna.luck > 70 ? 1 : 0,
    survival_streak: dna.survival > 70 ? 2 : 0,
    active_traits: [],
  };

  return (
    <div
      className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl overflow-hidden hover:border-opacity-80 transition-all hover:scale-[1.02]"
      style={{ borderColor: `${color}33` }}
    >
      <div
        className="relative flex items-center justify-center py-4"
        style={{ background: `radial-gradient(circle at 50% 60%, ${color}22, #0a0a0f)` }}
      >
        <CharacterDisplay
          archetype={archetype as ArchetypeId}
          state={dummyState as CharacterState}
          wallet={wallet_address}
          size={140}
          showTraitBadges={false}
        />
      </div>

      <div className="p-3">
        <div className="text-xs text-gray-600 font-mono mb-0.5">{wallet_short}</div>
        <h3 className="font-black text-white text-sm mb-0.5">{profileInfo?.name ?? archetype}</h3>
        <div className="text-xs font-mono mb-2 truncate" style={{ color }}>
          "{profileInfo?.tagline}"
        </div>

        <div className="space-y-1 mb-2">
          {(Object.entries(dna) as [string, number][]).slice(0, 5).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-gray-600 text-[10px] w-5 font-mono uppercase">{key.slice(0, 3)}</span>
              <div className="flex-1 h-1 bg-[var(--degen-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${value}%`, backgroundColor: DNA_COLORS[key] }}
                />
              </div>
              <span className="text-gray-500 text-[10px] w-5 text-right font-mono">{Math.round(value)}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/monster?wallet=${wallet_address}`}
          className="mt-2 block text-center py-2 text-sm font-bold border rounded-lg transition-colors hover:brightness-125"
          style={{ borderColor: `${color}44`, color }}
        >
          View Monster →
        </Link>
      </div>
    </div>
  );
}
