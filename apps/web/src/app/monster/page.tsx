"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState, MutationEvent, DiaryPage } from "@degenborn/shared";
import { TRAIT_DEFINITIONS, TRAIT_EMOJI, ARCHETYPE_COLORS } from "@degenborn/shared";
import DNAPanel from "@/components/DNAPanel";
import ShareCard from "@/components/ShareCard";
import CharacterDisplay from "@/components/CharacterDisplay";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

function relativeTime(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString();
}

const DIARY_ACCENT: Record<string, string> = {
  win_streak: "border-yellow-400",
  rug_exposure: "border-red-500",
  loss_recovery: "border-purple-400",
  major_win: "border-yellow-400",
  default: "border-gray-700",
};

function MonsterRoomContent() {
  const searchParams = useSearchParams();
  const wallet = searchParams.get("wallet") ?? "";

  const [data, setData] = useState<MonsterData | null>(null);
  const [diary, setDiary] = useState<MutationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "traits" | "diary" | "share">("stats");

  useEffect(() => {
    if (!wallet) return;

    const load = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, useFixture: true }),
        });
        const analyzed = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult };

        const { createInitialState } = await import("@/lib/state-machine");
        const state = createInitialState(wallet.toLowerCase(), analyzed.archetype.archetype as any);

        setData({ dna: analyzed.dna, archetype: analyzed.archetype, state });

        const diaryResp = await fetch(`/api/diary?wallet=${wallet.toLowerCase()}`);
        if (diaryResp.ok) {
          const page = await diaryResp.json() as DiaryPage;
          setDiary(page.entries);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [wallet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--neon-green)] text-sm font-mono animate-pulse">Loading Monster Room...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-400">Failed to load monster data</div>
        <Link href="/" className="text-gray-400 hover:text-white text-sm">← Back home</Link>
      </div>
    );
  }

  const { dna, archetype, state } = data;

  return (
    <div className="min-h-screen pb-12">
      {/* Global nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)] mb-0">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-xs text-gray-600 font-mono">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </div>
        <Link href="/gallery" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Gallery</Link>
      </div>

      {/* CHARACTER HERO — 70vh focal point */}
      <div
        className="flex flex-col items-center justify-center gap-4 py-10"
        style={{ minHeight: "50vh", background: `radial-gradient(circle at 50% 40%, ${archetypeGlow(archetype.archetype)}, transparent 70%)` }}
      >
        <CharacterDisplay
          archetype={archetype.archetype as any}
          state={state}
          wallet={wallet}
          size={360}
        />
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">{archetype.profile.name}</h1>
          <div className="text-[var(--neon-green)] text-sm font-mono">"{archetype.profile.tagline}"</div>
        </div>
        {diary.length > 0 && (
          <div className="text-4xl font-black text-[var(--neon-purple)] mt-1">
            {diary.length}
            <span className="text-sm font-mono text-gray-500 ml-2">mutations so far</span>
          </div>
        )}
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        {/* Soul Core card */}
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Soul Core</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 text-xs bg-[var(--degen-muted)] text-gray-300 rounded-full capitalize">
                  {state.mood}
                </span>
                {state.corruption > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-purple-900/30 text-purple-400 rounded-full">
                    Corruption {state.corruption}
                  </span>
                )}
                {state.prestige > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-900/30 text-yellow-400 rounded-full">
                    Prestige {state.prestige}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">Level</div>
              <div className="text-3xl font-black text-[var(--neon-gold)]">{state.level}</div>
            </div>
          </div>
        </div>

        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-1 mb-6 bg-[var(--degen-card)] p-1 rounded-lg border border-[var(--degen-border)] overflow-x-auto">
          {(["stats", "traits", "diary", "share"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex-1 min-w-[60px] py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-[var(--neon-purple)] text-black font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "stats" && <DNAPanel dna={dna} />}

        {activeTab === "traits" && (
          <div className="space-y-3">
            {state.active_traits.length === 0 ? (
              <div className="text-gray-600 text-sm text-center py-8">No traits yet. Keep trading.</div>
            ) : (
              state.active_traits.map((traitId) => {
                const def = TRAIT_DEFINITIONS[traitId];
                if (!def) return null;
                return (
                  <div
                    key={traitId}
                    className="flex items-center gap-3 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-lg px-4 py-3"
                  >
                    <div className="w-8 h-8 bg-[var(--degen-muted)] rounded flex items-center justify-center text-lg">
                      {traitEmoji(traitId)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{def.label}</div>
                      <div className="text-xs text-gray-500">{def.description}</div>
                    </div>
                    <div className="ml-auto text-xs text-gray-600 capitalize">{def.category}</div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "diary" && (
          <div className="space-y-3">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Mutation Diary</div>
            {diary.length === 0 ? (
              <div className="text-gray-600 text-sm text-center py-8">
                No mutations yet. Diary fills as you trade.
              </div>
            ) : (
              diary.map((entry) => {
                const accentClass = DIARY_ACCENT[entry.reason] ?? DIARY_ACCENT.default;
                return (
                  <div
                    key={entry.id}
                    className={`bg-[var(--degen-card)] border-l-4 ${accentClass} border-y border-r border-[var(--degen-border)] rounded-lg p-4`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-[var(--neon-purple)] uppercase">{entry.reason}</div>
                      <div className="text-xs text-gray-600" title={new Date(entry.timestamp * 1000).toLocaleString()}>
                        {relativeTime(entry.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 italic mb-2">"{entry.generated_caption}"</div>
                    {entry.trait_delta.added.length > 0 && (
                      <div className="text-xs text-[var(--neon-green)]">
                        +{entry.trait_delta.added.map((t) => TRAIT_DEFINITIONS[t]?.label ?? t).join(", ")}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "share" && (
          <ShareCard dna={dna} archetype={archetype} state={state} wallet={wallet} />
        )}
      </div>
    </div>
  );
}

function traitEmoji(traitId: string): string {
  return TRAIT_EMOJI[traitId as keyof typeof TRAIT_EMOJI] ?? "✦";
}

function archetypeGlow(archetype: string): string {
  const base = ARCHETYPE_COLORS[archetype as keyof typeof ARCHETYPE_COLORS] ?? "#9945ff";
  return `${base}22`;
}

export default function MonsterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <MonsterRoomContent />
    </Suspense>
  );
}
