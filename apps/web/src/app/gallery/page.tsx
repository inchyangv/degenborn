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

type LeaderboardMode = "recent" | "prestige" | "survival" | "rugged";

const LEADERBOARD_LABELS: Record<LeaderboardMode, { label: string; emoji: string; desc: string }> = {
  recent: { label: "Recent", emoji: "🕐", desc: "Most recently analyzed" },
  prestige: { label: "Hall of Fame", emoji: "👑", desc: "Highest prestige & luck" },
  survival: { label: "Survivors", emoji: "💪", desc: "Highest survival streak" },
  rugged: { label: "Most Rugged", emoji: "💀", desc: "Chaos + corruption kings" },
};

/** Derive a pseudo-prestige score from DNA for leaderboard sorting */
function prestigeScore(p: GalleryProfile): number {
  return Math.round(p.dna.luck * 0.5 + p.dna.survival * 0.3 + p.dna.conviction * 0.2);
}
function survivalScore(p: GalleryProfile): number {
  return Math.round(p.dna.survival * 0.6 + p.dna.conviction * 0.4);
}
function ruggedScore(p: GalleryProfile): number {
  return Math.round(p.dna.chaos * 0.5 + (100 - p.dna.luck) * 0.3 + p.dna.aggression * 0.2);
}

export default function GalleryPage() {
  const [profiles, setProfiles] = useState<GalleryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ArchetypeId | "all">("all");
  const [mode, setMode] = useState<LeaderboardMode>("recent");
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

  const filtered = (filter === "all" ? profiles : profiles.filter((p) => p.archetype === filter))
    .slice()
    .sort((a, b) => {
      if (mode === "prestige") return prestigeScore(b) - prestigeScore(a);
      if (mode === "survival") return survivalScore(b) - survivalScore(a);
      if (mode === "rugged") return ruggedScore(b) - ruggedScore(a);
      return b.last_scored_at - a.last_scored_at;
    });

  const lb = LEADERBOARD_LABELS[mode];

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Monster Gallery</h1>
          <div className="text-[10px] text-[var(--neon-green)] opacity-60 tracking-widest uppercase">Four.meme Trader Leaderboard</div>
        </div>
        <div className="text-xs text-gray-600">
          {fromStore ? `${profiles.length} souls` : "Demo souls"}
        </div>
      </div>

      {/* Leaderboard tabs */}
      <div className="flex gap-1.5 mb-4 bg-[var(--degen-card)] p-1 rounded-lg border border-[var(--degen-border)] overflow-x-auto">
        {(Object.entries(LEADERBOARD_LABELS) as [LeaderboardMode, typeof lb][]).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-shrink-0 flex-1 min-w-[80px] py-2 px-2 text-xs font-mono uppercase tracking-wide rounded-md transition-colors ${
              mode === key
                ? key === "rugged"
                  ? "bg-[var(--neon-red)] text-black font-bold"
                  : "bg-[var(--neon-gold)] text-black font-bold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {info.emoji} {info.label}
          </button>
        ))}
      </div>

      {/* Leaderboard description */}
      <div className="text-[10px] text-gray-600 mb-4 italic">{lb.desc}</div>

      {/* Archetype filter */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((p, rank) => (
            <GalleryCard key={p.wallet_address} profile={p} rank={rank + 1} mode={mode} />
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
        Community gallery · ⚡ Powered by Four.meme
        {!fromStore && <span className="ml-2 text-gray-800">· demo souls</span>}
      </div>
    </div>
  );
}

interface GalleryCardProps {
  profile: GalleryProfile;
  rank: number;
  mode: LeaderboardMode;
}

function GalleryCard({ profile, rank, mode }: GalleryCardProps) {
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

  // Score badge for current leaderboard mode
  const scoreLabel =
    mode === "prestige" ? `✨ ${prestigeScore(profile)} prestige`
    : mode === "survival" ? `💪 ${survivalScore(profile)} survival`
    : mode === "rugged" ? `💀 ${ruggedScore(profile)} rugged`
    : null;

  const rankColor = rank === 1 ? "#ffd700" : rank === 2 ? "#94a3b8" : rank === 3 ? "#92400e" : "#444";

  return (
    <div
      className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl overflow-hidden hover:border-opacity-80 transition-all hover:scale-[1.02]"
      style={{ borderColor: `${color}33` }}
    >
      <div
        className="relative flex items-center justify-center py-4"
        style={{ background: `radial-gradient(circle at 50% 60%, ${color}22, #0a0a0f)` }}
      >
        {/* Rank badge */}
        <div
          className="absolute top-2 left-2 text-xs font-black px-1.5 py-0.5 rounded font-mono"
          style={{ color: rankColor, background: "rgba(0,0,0,0.6)" }}
        >
          #{rank}
        </div>
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

        {/* Leaderboard score badge */}
        {scoreLabel && (
          <div
            className="text-[10px] font-bold mb-2 px-2 py-0.5 rounded-full inline-block border"
            style={{ color: mode === "rugged" ? "#ff3d3d" : "#ffd700", borderColor: mode === "rugged" ? "#ff3d3d44" : "#ffd70044", background: "rgba(0,0,0,0.3)" }}
          >
            {scoreLabel}
          </div>
        )}

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

        <div className="flex gap-1.5 mt-2">
          <Link
            href={`/monster?wallet=${wallet_address}`}
            className="flex-1 text-center py-1.5 text-xs font-bold border rounded-lg transition-colors hover:brightness-125"
            style={{ borderColor: `${color}44`, color }}
          >
            View →
          </Link>
          <Link
            href={`/challenge/${wallet_address}`}
            className="px-2 py-1.5 text-xs font-bold border border-[var(--neon-red)] text-[var(--neon-red)] rounded-lg hover:brightness-125 transition-colors"
            title="Challenge this monster"
          >
            ⚔
          </Link>
        </div>
      </div>
    </div>
  );
}
