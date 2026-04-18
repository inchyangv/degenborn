"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState, MutationEvent, DiaryPage } from "@degenborn/shared";
import { TRAIT_DEFINITIONS, TRAIT_EMOJI, ARCHETYPE_COLORS, ARCHETYPE_PROFILES, relativeTime, getDailyHoroscope } from "@degenborn/shared";
import type { LoyaltyScore } from "@degenborn/scoring";
import DNAPanel from "@/components/DNAPanel";
import ShareCard from "@/components/ShareCard";
import TradingCard from "@/components/TradingCard";
import CharacterDisplay from "@/components/CharacterDisplay";
import WeatherLayer from "@/components/WeatherLayer";
import SiblingRivalPanel from "@/components/SiblingRivalPanel";
import WeeklyRecapModal from "@/components/WeeklyRecapModal";
import TypewriterText from "@/components/TypewriterText";
import { HeroSkeleton } from "@/components/LoadingSkeleton";
import { canonicalizeWallet } from "@/lib/demo-wallets";
import InstallPrompt from "@/components/InstallPrompt";
import Link from "next/link";
import { playVoiceLine } from "@/lib/sfx-config";
import { isMuted, toggleMute } from "@/lib/sfx";

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

interface ActivityCounts {
  buys: number;
  sells: number;
  dead_tokens: number;
  revivals: number;
}

interface CreatedToken {
  address: string;
  symbol?: string;
  timestamp: number;
}

interface CreatorStats {
  tokens_created: number;
  created_tokens: CreatedToken[];
}

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
  activity_counts: ActivityCounts;
  loyalty: LoyaltyScore | null;
  data_source: "live" | "demo" | "fixture";
  creator_stats: CreatorStats | null;
}


const DIARY_ACCENT: Record<string, string> = {
  win_streak: "border-yellow-400",
  rug_exposure: "border-red-500",
  loss_recovery: "border-purple-400",
  major_win: "border-yellow-400",
  default: "border-gray-700",
};

interface MonsterClientProps {
  wallet?: string;
}

export default function MonsterClient({ wallet = "" }: MonsterClientProps) {
  const normalizedWallet = canonicalizeWallet(wallet);
  const [data, setData] = useState<MonsterData | null>(null);
  const [diary, setDiary] = useState<MutationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dna" | "traits" | "diary" | "share" | "relics" | "creator">("dna");
  const [relicMinting, setRelicMinting] = useState<Record<number, "idle" | "minting" | "done" | "error">>({});
  const [relicTxHashes, setRelicTxHashes] = useState<Record<number, string>>({});
  const [showArchetypeModal, setShowArchetypeModal] = useState(false);
  const [horoscopeOpen, setHoroscopeOpen] = useState(false);
  const [newMilestones, setNewMilestones] = useState<Array<{ milestone_type: number; name: string; description: string }>>([]);
  const [milestoneAlertDismissed, setMilestoneAlertDismissed] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);

  useEffect(() => {
    setSfxMuted(isMuted());
  }, []);

  useEffect(() => {
    if (!normalizedWallet) {
      setLoading(false);
      setLoadError("Wallet address is missing.");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        setData(null);
        setDiary([]);

        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: normalizedWallet }),
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => null) as { error?: string } | null;
          throw new Error(body?.error ?? `Analyze failed (${resp.status})`);
        }

        const analyzed = await resp.json() as {
          dna: PersonaDNA;
          archetype: ArchetypeResult;
          activity_counts?: ActivityCounts;
          loyalty?: LoyaltyScore;
          derived_state?: CharacterState;
          data_source?: "live" | "demo" | "fixture";
          creator_stats?: CreatorStats;
        };
        if (!analyzed?.dna || !analyzed?.archetype?.archetype || !analyzed?.archetype?.profile) {
          throw new Error("Analyze response was incomplete.");
        }

        let state = analyzed.derived_state;
        if (!state) {
          const { createInitialState } = await import("@/lib/state-machine");
          state = createInitialState(normalizedWallet.toLowerCase(), analyzed.archetype.archetype as any);
        }

        if (cancelled) return;

        setData({
          dna: analyzed.dna,
          archetype: analyzed.archetype,
          state,
          activity_counts: analyzed.activity_counts ?? { buys: 0, sells: 0, dead_tokens: 0, revivals: 0 },
          loyalty: analyzed.loyalty ?? null,
          data_source: analyzed.data_source ?? "live",
          creator_stats: analyzed.creator_stats ?? null,
        });

        try {
          const diaryResp = await fetch(`/api/diary?wallet=${normalizedWallet.toLowerCase()}`);
          if (!diaryResp.ok) {
            throw new Error(`Diary failed (${diaryResp.status})`);
          }
          const page = await diaryResp.json() as DiaryPage;
          if (!cancelled) {
            setDiary(Array.isArray(page.entries) ? page.entries : []);
          }
        } catch (error) {
          console.warn("[monster] diary fetch failed:", error);
        }

        // 4.1: Check for newly eligible Snapshot Relic milestones
        try {
          const eligibleResp = await fetch(`/api/relic/eligible?wallet=${normalizedWallet.toLowerCase()}`);
          if (eligibleResp.ok) {
            const eligibleData = await eligibleResp.json() as {
              eligible: Array<{ milestone_type: number; name: string; description: string; minted: boolean }>;
              any_new: boolean;
            };
            if (!cancelled && eligibleData.any_new) {
              setNewMilestones(eligibleData.eligible.filter((e) => !e.minted));
            }
          }
        } catch {
          // non-critical
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[monster] failed to load monster:", error);
        setLoadError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [normalizedWallet]);

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
        {loadError && (
          <div className="max-w-lg text-center text-xs text-gray-600 font-mono break-all">
            {loadError}
          </div>
        )}
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

  const { dna, archetype, state, activity_counts, loyalty, data_source, creator_stats } = data;

  return (
    <div className="min-h-screen pb-12 relative">
      {/* 3.6: PWA Add to Home Screen prompt */}
      <InstallPrompt />
      {/* Mood-driven weather background */}
      <WeatherLayer mood={state.mood} />
      {/* Weekly recap — shown on Mondays if state changed */}
      <WeeklyRecapModal wallet={wallet} state={state} />
      {/* Global nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)] mb-0">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-center">
          <div className="text-xs text-gray-600 font-mono">
            {normalizedWallet.slice(0, 6)}...{normalizedWallet.slice(-4)}
          </div>
          <div className="text-[10px] text-[var(--neon-green)] opacity-60 tracking-widest uppercase">
            Four.meme Trader Identity
          </div>
        </div>
        <Link href="/gallery" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Gallery</Link>
      </div>
      {/* 4.1: Snapshot Relic milestone alert */}
      {newMilestones.length > 0 && !milestoneAlertDismissed && (
        <div className="mx-4 mt-3 p-3 bg-yellow-900/20 border border-[var(--neon-gold)] rounded-xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[var(--neon-gold)] text-xs font-black mb-1">
                🏆 {newMilestones.length} Snapshot Relic{newMilestones.length > 1 ? "s" : ""} unlocked
              </div>
              {newMilestones.slice(0, 2).map((m) => (
                <div key={m.milestone_type} className="text-gray-400 text-[10px]">
                  • {m.name} — {m.description}
                </div>
              ))}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("relics")}
                className="text-[10px] px-2 py-1 bg-[var(--neon-gold)] text-black font-bold rounded"
              >
                Mint
              </button>
              <button
                onClick={() => setMilestoneAlertDismissed(true)}
                className="text-[10px] px-2 py-1 border border-gray-600 text-gray-400 rounded"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
      {/* T3-01: Data source badge */}
      {data_source !== "live" && (
        <div className="flex justify-center py-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono border ${
              data_source === "demo"
                ? "border-[var(--neon-gold)] text-[var(--neon-gold)] bg-yellow-900/10"
                : "border-gray-600 text-gray-500"
            }`}
          >
            <span>{data_source === "demo" ? "🟡" : "🟠"}</span>
            <span>
              {data_source === "demo"
                ? "Demo data — not real on-chain activity"
                : "Sample fixture data — not real on-chain data"}
            </span>
          </div>
        </div>
      )}

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
        <div className="flex gap-2 flex-wrap justify-center">
          {/* 1-click X share — primary CTA T0-03 */}
          <button
            onClick={() => {
              const caption = `I'm a ${archetype.profile.name}. "${archetype.profile.tagline}" — my DegenBorn soul was born on @four_meme.`;
              const text = encodeURIComponent(`${caption}\n\nEvery trade on Four.meme shapes my monster 👾\n#DegenBorn #fourmeme`);
              const url = encodeURIComponent(`${window.location.origin}/m/${wallet}`);
              window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
            }}
            className="px-5 py-2 text-xs font-black rounded-lg hover:brightness-110 transition-all text-black"
            style={{ background: ARCHETYPE_COLORS[archetype.archetype as keyof typeof ARCHETYPE_COLORS] ?? "var(--neon-purple)" }}
          >
            𝕏 Share My Soul
          </button>
          <Link
            href={`/m/${normalizedWallet}`}
            className="px-4 py-2 text-xs border border-[var(--degen-border)] text-gray-500 hover:text-[var(--neon-green)] hover:border-[var(--neon-green)] transition-colors font-mono rounded-lg"
          >
            🔗 Public page →
          </Link>
          <Link
            href={`/compare?a=${normalizedWallet}`}
            className="px-4 py-2 text-xs border border-[var(--degen-border)] text-gray-500 hover:text-[var(--neon-purple)] hover:border-[var(--neon-purple)] transition-colors font-mono rounded-lg"
          >
            ⚔ Challenge →
          </Link>
        </div>

        {/* 1.4: Signature Voice Line */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (sfxMuted) return;
              setVoicePlaying(true);
              playVoiceLine(archetype.archetype);
              setTimeout(() => setVoicePlaying(false), 13000);
            }}
            disabled={sfxMuted || voicePlaying}
            className="flex items-center gap-2 px-4 py-2 text-xs border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-125"
            style={{ borderColor: "var(--neon-purple)", color: "var(--neon-purple)", background: "rgba(153,69,255,0.06)" }}
            title="Hear your monster speak"
          >
            <span>{voicePlaying ? "🔊" : "🎙"}</span>
            <span>{voicePlaying ? "Speaking…" : "Hear My Voice"}</span>
          </button>
          <button
            onClick={() => setSfxMuted(toggleMute())}
            className="text-lg leading-none text-gray-600 hover:text-gray-300 transition-colors"
            title={sfxMuted ? "Unmute" : "Mute"}
          >
            {sfxMuted ? "🔇" : "🔉"}
          </button>
        </div>

        {/* Evolve Your Monster CTA — TF-03 */}
        <a
          href="https://four.meme"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all hover:brightness-125 text-xs font-bold"
          style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)", background: "rgba(0,255,136,0.06)" }}
        >
          <span>⚡</span>
          <span>Trade on Four.meme to trigger new mutations</span>
          <span className="opacity-60">→</span>
        </a>
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
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-4 mb-6">
          <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">
            Activity Breakdown · 30d
            {data_source !== "live" && (
              <span className="text-[10px] text-yellow-600 normal-case tracking-normal ml-2">
                [{data_source === "demo" ? "Demo data" : "Fixture data"}]
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Buys", value: activity_counts.buys, color: "text-[var(--neon-green)]" },
              { label: "Sells", value: activity_counts.sells, color: "text-gray-300" },
              { label: "Dead tokens", value: activity_counts.dead_tokens, color: "text-[var(--neon-red)]" },
              { label: "Revivals", value: activity_counts.revivals, color: "text-[var(--neon-purple)]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-xl font-black ${color}`}>{value}</div>
                <div className="text-[10px] text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Four.meme Loyalty Score — TF-02 */}
        {loyalty && (
          <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-4 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-widest">Four.meme Loyalty</div>
                <div className="text-[10px] text-gray-700 mt-0.5">Ecosystem contribution score</div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-black"
                  style={{
                    color:
                      loyalty.grade === "Legendary" ? "#ffd700"
                      : loyalty.grade === "Diamond" ? "#00d4ff"
                      : loyalty.grade === "Gold" ? "#f59e0b"
                      : loyalty.grade === "Silver" ? "#94a3b8"
                      : "#92400e",
                  }}
                >
                  {loyalty.score}
                </div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color:
                      loyalty.grade === "Legendary" ? "#ffd700"
                      : loyalty.grade === "Diamond" ? "#00d4ff"
                      : loyalty.grade === "Gold" ? "#f59e0b"
                      : loyalty.grade === "Silver" ? "#94a3b8"
                      : "#92400e",
                  }}
                >
                  {loyalty.grade === "Legendary" ? "⭐ Legendary"
                    : loyalty.grade === "Diamond" ? "💎 Diamond"
                    : loyalty.grade === "Gold" ? "🥇 Gold"
                    : loyalty.grade === "Silver" ? "🥈 Silver"
                    : "🥉 Bronze"}
                </div>
              </div>
            </div>
            {/* Score bar */}
            <div className="h-2 bg-[var(--degen-muted)] rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${loyalty.score}%`,
                  background:
                    loyalty.grade === "Legendary" ? "linear-gradient(90deg, #f59e0b, #ffd700)"
                    : loyalty.grade === "Diamond" ? "linear-gradient(90deg, #00d4ff, #9945ff)"
                    : loyalty.grade === "Gold" ? "#f59e0b"
                    : loyalty.grade === "Silver" ? "#94a3b8"
                    : "#92400e",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-[var(--neon-green)] font-black text-base">{loyalty.trade_count}</div>
                <div className="text-gray-600 text-[10px]">Trades</div>
              </div>
              <div>
                <div className="text-[var(--neon-purple)] font-black text-base">{loyalty.unique_tokens}</div>
                <div className="text-gray-600 text-[10px]">Tokens</div>
              </div>
              <div>
                <div className="text-[var(--neon-gold)] font-black text-base">{loyalty.active_days}</div>
                <div className="text-gray-600 text-[10px]">Active days</div>
              </div>
            </div>
            {loyalty.four_meme_purity !== undefined && (
              <div className="mt-2 text-center text-[10px] text-[var(--neon-green)] opacity-80">
                🧬 {loyalty.purity_label}
              </div>
            )}
          </div>
        )}

        {/* Daily Horoscope Widget — T1-03 */}
        {(() => {
          const horo = getDailyHoroscope(wallet.toLowerCase(), archetype.archetype as any);
          return (
            <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl mb-6 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--degen-muted)] transition-colors"
                onClick={() => setHoroscopeOpen((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🔮</span>
                  <div>
                    <div className="text-xs font-mono text-[var(--neon-purple)] uppercase tracking-widest">
                      Today&apos;s Horoscope
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Lucky trait: {horo.luckyTrait}
                    </div>
                  </div>
                </div>
                <div className="text-gray-600 text-xs">{horoscopeOpen ? "▲" : "▼"}</div>
              </button>

              {horoscopeOpen && (
                <div className="px-4 pb-4 border-t border-[var(--degen-border)]">
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-[10px] text-[var(--neon-gold)] uppercase tracking-widest mb-1">Fortune</div>
                      <div className="text-sm text-gray-300 italic">&ldquo;{horo.fortune}&rdquo;</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--neon-green)] uppercase tracking-widest mb-1">Embrace</div>
                      <div className="text-sm text-gray-400">{horo.embrace}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--neon-red)] uppercase tracking-widest mb-1">Avoid</div>
                      <div className="text-sm text-gray-400">{horo.avoid}</div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[10px] text-gray-700">Mood: {horo.moodLabel} · {horo.date}</div>
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Today's degen horoscope: "${horo.fortune}"\nLucky trait: ${horo.luckyTrait}\n#DegenBorn #fourmeme`
                          );
                          const url = encodeURIComponent(`${window.location.origin}/horoscope?wallet=${wallet}`);
                          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
                        }}
                        className="text-[10px] text-[var(--neon-purple)] hover:underline font-mono"
                      >
                        𝕏 Share today&apos;s reading →
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            { id: "relics", label: "Relics" },
            { id: "creator", label: "🏗️" },
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
            <ShareCard dna={dna} archetype={archetype} state={state} wallet={wallet} loyalty={loyalty} />
            <div className="border-t border-[var(--degen-border)] pt-6">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-4">Trading Card</div>
              <TradingCard dna={dna} archetype={archetype} state={state} wallet={wallet} />
            </div>
          </div>
        )}

        {activeTab === "relics" && (
          <RelicsPanel wallet={wallet} state={state} relicMinting={relicMinting} setRelicMinting={setRelicMinting} relicTxHashes={relicTxHashes} setRelicTxHashes={setRelicTxHashes} />
        )}

        {activeTab === "creator" && (
          <CreatorPanel state={state} creatorStats={creator_stats} wallet={wallet} archetype={archetype.archetype} />
        )}

        {/* Sibling / Rival panel — always visible below tabs */}
        <div className="mt-6">
          <SiblingRivalPanel currentWallet={wallet} dna={dna} />
        </div>
      </div>
    </div>
  );
}

const MILESTONE_NAMES: Record<number, string> = {
  0: "First Crowned Win",
  1: "Rug Survivor",
  2: "Seven-Day Resurrection",
  3: "Chaos Ascension",
  4: "Diamond Hands",
  5: "Ghost Awakening",
};

const MILESTONE_DESCRIPTIONS: Record<number, string> = {
  0: "Earned your first 3-win streak crown",
  1: "Survived 3+ rug pull events",
  2: "Made a comeback within 7 days of a major loss",
  3: "Reached Corruption 80+",
  4: "Held for 30+ days with profit (Prestige 50+)",
  5: "Entered ghost mood and recovered",
};

function getEligibleMilestones(state: CharacterState): number[] {
  const eligible: number[] = [];
  if (state.crown_count >= 1) eligible.push(0);
  if (state.scar_count >= 3) eligible.push(1);
  if (state.survival_streak >= 1) eligible.push(2);
  if (state.corruption >= 80) eligible.push(3);
  if (state.prestige >= 50) eligible.push(4);
  if (state.mood === "ghost" || state.survival_streak >= 2) eligible.push(5);
  return eligible;
}

interface RelicsPanelProps {
  wallet: string;
  state: CharacterState;
  relicMinting: Record<number, "idle" | "minting" | "done" | "error">;
  setRelicMinting: Dispatch<SetStateAction<Record<number, "idle" | "minting" | "done" | "error">>>;
  relicTxHashes: Record<number, string>;
  setRelicTxHashes: Dispatch<SetStateAction<Record<number, string>>>;
}

function RelicsPanel({ wallet, state, relicMinting, setRelicMinting, relicTxHashes, setRelicTxHashes }: RelicsPanelProps) {
  const eligible = getEligibleMilestones(state);

  const handleMintRelic = async (milestoneType: number) => {
    setRelicMinting((prev) => ({ ...prev, [milestoneType]: "minting" }));
    try {
      const resp = await fetch("/api/relic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, milestone_type: milestoneType, state }),
      });
      const data = await resp.json() as { tx_hash?: string; already_minted?: boolean; error?: string };
      if (!resp.ok) throw new Error(data.error ?? "Mint failed");
      if (data.tx_hash) setRelicTxHashes((prev) => ({ ...prev, [milestoneType]: data.tx_hash! }));
      setRelicMinting((prev) => ({ ...prev, [milestoneType]: "done" }));
    } catch {
      setRelicMinting((prev) => ({ ...prev, [milestoneType]: "error" }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Snapshot Relics — Earned Milestones</div>
      {eligible.length === 0 ? (
        <div className="text-gray-600 text-sm text-center py-8">
          No milestones reached yet. Keep trading to unlock Snapshot Relics.
        </div>
      ) : (
        eligible.map((milestoneType) => {
          const mintStatus = relicMinting[milestoneType] ?? "idle";
          const txHash = relicTxHashes[milestoneType];
          return (
            <div
              key={milestoneType}
              className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-[var(--neon-gold)] mb-0.5">
                    {MILESTONE_NAMES[milestoneType]}
                  </div>
                  <div className="text-xs text-gray-500">{MILESTONE_DESCRIPTIONS[milestoneType]}</div>
                  {txHash && (
                    <a
                      href={`https://testnet.bscscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--neon-purple)] hover:brightness-125 underline decoration-dotted mt-1 inline-block"
                    >
                      View on BSCScan →
                    </a>
                  )}
                </div>
                <div className="shrink-0">
                  {mintStatus === "done" ? (
                    <div className="text-xs text-[var(--neon-green)] font-mono">✓ Minted</div>
                  ) : mintStatus === "error" ? (
                    <button
                      onClick={() => handleMintRelic(milestoneType)}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-800 rounded px-2 py-1"
                    >
                      Retry
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMintRelic(milestoneType)}
                      disabled={mintStatus === "minting"}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, var(--neon-purple), var(--neon-gold))",
                        color: "#000",
                      }}
                    >
                      {mintStatus === "minting" ? "Minting..." : "Mint Relic"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div className="text-xs text-gray-700 text-center mt-4">
        Snapshot Relics are tradeable NFTs on BSC Testnet · Contract: {process.env.NEXT_PUBLIC_SNAPSHOT_RELIC_ADDRESS?.slice(0, 10) ?? "0xFBdDD268..."}…
      </div>
    </div>
  );
}

// ─── TF-05: Creator Panel ────────────────────────────────────────────────────

interface CreatorPanelProps {
  state: CharacterState;
  creatorStats: { tokens_created: number; created_tokens: { address: string; symbol?: string; timestamp: number }[] } | null;
  wallet: string;
  archetype: string;
}

function CreatorPanel({ state, creatorStats, wallet, archetype }: CreatorPanelProps) {
  const tokensCreated = state.tokens_created ?? 0;
  const isCreator = tokensCreated > 0 || (creatorStats?.tokens_created ?? 0) > 0;
  const actualCount = Math.max(tokensCreated, creatorStats?.tokens_created ?? 0);
  const kingmaker = state.kingmaker_tokens ?? 0;
  const fallenCreator = state.fallen_creator_tokens ?? 0;
  const createdTokens = creatorStats?.created_tokens ?? [];

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Token Creator — Four.meme</div>

      {!isCreator ? (
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">🏗️</div>
          <div className="text-sm text-gray-400 mb-2">No token launches detected on Four.meme</div>
          <div className="text-xs text-gray-600 mb-4">
            Launch a token on Four.meme to unlock the Creator Badge and shape your monster&apos;s destiny.
          </div>
          <a
            href="https://four.meme"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all hover:brightness-125"
            style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)", background: "rgba(0,255,136,0.06)" }}
          >
            <span>⚡</span>
            Launch a token on Four.meme
          </a>
        </div>
      ) : (
        <>
          {/* Creator stats overview */}
          <div className="bg-[var(--degen-card)] border border-[var(--neon-blue,#00d4ff)] rounded-2xl p-5" style={{ borderColor: "#00d4ff" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🏗️</div>
              <div>
                <div className="text-sm font-black text-white">Token Creator</div>
                <div className="text-xs text-[#00d4ff]">Four.meme Builder</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-black text-[#00d4ff]">{actualCount}</div>
                <div className="text-[10px] text-gray-600">token{actualCount !== 1 ? "s" : ""} launched</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[var(--degen-muted)] rounded-lg p-3">
                <div className="text-xl font-black text-[var(--neon-gold)]">{kingmaker}</div>
                <div className="text-[10px] text-gray-600">Kingmaker</div>
                <div className="text-[10px] text-[var(--neon-gold)]">🤴 Success</div>
              </div>
              <div className="bg-[var(--degen-muted)] rounded-lg p-3">
                <div className="text-xl font-black text-[var(--neon-red)]">{fallenCreator}</div>
                <div className="text-[10px] text-gray-600">Fallen</div>
                <div className="text-[10px] text-[var(--neon-red)]">🪦 Failed</div>
              </div>
              <div className="bg-[var(--degen-muted)] rounded-lg p-3">
                <div className="text-xl font-black text-gray-300">{actualCount - kingmaker - fallenCreator}</div>
                <div className="text-[10px] text-gray-600">Unknown</div>
                <div className="text-[10px] text-gray-500">⏳ Ongoing</div>
              </div>
            </div>
          </div>

          {/* Creator traits unlocked */}
          {state.creator_badge && (
            <div className="flex items-center gap-3 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-lg px-4 py-3" style={{ borderLeftWidth: 3, borderLeftColor: "#00d4ff" }}>
              <div className="text-2xl">🏗️</div>
              <div>
                <div className="text-sm font-bold text-white">Creator Badge</div>
                <div className="text-xs text-gray-500">Launched a token on Four.meme — a builder among degens</div>
              </div>
              <div className="ml-auto text-[10px] text-[#00d4ff] font-mono">accessory</div>
            </div>
          )}
          {kingmaker >= 1 && (
            <div className="flex items-center gap-3 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-lg px-4 py-3" style={{ borderLeftWidth: 3, borderLeftColor: "var(--neon-gold)" }}>
              <div className="text-2xl">🤴</div>
              <div>
                <div className="text-sm font-bold text-white">Kingmaker Crown</div>
                <div className="text-xs text-gray-500">Launched a token that achieved significant trading volume</div>
              </div>
              <div className="ml-auto text-[10px] text-[var(--neon-gold)] font-mono">head</div>
            </div>
          )}
          {fallenCreator >= 1 && (
            <div className="flex items-center gap-3 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-lg px-4 py-3" style={{ borderLeftWidth: 3, borderLeftColor: "var(--neon-red)" }}>
              <div className="text-2xl">🪦</div>
              <div>
                <div className="text-sm font-bold text-white">Fallen Creator Mark</div>
                <div className="text-xs text-gray-500">Launched a token that went to zero — the scar of ambition</div>
              </div>
              <div className="ml-auto text-[10px] text-[var(--neon-red)] font-mono">body</div>
            </div>
          )}

          {/* Token list */}
          {createdTokens.length > 0 && (
            <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-4">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Launched Tokens</div>
              <div className="space-y-2">
                {createdTokens.map((token) => (
                  <div key={token.address} className="flex items-center gap-3 py-2 border-b border-[var(--degen-border)] last:border-b-0">
                    <div className="text-lg">🪙</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{token.symbol ?? "Unknown Token"}</div>
                      <div className="text-[10px] text-gray-600 font-mono truncate">{token.address}</div>
                    </div>
                    <div className="text-[10px] text-gray-600 whitespace-nowrap">
                      {new Date(token.timestamp * 1000).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4 flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">Keep building on Four.meme</div>
              <div className="text-[10px] text-gray-600">Every token launch shapes your creator identity</div>
            </div>
            <a
              href="https://four.meme"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:brightness-125 whitespace-nowrap"
              style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)" }}
            >
              Launch →
            </a>
          </div>

          {/* X share */}
          <button
            onClick={() => {
              const text = encodeURIComponent(
                `I've launched ${actualCount} token${actualCount !== 1 ? "s" : ""} on @four_meme 🏗️\n` +
                (kingmaker > 0 ? `🤴 Kingmaker status unlocked\n` : "") +
                `My DegenBorn soul carries the Creator Badge\n#DegenBorn #fourmeme #creator`
              );
              const url = encodeURIComponent(`${window.location.origin}/m/${wallet}`);
              window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
            }}
            className="w-full py-2.5 text-xs font-black rounded-xl transition-all hover:brightness-110 text-black"
            style={{ background: "#00d4ff" }}
          >
            𝕏 Share My Creator Status
          </button>
        </>
      )}
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
