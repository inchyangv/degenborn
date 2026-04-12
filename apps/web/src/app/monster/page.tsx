"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState, MutationEvent, DiaryPage } from "@degenborn/shared";
import { TRAIT_DEFINITIONS, TRAIT_EMOJI, ARCHETYPE_COLORS, ARCHETYPE_PROFILES, relativeTime } from "@degenborn/shared";
import DNAPanel from "@/components/DNAPanel";
import ShareCard from "@/components/ShareCard";
import TradingCard from "@/components/TradingCard";
import CharacterDisplay from "@/components/CharacterDisplay";
import WeatherLayer from "@/components/WeatherLayer";
import SiblingRivalPanel from "@/components/SiblingRivalPanel";
import WeeklyRecapModal from "@/components/WeeklyRecapModal";
import TypewriterText from "@/components/TypewriterText";
import { HeroSkeleton } from "@/components/LoadingSkeleton";
import Link from "next/link";

// XP thresholds: level N requires (N * 100) XP to level up
function levelXP(state: CharacterState): { current: number; needed: number; pct: number } {
  const xp = state.crown_count * 30 + state.scar_count * 15 + state.survival_streak * 20 + state.prestige;
  const needed = state.level * 100;
  const prev = (state.level - 1) * 100;
  const current = Math.min(xp - prev, needed - prev);
  const pct = Math.round((Math.max(0, current) / (needed - prev)) * 100);
  return { current: Math.max(0, current), needed: needed - prev, pct: Math.min(100, pct) };
}

// Archetype classification rules (abridged from PROJECT.md)
const ARCHETYPE_RULES: Record<string, string> = {
  mad_gambler: "Aggression high · Chaos high · Luck low/mid",
  ice_whale: "Conviction high · Luck high · Survival high",
  rug_necromancer: "Chaos high · Survival high",
  diamond_cultist: "Conviction high · Luck low · Survival high",
  sniper_jester: "Aggression high · Luck high · Short avg hold time",
  ghost_bagholder: "Conviction high · Chaos high · Survival low",
};

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
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
  const [activeTab, setActiveTab] = useState<"dna" | "traits" | "diary" | "share">("dna");
  const [showArchetypeModal, setShowArchetypeModal] = useState(false);

  useEffect(() => {
    if (!wallet) return;

    const load = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet }),
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
      <div className="min-h-screen pb-12">
        <HeroSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-[var(--neon-red)] text-lg font-mono">⚠ Failed to load monster data</div>
        <div className="text-gray-500 text-sm text-center">This could be a network issue or an invalid wallet address.</div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-[var(--neon-green)] text-black font-bold rounded text-sm hover:brightness-110 transition-all"
          >
            Retry
          </button>
          <Link
            href="/replay"
            className="px-5 py-2 border border-[var(--degen-border)] text-gray-400 rounded text-sm hover:border-gray-400 transition-colors"
          >
            Try Replay Demo
          </Link>
          <Link href="/" className="px-5 py-2 border border-[var(--degen-border)] text-gray-400 rounded text-sm hover:border-gray-400 transition-colors">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  const { dna, archetype, state } = data;

  return (
    <div className="min-h-screen pb-12 relative">
      {/* Mood-driven weather background */}
      <WeatherLayer mood={state.mood} />
      {/* Weekly recap — shown on Mondays if state changed */}
      <WeeklyRecapModal wallet={wallet} state={state} />
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
        <div className="flex gap-4">
          <Link
            href={`/m/${wallet}`}
            className="text-xs text-gray-600 hover:text-[var(--neon-green)] transition-colors font-mono"
          >
            🔗 View publicly →
          </Link>
          <Link
            href={`/compare?a=${wallet}`}
            className="text-xs text-gray-600 hover:text-[var(--neon-purple)] transition-colors font-mono"
          >
            ⚔ Challenge a friend →
          </Link>
        </div>
      </div>

      {/* Archetype Info Modal — M-13 */}
      {showArchetypeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setShowArchetypeModal(false)}
        >
          <div
            className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-black text-white">{archetype.profile.name}</div>
              <button
                onClick={() => setShowArchetypeModal(false)}
                className="text-gray-600 hover:text-gray-300 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-300 mb-3">{archetype.profile.description}</div>
            <div className="bg-[var(--degen-muted)] rounded-lg px-3 py-2 mb-3">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Classification Rules</div>
              <div className="text-xs text-gray-400 font-mono">
                {ARCHETYPE_RULES[archetype.archetype] ?? "—"}
              </div>
            </div>
            <div className="text-xs text-gray-600 mb-3">
              ⚠ What weakens your Soul Core: repeated rug exposure raises Corruption · consecutive losses → scar accumulation · inactivity stalls prestige growth.
            </div>
            <Link
              href="/gallery"
              className="text-xs text-[var(--neon-green)] hover:underline"
              onClick={() => setShowArchetypeModal(false)}
            >
              See other {archetype.profile.name}s in Gallery →
            </Link>
          </div>
        </div>
      )}

      <div className="px-4 max-w-2xl mx-auto">
        {/* Soul Core card — with XP bar (D-02) */}
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <div className="text-xs text-gray-600 uppercase tracking-widest">Soul Core</div>
                <button
                  onClick={() => setShowArchetypeModal(true)}
                  className="w-4 h-4 rounded-full border border-gray-700 text-gray-600 hover:border-gray-400 hover:text-gray-300 text-[10px] leading-none transition-colors"
                  title="What is this archetype?"
                >
                  i
                </button>
              </div>
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
          {/* XP Progress bar — D-02 */}
          {(() => {
            const xpInfo = levelXP(state);
            return (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-600 font-mono">XP {xpInfo.current}/{xpInfo.needed}</div>
                  <button
                    className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                    title="XP is earned from win streaks, rug survivals, and comebacks"
                  >
                    How to level up? ⓘ
                  </button>
                </div>
                <div className="h-1.5 bg-[var(--degen-muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${xpInfo.pct}%`, background: "var(--neon-gold)" }}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Activity Breakdown — M-14 */}
        {(() => {
          const buys = Math.round(dna.aggression * 0.4 + dna.event_count * 0.3);
          const sells = Math.round(buys * (0.6 + dna.conviction * 0.003));
          const dead = Math.round(dna.chaos * 0.15);
          const revivals = Math.round(dna.survival * 0.05);
          return (
            <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-4 mb-6">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Activity Breakdown · 30d <span className="text-[10px] text-gray-700 normal-case tracking-normal ml-1">(Estimated from DNA)</span></div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Buys", value: buys, color: "text-[var(--neon-green)]" },
                  { label: "Sells", value: sells, color: "text-gray-300" },
                  { label: "Dead tokens", value: dead, color: "text-[var(--neon-red)]" },
                  { label: "Revivals", value: revivals, color: "text-[var(--neon-purple)]" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <div className={`text-xl font-black ${color}`}>{value}</div>
                    <div className="text-[10px] text-gray-600">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-1 mb-6 bg-[var(--degen-card)] p-1 rounded-lg border border-[var(--degen-border)] overflow-x-auto">
          {([
            { id: "dna", label: "DNA" },
            { id: "traits", label: "Traits" },
            { id: "diary", label: "Diary" },
            { id: "share", label: "Share" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex-1 min-w-[64px] py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--neon-purple)] text-black font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "dna" && <DNAPanel dna={dna} />}

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
                    <div className="text-sm text-gray-300 italic mb-2">
                      &ldquo;<TypewriterText text={entry.generated_caption} speed={35} />&rdquo;
                    </div>
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
          <div className="space-y-8">
            <ShareCard dna={dna} archetype={archetype} state={state} wallet={wallet} />
            <div className="border-t border-[var(--degen-border)] pt-6">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-4">Trading Card</div>
              <TradingCard dna={dna} archetype={archetype} state={state} wallet={wallet} />
            </div>
          </div>
        )}

        {/* Sibling / Rival panel — always visible below tabs */}
        <div className="mt-6">
          <SiblingRivalPanel currentWallet={wallet} dna={dna} />
        </div>
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
