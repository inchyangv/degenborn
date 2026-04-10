"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState, MutationEvent, DiaryPage } from "@degenborn/shared";
import { TRAIT_DEFINITIONS } from "@degenborn/shared";
import DNAPanel from "@/components/DNAPanel";
import ShareCard from "@/components/ShareCard";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

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
        // Analyze wallet (uses fixture in dev)
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, useFixture: true }),
        });
        const analyzed = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult };

        // Build initial state
        const { createInitialState } = await import("@/lib/state-machine");
        const state = createInitialState(wallet.toLowerCase(), analyzed.archetype.archetype);

        setData({ dna: analyzed.dna, archetype: analyzed.archetype, state });

        // Load diary
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
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Back</Link>
        <div className="text-xs text-gray-600 font-mono">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </div>
      </div>

      {/* Character hero */}
      <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Soul Core</div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{archetype.profile.name}</h1>
            <div className="text-[var(--neon-green)] text-sm font-mono">"{archetype.profile.tagline}"</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Level</div>
            <div className="text-2xl font-black text-[var(--neon-gold)]">{state.level}</div>
          </div>
        </div>

        {/* Mood + status badges */}
        <div className="flex flex-wrap gap-2">
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--degen-card)] p-1 rounded-lg border border-[var(--degen-border)]">
        {(["stats", "traits", "diary", "share"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
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
            diary.map((entry) => (
              <div
                key={entry.id}
                className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-[var(--neon-purple)] uppercase">{entry.reason}</div>
                  <div className="text-xs text-gray-600">
                    {new Date(entry.timestamp * 1000).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-300 italic mb-2">"{entry.generated_caption}"</div>
                {entry.trait_delta.added.length > 0 && (
                  <div className="text-xs text-[var(--neon-green)]">
                    +{entry.trait_delta.added.map((t) => TRAIT_DEFINITIONS[t]?.label ?? t).join(", ")}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "share" && (
        <ShareCard dna={dna} archetype={archetype} state={state} wallet={wallet} />
      )}
    </div>
  );
}

function traitEmoji(traitId: string): string {
  const map: Record<string, string> = {
    crown: "👑",
    gold_chain: "⛓️",
    bandage: "🩹",
    torn_clothes: "🧥",
    tears: "😢",
    gold_tooth: "🦷",
    scar: "⚔️",
    zombie_eyes: "🧟",
    revenge_aura: "🔥",
    royal_cloak: "🔱",
    ghost_form: "👻",
    skull_ring: "💀",
  };
  return map[traitId] ?? "✦";
}

export default function MonsterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <MonsterRoomContent />
    </Suspense>
  );
}
