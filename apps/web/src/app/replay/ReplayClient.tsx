"use client";

import { useEffect, useState, useRef } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_PROFILES, TRAIT_DEFINITIONS, ARCHETYPE_COLORS, pickDialogue, deriveDialogueEvent } from "@degenborn/shared";
import DNAPanel from "@/components/DNAPanel";
import CharacterDisplay from "@/components/CharacterDisplay";
import Link from "next/link";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

type Lang = "en" | "ko";

interface ReplayStep {
  step: number;
  label: string;
  description: string;
  /** EN subtitle for this step (what's happening) */
  subtitle_en?: string;
  /** KO subtitle for this step */
  subtitle_ko?: string;
  action: string;
  delay_ms: number;
  dna?: { aggression: number; conviction: number; chaos: number; luck: number; survival: number };
  archetype?: string;
  state_changes?: Partial<CharacterState> & { traits_added?: string[] };
  caption?: string;
  event_type?: string;
}

interface ReplayPreset {
  preset_id: string;
  name: string;
  description: string;
  wallet_address: string;
  initial_dna: { aggression: number; conviction: number; chaos: number; luck: number; survival: number };
  archetype: string;
  steps: ReplayStep[];
}

const PLACEHOLDER_DNA: PersonaDNA = {
  wallet_address: DEMO_WALLETS.rug_necromancer,
  aggression: 55,
  conviction: 45,
  chaos: 82,
  luck: 41,
  survival: 91,
  computed_at: 0,
  event_count: 10,
};

const AUTO_DELAY_OPTIONS = [2000, 4000, 6000] as const;

interface ReplayClientProps {
  autoplay?: boolean;
}

export default function ReplayClient({ autoplay = false }: ReplayClientProps) {
  const [preset, setPreset] = useState<ReplayPreset | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [autoDelay, setAutoDelay] = useState<2000 | 4000 | 6000>(4000);
  const [dna, setDna] = useState<PersonaDNA>(PLACEHOLDER_DNA);
  const [archetypeId, setArchetypeId] = useState<string>("rug_necromancer");
  const [state, setState] = useState<Partial<CharacterState>>({
    level: 1, mood: "neutral", corruption: 0, prestige: 0,
    scar_count: 0, crown_count: 0, survival_streak: 0, active_traits: [],
  });
  const [captions, setCaptions] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [characterVisible, setCharacterVisible] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>("hackathon_demo_v1");

  // ?autoplay=1 → start playing after preset loads
  useEffect(() => {
    const selected = ALL_PRESETS.find((p) => p.preset_id === selectedPresetId) ?? EMBEDDED_PRESET;
    reset();
    setPreset(selected);
    // reset archetype initial state to match preset
    setArchetypeId(selected.archetype);
    setDna({ ...PLACEHOLDER_DNA, ...selected.initial_dna, wallet_address: selected.wallet_address });
    // Auto-start if ?autoplay=1
    if (autoplay) {
      setTimeout(() => setPlaying(true), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPresetId, autoplay]);

  const reset = () => {
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    setCurrentStep(-1);
    setPlaying(false);
    setDna(PLACEHOLDER_DNA);
    setArchetypeId("rug_necromancer");
    setState({ level: 1, mood: "neutral", corruption: 0, prestige: 0, scar_count: 0, crown_count: 0, survival_streak: 0, active_traits: [] });
    setCaptions([]);
    setCompletedSteps([]);
    setCharacterVisible(false);
  };

  const applyStep = (stepIdx: number, preset: ReplayPreset) => {
    if (stepIdx >= preset.steps.length) {
      setPlaying(false);
      return;
    }
    const step = preset.steps[stepIdx]!;
    setCurrentStep(stepIdx);
    setCompletedSteps((prev) => [...prev, stepIdx]);

    if (step.dna) setDna((d) => ({ ...d, ...step.dna! }));
    if (step.archetype) setArchetypeId(step.archetype);
    if (step.state_changes) {
      setState((s) => {
        const next = { ...s, ...step.state_changes };
        if (step.state_changes?.traits_added) {
          next.active_traits = [...(s.active_traits ?? []), ...step.state_changes.traits_added as any];
        }
        return next;
      });
    }
    if (step.caption) setCaptions((prev) => [step.caption!, ...prev].slice(0, 5));
    if (stepIdx >= 2) setCharacterVisible(true);
  };

  const advanceStep = () => {
    if (!preset) return;
    const nextStep = currentStep + 1;
    if (nextStep < preset.steps.length) applyStep(nextStep, preset);
  };

  const prevStep = () => {
    if (currentStep <= 0) return;
    // Rebuild state by replaying from 0 to currentStep-1
    reset();
    if (!preset) return;
    let s: Partial<CharacterState> = { level: 1, mood: "neutral", corruption: 0, prestige: 0, scar_count: 0, crown_count: 0, survival_streak: 0, active_traits: [] };
    let d = PLACEHOLDER_DNA;
    let arch = "rug_necromancer";
    const caps: string[] = [];
    const completed: number[] = [];
    for (let i = 0; i < currentStep - 1; i++) {
      const step = preset.steps[i]!;
      completed.push(i);
      if (step.dna) d = { ...d, ...step.dna };
      if (step.archetype) arch = step.archetype;
      if (step.state_changes) {
        s = { ...s, ...step.state_changes };
        if (step.state_changes.traits_added) {
          s.active_traits = [...(s.active_traits ?? []), ...step.state_changes.traits_added as any];
        }
      }
      if (step.caption) caps.unshift(step.caption);
    }
    setDna(d);
    setArchetypeId(arch);
    setState(s);
    setCaptions(caps.slice(0, 5));
    setCompletedSteps(completed);
    setCurrentStep(currentStep - 2);
    if (currentStep - 1 >= 2) setCharacterVisible(true);
  };

  // Auto-play loop
  useEffect(() => {
    if (!playing || !preset) return;
    const nextStep = currentStep + 1;
    if (nextStep >= preset.steps.length) {
      setPlaying(false);
      return;
    }
    playTimerRef.current = setTimeout(() => {
      applyStep(nextStep, preset);
    }, autoDelay);
    return () => { if (playTimerRef.current) clearTimeout(playTimerRef.current); };
  }, [playing, currentStep, preset, autoDelay]);

  const archProfile = ARCHETYPE_PROFILES[archetypeId as keyof typeof ARCHETYPE_PROFILES];
  const currentStepData = preset?.steps[currentStep];
  const isFinished = preset ? currentStep >= preset.steps.length - 1 : false;

  const characterState: Partial<CharacterState> = state;
  const notStarted = currentStep === -1;

  // Keyboard shortcuts: Space = play/pause, ←/→ = prev/next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (preset && !isFinished) setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!playing && preset && !isFinished) advanceStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!playing) prevStep();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, playing, isFinished, currentStep]);

  return (
    <>
    <div className="min-h-screen px-4 py-8 pb-32 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-xs tracking-widest text-[var(--neon-purple)] uppercase">Replay Mode</div>
        <div className="flex items-center gap-2">
          {/* EN/KO toggle */}
          <div className="flex rounded overflow-hidden border border-gray-700">
            {(["en", "ko"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 text-[10px] font-bold transition-all ${
                  lang === l ? "bg-[var(--neon-purple)] text-black" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={reset} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Reset ↺
          </button>
        </div>
      </div>

      {/* Preset selector — L-06 */}
      <div className="mb-4">
        <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Choose a story arc</div>
        <div className="flex gap-2 flex-wrap">
          {ALL_PRESETS.map((p) => (
            <button
              key={p.preset_id}
              onClick={() => { if (selectedPresetId !== p.preset_id) setSelectedPresetId(p.preset_id); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedPresetId === p.preset_id
                  ? "bg-[var(--neon-purple)] text-black"
                  : "border border-[var(--degen-border)] text-gray-500 hover:border-gray-500 hover:text-gray-300"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {preset && (
          <div className="text-xs text-gray-500 mt-2 italic">{preset.description}</div>
        )}
      </div>

      {/* Mini timeline */}
      {preset && (
        <div className="mb-4">
          <div className="flex gap-1 mb-1">
            {preset.steps.map((s, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  completedSteps.includes(i)
                    ? "bg-[var(--neon-green)]"
                    : i === currentStep + 1
                    ? "bg-[var(--neon-purple)] opacity-50"
                    : "bg-[var(--degen-muted)]"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {preset.steps.map((s, i) => (
              <div
                key={i}
                className={`flex-shrink-0 text-[9px] font-mono text-center transition-colors ${
                  completedSteps.includes(i) ? "text-[var(--neon-green)]" : "text-gray-700"
                }`}
                style={{ minWidth: `${100 / preset.steps.length}%` }}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-start preset preview — shown when not yet started */}
      {notStarted && preset && archProfile && (
        <div className="flex flex-col items-center gap-3 py-6 mb-4 rounded-2xl opacity-60">
          <div className="relative">
            <CharacterDisplay
              archetype={archetypeId as any}
              state={{ level: 1, mood: "neutral", corruption: 0, prestige: 0, scar_count: 0, crown_count: 0, survival_streak: 0, active_traits: [], wallet_address: "0xreplay", archetype: archetypeId, updated_at: 0 } as CharacterState}
              wallet="0xreplay"
              size={200}
            />
            {/* Mystery overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <span className="text-5xl font-black text-white/80">?</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-mono">Press ▶ Start to reveal</div>
            <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
          </div>
        </div>
      )}

      {/* CHARACTER HERO — fixed once genesis unlocks */}
      {characterVisible && archProfile && (
        <div
          className="flex flex-col items-center gap-3 py-6 mb-4 rounded-2xl transition-all duration-700"
          style={{ background: `radial-gradient(circle at 50% 40%, ${archetypeGlow(archetypeId)}, transparent 70%)` }}
        >
          <div className="transition-all duration-500">
            <CharacterDisplay
              archetype={archetypeId as any}
              state={characterState as CharacterState}
              wallet="0xreplay"
              size={280}
            />
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-white">{archProfile.name}</div>
            <div className="text-[var(--neon-green)] text-xs font-mono">"{archProfile.tagline}"</div>
          </div>
        </div>
      )}

      {/* Subtitle block — 2 lines: what's happening + character dialogue */}
      {currentStepData && (
        <div className="bg-[var(--degen-card)] border border-[var(--neon-purple)] rounded-xl p-4 mb-4 text-center">
          {/* Line 1: step label + what's happening */}
          <div className="text-xs text-[var(--neon-purple)] uppercase tracking-widest mb-1">
            Step {currentStepData.step}: {currentStepData.label}
          </div>
          <div className="text-sm text-gray-300 mb-2">
            {lang === "ko"
              ? (currentStepData.subtitle_ko ?? currentStepData.description)
              : (currentStepData.subtitle_en ?? currentStepData.description)}
          </div>
          {/* Line 2: character dialogue derived from current state */}
          {currentStep >= 2 && (() => {
            const eventType = deriveDialogueEvent(characterState as CharacterState);
            const line = pickDialogue(archetypeId as any, eventType, currentStep);
            const text = lang === "ko" ? line.ko : line.en;
            return (
              <div
                className="text-xs font-mono italic px-3 py-1 rounded-lg inline-block"
                style={{ background: "rgba(153,69,255,0.08)", color: "var(--neon-purple)" }}
              >
                "{text}"
              </div>
            );
          })()}
        </div>
      )}

      {/* Mutation log — rolling captions */}
      {captions.length > 0 && (
        <div className="mb-4 space-y-1">
          {captions.map((c, i) => (
            <div
              key={i}
              className={`font-mono text-sm italic transition-all duration-500 ${
                i === 0
                  ? "text-[var(--neon-gold)]"
                  : "text-gray-600 text-xs"
              }`}
            >
              "{c}"
            </div>
          ))}
        </div>
      )}

      {/* Archetype text (before genesis unlock) */}
      {currentStep >= 2 && !characterVisible && archProfile && (
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4 mb-4">
          <div className="text-xs text-gray-600 uppercase mb-1">Current Identity</div>
          <div className="text-2xl font-black text-white mb-1">{archProfile.name}</div>
          <div className="text-[var(--neon-green)] text-sm font-mono">"{archProfile.tagline}"</div>
        </div>
      )}

      {/* DNA Panel */}
      {currentStep >= 1 && <DNAPanel dna={dna} />}

      {/* State badges */}
      {currentStep >= 3 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs bg-[var(--degen-muted)] text-gray-300 rounded capitalize">
              Level {state.level} · {state.mood}
            </span>
            {(state.corruption ?? 0) > 0 && (
              <span className="px-2 py-1 text-xs bg-purple-900/30 text-purple-400 rounded">
                Corruption {state.corruption}
              </span>
            )}
            {(state.crown_count ?? 0) > 0 && (
              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded">
                👑 × {state.crown_count}
              </span>
            )}
            {(state.survival_streak ?? 0) > 0 && (
              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded">
                Survival Streak {state.survival_streak}
              </span>
            )}
          </div>
          {(state.active_traits?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {state.active_traits?.map((t) => {
                const def = TRAIT_DEFINITIONS[t as keyof typeof TRAIT_DEFINITIONS];
                return (
                  <span key={t} className="px-2 py-1 text-xs border border-[var(--degen-border)] text-gray-400 rounded">
                    {def?.label ?? t}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-700 text-center mt-4">
        Works offline · No API calls during replay
      </div>
    </div>

    {/* ─── Fixed bottom control bar ─── */}
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-t border-[var(--degen-border)] px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Prev */}
        <button
          onClick={prevStep}
          disabled={currentStep <= 0}
          className="px-4 py-2 border border-[var(--degen-border)] text-gray-500 text-sm rounded-lg hover:border-gray-500 transition-all disabled:opacity-30 min-w-[72px]"
        >
          ← Prev
        </button>

        {/* Center: Play/Pause or Replay */}
        {isFinished ? (
          <button
            onClick={reset}
            className="flex-1 py-3 border border-[var(--neon-green)] text-[var(--neon-green)] font-bold rounded-lg hover:bg-[var(--neon-green)] hover:text-black transition-all text-sm"
          >
            ↺ Replay
          </button>
        ) : preset ? (
          <button
            onClick={() => setPlaying((p) => !p)}
            className={`flex-1 py-3 font-black rounded-lg transition-all text-sm ${
              playing
                ? "bg-[var(--neon-gold)] text-black hover:brightness-90"
                : "bg-[var(--neon-green)] text-black hover:brightness-110"
            }`}
          >
            {playing ? "⏸ Pause" : currentStep === -1 ? "▶ Start" : "▶ Auto-play"}
          </button>
        ) : null}

        {/* Next */}
        {!playing && !isFinished && preset ? (
          <button
            onClick={advanceStep}
            disabled={currentStep >= (preset?.steps.length ?? 0) - 1}
            className="px-4 py-2 border border-[var(--neon-green)] text-[var(--neon-green)] text-sm rounded-lg hover:bg-[var(--neon-green)] hover:text-black transition-all min-w-[72px] disabled:opacity-30"
          >
            Next →
          </button>
        ) : (
          <div className="min-w-[72px]" />
        )}
      </div>

      {/* Speed + keyboard hint */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mt-1.5 px-0.5">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
          <span>Speed:</span>
          {AUTO_DELAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setAutoDelay(d)}
              className={`px-1.5 py-0.5 rounded transition-colors ${autoDelay === d ? "text-[var(--neon-green)]" : "hover:text-gray-400"}`}
            >
              {d === 2000 ? "Fast" : d === 4000 ? "Normal" : "Slow"}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-gray-700">Space · ← →</div>
      </div>

      {/* TF-06: Four.meme value proposition — always visible at bottom */}
      {isFinished && (
        <div className="mt-8 border border-[var(--neon-green)] rounded-2xl p-5 bg-[var(--degen-card)]">
          <div className="text-[10px] text-[var(--neon-green)] uppercase tracking-widest mb-3">
            What DegenBorn gives Four.meme
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: "🔁", label: "Retention", desc: "Every trade = character growth" },
              { icon: "📢", label: "Viral UGC", desc: "Every share = Four.meme brand exposure" },
              { icon: "🏆", label: "Loyalty Data", desc: "Identify & reward power traders" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs font-black text-white">{item.label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-[10px] text-gray-600 italic border-t border-gray-800 pt-3">
            "Four.meme is where meme tokens are born. DegenBorn is where meme traders are born."
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function archetypeGlow(archetype: string): string {
  const base = ARCHETYPE_COLORS[archetype as keyof typeof ARCHETYPE_COLORS] ?? "#9945ff";
  return `${base}22`;
}

// All embedded presets — offline capable
const PRESET_RUG_NECROMANCER: ReplayPreset = {
  preset_id: "hackathon_demo_v1",
  name: "Rug Necromancer",
  description: "Rugged, recovered, crowned — the undying degen arc",
  wallet_address: DEMO_WALLETS.rug_necromancer,
  initial_dna: { aggression: 55, conviction: 45, chaos: 82, luck: 41, survival: 91 },
  archetype: "rug_necromancer",
  steps: [
    { step: 1, label: "Connected", description: "0xrugN...0001 connected", subtitle_en: "Wallet connected — reading Four.meme trade history…", subtitle_ko: "지갑 연결됨 — Four.meme 거래 내역 로딩 중…", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Chaos 82, Survival 91 — the necromancer stirs", subtitle_en: "Chaos 82 · Survival 91 — This monster was born from Four.meme trades", subtitle_ko: "카오스 82 · 생존 91 — 이 몬스터는 Four.meme 거래에서 태어났다", action: "show_dna", dna: { aggression: 55, conviction: 45, chaos: 82, luck: 41, survival: 91 }, archetype: "rug_necromancer", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Rug Necromancer", subtitle_en: "You are: Rug Necromancer — every Four.meme trade shaped this identity", subtitle_ko: "당신은: 럭 네크로맨서 — 모든 Four.meme 거래가 이 정체성을 만들었다", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "Win Streak ×3", description: "3 consecutive wins → Crown acquired", subtitle_en: "3 wins on Four.meme — Crown trait unlocked", subtitle_ko: "Four.meme에서 3연승 — 왕관 특성 해금", action: "state_event", state_changes: { crown_count: 1, mood: "euphoria" as const, prestige: 10, level: 2, traits_added: ["crown"] }, caption: "Three wins on Four.meme. The crown was always yours.", delay_ms: 0 },
    { step: 5, label: "Rug Exposure", description: "DEAD3 rugged — corruption +40, zombie eyes", subtitle_en: "DEAD3 rug on Four.meme — Corruption +40, Zombie Eyes appear", subtitle_ko: "Four.meme DEAD3 러그풀 — 오염 +40, 좀비 눈 등장", action: "state_event", state_changes: { corruption: 40, scar_count: 1, mood: "despair" as const, traits_added: ["zombie_eyes", "bandage"] }, caption: "The rug found you. Again. Four.meme recorded it all.", delay_ms: 0 },
    { step: 6, label: "Comeback", description: "UNDEAD 3x — survival streak 3, revenge aura", subtitle_en: "Comeback on Four.meme — Survival Streak ×3, Revenge Aura unlocked", subtitle_ko: "Four.meme 복귀 — 생존 스트릭 ×3, 복수 오라 해금", action: "state_event", state_changes: { survival_streak: 3, mood: "revenge" as const, traits_added: ["revenge_aura"] }, caption: "Down 1400. Back 1200. Trade on Four.meme. The necromancer returns.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 mutations logged", subtitle_en: "Mutation Diary — 3 soul changes from Four.meme activity", subtitle_ko: "변이 일지 — Four.meme 활동에서 나온 소울 변화 3개", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Your identity card is ready", subtitle_en: "Share your monster — \"Born from @four_meme trades\" · Every share brings new traders", subtitle_ko: "몬스터 공유 — \"@four_meme 거래에서 태어났다\" · 모든 공유가 새 트레이더를 불러온다", action: "show_share_card", delay_ms: 0 },
  ],
};

const PRESET_MAD_GAMBLER: ReplayPreset = {
  preset_id: "mad_gambler_v1",
  name: "Mad Gambler",
  description: "Chaos peak — all-in every time, somehow still alive",
  wallet_address: DEMO_WALLETS.mad_gambler,
  initial_dna: { aggression: 94, conviction: 22, chaos: 88, luck: 55, survival: 48 },
  archetype: "mad_gambler",
  steps: [
    { step: 1, label: "Connected", description: "0xmadG...0001 connected", subtitle_en: "Wallet connected. Chaos incoming.", subtitle_ko: "지갑 연결됨. 카오스가 온다.", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Aggression 94, Chaos 88 — the gambler never sleeps", subtitle_en: "Aggression 94 · Chaos 88 — the gambler awakens", subtitle_ko: "공격성 94 · 카오스 88 — 갬블러가 깨어났다", action: "show_dna", dna: { aggression: 94, conviction: 22, chaos: 88, luck: 55, survival: 48 }, archetype: "mad_gambler", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Mad Gambler", subtitle_en: "You are: Mad Gambler. All-in, always.", subtitle_ko: "당신은: 매드 갬블러. 항상 올인.", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "Fast Flip ×5", description: "5 trades under 10 minutes — aggression maxed, crown appears", subtitle_en: "5 flips in 10 min — Crown + Torn Clothes unlocked", subtitle_ko: "10분 안에 5번 플립 — 왕관 + 찢어진 옷 해금", action: "state_event", state_changes: { crown_count: 1, mood: "greed" as const, prestige: 5, level: 2, traits_added: ["crown", "torn_clothes"] }, caption: "In. Out. Profit. Next. Sleep is for the convicted.", delay_ms: 0 },
    { step: 5, label: "Big Loss", description: "CHAOS99 rugged — scar +1, mood despair", subtitle_en: "CHAOS99 rug — Scar acquired, mood shifts to despair", subtitle_ko: "CHAOS99 러그 — 흉터 획득, 기분이 절망으로", action: "state_event", state_changes: { scar_count: 1, corruption: 20, mood: "despair" as const, traits_added: ["bandage"] }, caption: "Lost it all in 3 minutes. Personal best.", delay_ms: 0 },
    { step: 6, label: "Re-entry", description: "Immediately re-entered MOONSHOT — aggression 100", subtitle_en: "Instant re-entry on MOONSHOT — survival streak starts", subtitle_ko: "MOONSHOT 즉시 재진입 — 생존 스트릭 시작", action: "state_event", state_changes: { survival_streak: 1, mood: "greed" as const, traits_added: ["flame"] }, caption: "You cannot stop someone who has nothing left to lose.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 mutations — all within 4 hours", subtitle_en: "Mutation Diary — 3 entries, 4 hour window", subtitle_ko: "변이 일지 — 3개 항목, 4시간 이내", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Generate identity card", subtitle_en: "Identity card ready — share your monster", subtitle_ko: "정체성 카드 준비됨 — 몬스터를 공유하라", action: "show_share_card", delay_ms: 0 },
  ],
};

const PRESET_ICE_WHALE: ReplayPreset = {
  preset_id: "ice_whale_v1",
  name: "Ice Whale",
  description: "Patient wins — long holds, peak exits, untouchable prestige",
  wallet_address: DEMO_WALLETS.ice_whale,
  initial_dna: { aggression: 18, conviction: 91, chaos: 12, luck: 78, survival: 85 },
  archetype: "ice_whale",
  steps: [
    { step: 1, label: "Connected", description: "0xiceW...0001 connected", subtitle_en: "Wallet connected. The depths stir.", subtitle_ko: "지갑 연결됨. 심연이 움직인다.", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Conviction 91, Luck 78 — the whale surfaces", subtitle_en: "Conviction 91 · Luck 78 — the whale surfaces", subtitle_ko: "확신 91 · 운 78 — 웨일이 떠오른다", action: "show_dna", dna: { aggression: 18, conviction: 91, chaos: 12, luck: 78, survival: 85 }, archetype: "ice_whale", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Ice Whale", subtitle_en: "You are: Ice Whale. Patience is the trade.", subtitle_ko: "당신은: 아이스 웨일. 인내가 거래다.", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "30-day Hold", description: "Held MEME4X for 30 days — prestige +50, royal cloak appears", subtitle_en: "30-day hold — Prestige +50, Royal Cloak unlocked", subtitle_ko: "30일 홀드 — 위신 +50, 왕실 망토 해금", action: "state_event", state_changes: { prestige: 50, crown_count: 2, mood: "euphoria" as const, level: 3, traits_added: ["royal_cloak", "crown", "gold_chain"] }, caption: "The market panicked. You slept. Then you sold.", delay_ms: 0 },
    { step: 5, label: "Peak Exit", description: "Sold at all-time high — perfect timing bonus", subtitle_en: "Exit at ATH — Triple Crown, Prestige 75", subtitle_ko: "역대 최고가 매도 — 트리플 왕관, 위신 75", action: "state_event", state_changes: { prestige: 75, crown_count: 3, mood: "neutral" as const, level: 5, traits_added: ["gold_tooth"] }, caption: "They asked how. You said patience. They didn't believe you.", delay_ms: 0 },
    { step: 6, label: "7-day Rebuy", description: "Accumulated again at the dip — conviction unshaken", subtitle_en: "Dip rebuy — conviction thesis intact", subtitle_ko: "딥 재매수 — 확신 테제 유지", action: "state_event", state_changes: { survival_streak: 2, mood: "neutral" as const }, caption: "The price went down. The thesis didn't.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 milestone entries over 60 days", subtitle_en: "Mutation Diary — 3 milestones across 60 days", subtitle_ko: "변이 일지 — 60일간 3개 마일스톤", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Generate identity card", subtitle_en: "Identity card ready — share your monster", subtitle_ko: "정체성 카드 준비됨 — 몬스터를 공유하라", action: "show_share_card", delay_ms: 0 },
  ],
};

const PRESET_GHOST_BAGHOLDER: ReplayPreset = {
  preset_id: "ghost_bagholder_v1",
  name: "Ghost Bagholder",
  description: "Haunted by bags — still holding, still believing",
  wallet_address: DEMO_WALLETS.ghost_bagholder,
  initial_dna: { aggression: 30, conviction: 87, chaos: 72, luck: 19, survival: 28 },
  archetype: "ghost_bagholder",
  steps: [
    { step: 1, label: "Connected", description: "0xghos...0001 connected", subtitle_en: "Wallet connected. A familiar silence returns.", subtitle_ko: "지갑 연결됨. 익숙한 침묵이 돌아온다.", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Conviction 87, Luck 19 — the ghost materializes", subtitle_en: "Conviction 87 · Luck 19 — the ghost materializes", subtitle_ko: "확신 87 · 운 19 — 유령이 실체화된다", action: "show_dna", dna: { aggression: 30, conviction: 87, chaos: 72, luck: 19, survival: 28 }, archetype: "ghost_bagholder", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Ghost Bagholder", subtitle_en: "You are: Ghost Bagholder. Still waiting.", subtitle_ko: "당신은: 고스트 백홀더. 아직 기다리고 있다.", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "Rug ×2", description: "Two consecutive rugs — scar count 2, zombie eyes", subtitle_en: "Two rugs — Scars ×2, Zombie Eyes, Corruption 60", subtitle_ko: "러그 2회 — 흉터 ×2, 좀비 눈, 오염 60", action: "state_event", state_changes: { scar_count: 2, corruption: 60, mood: "despair" as const, traits_added: ["zombie_eyes", "bandage", "ghost"] }, caption: "The chart went to zero. Twice. The conviction did not.", delay_ms: 0 },
    { step: 5, label: "Still Holding", description: "Hasn't sold in 90 days — prestige 0, hope eternal", subtitle_en: "90 days — still holding. Prestige 0. Ghost trait added.", subtitle_ko: "90일 — 아직 홀딩. 위신 0. 유령 특성 추가.", action: "state_event", state_changes: { prestige: 0, mood: "despair" as const, traits_added: ["ghost"] }, caption: "The devs left. The telegram is empty. You're still here.", delay_ms: 0 },
    { step: 6, label: "Survived", description: "Account still active after 3 months — survival streak 1", subtitle_en: "3 months later — still active. Survival Streak ×1.", subtitle_ko: "3개월 후 — 아직 활동 중. 생존 스트릭 ×1.", action: "state_event", state_changes: { survival_streak: 1, mood: "neutral" as const }, caption: "You haven't won. But you're still here. That's something.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 haunting entries", subtitle_en: "Mutation Diary — 3 haunting entries remain", subtitle_ko: "변이 일지 — 3개의 음산한 항목이 남아 있다", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Generate identity card", subtitle_en: "Identity card ready — share your ghost", subtitle_ko: "정체성 카드 준비됨 — 유령을 공유하라", action: "show_share_card", delay_ms: 0 },
  ],
};

const EMBEDDED_PRESET = PRESET_RUG_NECROMANCER;

const ALL_PRESETS = [
  PRESET_RUG_NECROMANCER,
  PRESET_MAD_GAMBLER,
  PRESET_ICE_WHALE,
  PRESET_GHOST_BAGHOLDER,
];
