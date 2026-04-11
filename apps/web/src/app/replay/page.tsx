"use client";

import { useEffect, useState, useRef } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_PROFILES, TRAIT_DEFINITIONS, ARCHETYPE_COLORS } from "@degenborn/shared";
import DNAPanel from "@/components/DNAPanel";
import CharacterDisplay from "@/components/CharacterDisplay";
import Link from "next/link";

interface ReplayStep {
  step: number;
  label: string;
  description: string;
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
  wallet_address: "0xrugnecromancer000000000000000000000000001",
  aggression: 55,
  conviction: 45,
  chaos: 82,
  luck: 41,
  survival: 91,
  computed_at: 0,
  event_count: 10,
};

const AUTO_DELAY_OPTIONS = [2000, 4000, 6000] as const;

export default function ReplayPage() {
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
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>("hackathon_demo_v1");

  useEffect(() => {
    const selected = ALL_PRESETS.find((p) => p.preset_id === selectedPresetId) ?? EMBEDDED_PRESET;
    reset();
    setPreset(selected);
    // reset archetype initial state to match preset
    setArchetypeId(selected.archetype);
    setDna({ ...PLACEHOLDER_DNA, ...selected.initial_dna, wallet_address: selected.wallet_address });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPresetId]);

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

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-xs tracking-widest text-[var(--neon-purple)] uppercase">Replay Mode</div>
        <button onClick={reset} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          Reset ↺
        </button>
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

      {/* Current action */}
      {currentStepData && (
        <div className="bg-[var(--degen-card)] border border-[var(--neon-purple)] rounded-xl p-4 mb-4 text-center">
          <div className="text-xs text-[var(--neon-purple)] uppercase tracking-widest mb-1">
            Step {currentStepData.step}: {currentStepData.label}
          </div>
          <div className="text-sm text-gray-300">{currentStepData.description}</div>
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

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="flex gap-3 items-center">
          {/* Prev */}
          <button
            onClick={prevStep}
            disabled={currentStep <= 0}
            className="px-4 py-2 border border-[var(--degen-border)] text-gray-500 text-sm rounded-lg hover:border-gray-500 transition-all disabled:opacity-30"
          >
            ← Prev
          </button>

          {/* Auto-play toggle */}
          {!isFinished && preset && (
            <button
              onClick={() => setPlaying((p) => !p)}
              className={`px-6 py-3 font-black rounded-lg transition-all text-sm ${
                playing
                  ? "bg-[var(--neon-gold)] text-black hover:brightness-90"
                  : "bg-[var(--neon-green)] text-black hover:brightness-110"
              }`}
            >
              {playing ? "⏸ Pause" : currentStep === -1 ? "▶ Start" : "▶ Auto-play"}
            </button>
          )}

          {/* Manual next */}
          {!playing && !isFinished && preset && currentStep < preset.steps.length - 1 && (
            <button
              onClick={advanceStep}
              className="px-4 py-2 border border-[var(--neon-green)] text-[var(--neon-green)] text-sm rounded-lg hover:bg-[var(--neon-green)] hover:text-black transition-all"
            >
              Next →
            </button>
          )}

          {/* Replay */}
          {isFinished && (
            <button
              onClick={reset}
              className="px-8 py-3 border border-[var(--neon-green)] text-[var(--neon-green)] font-bold rounded-lg hover:bg-[var(--neon-green)] hover:text-black transition-all"
            >
              ↺ Replay
            </button>
          )}
        </div>

        {/* Speed selector */}
        {!isFinished && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Speed:</span>
            {AUTO_DELAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setAutoDelay(d)}
                className={`px-2 py-0.5 rounded transition-colors ${autoDelay === d ? "text-[var(--neon-green)]" : "hover:text-gray-400"}`}
              >
                {d === 2000 ? "2s" : d === 4000 ? "4s" : "6s"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-700 text-center mt-4">
        Works offline · No API calls during replay
      </div>
    </div>
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
  wallet_address: "0xrugnecromancer000000000000000000000000001",
  initial_dna: { aggression: 55, conviction: 45, chaos: 82, luck: 41, survival: 91 },
  archetype: "rug_necromancer",
  steps: [
    { step: 1, label: "Connected", description: "0xrugN...0001 connected", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Chaos 82, Survival 91 — the necromancer stirs", action: "show_dna", dna: { aggression: 55, conviction: 45, chaos: 82, luck: 41, survival: 91 }, archetype: "rug_necromancer", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Rug Necromancer", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "Win Streak ×3", description: "3 consecutive wins → Crown acquired", action: "state_event", state_changes: { crown_count: 1, mood: "euphoria" as const, prestige: 10, level: 2, traits_added: ["crown"] }, caption: "Three in a row. The crown was always yours.", delay_ms: 0 },
    { step: 5, label: "Rug Exposure", description: "DEAD3 rugged — corruption +40, zombie eyes", action: "state_event", state_changes: { corruption: 40, scar_count: 1, mood: "despair" as const, traits_added: ["zombie_eyes", "bandage"] }, caption: "The rug found you. Again. The eyes never lie.", delay_ms: 0 },
    { step: 6, label: "Comeback", description: "UNDEAD 3x — survival streak 3, revenge aura", action: "state_event", state_changes: { survival_streak: 3, mood: "revenge" as const, traits_added: ["revenge_aura"] }, caption: "Down 1400. Back 1200. The necromancer returns.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 mutations logged", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Your identity card is ready", action: "show_share_card", delay_ms: 0 },
  ],
};

const PRESET_MAD_GAMBLER: ReplayPreset = {
  preset_id: "mad_gambler_v1",
  name: "Mad Gambler",
  description: "Chaos peak — all-in every time, somehow still alive",
  wallet_address: "0xmadgambler0000000000000000000000000000001",
  initial_dna: { aggression: 94, conviction: 22, chaos: 88, luck: 55, survival: 48 },
  archetype: "mad_gambler",
  steps: [
    { step: 1, label: "Connected", description: "0xmadG...0001 connected", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Aggression 94, Chaos 88 — the gambler never sleeps", action: "show_dna", dna: { aggression: 94, conviction: 22, chaos: 88, luck: 55, survival: 48 }, archetype: "mad_gambler", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Mad Gambler", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "Fast Flip ×5", description: "5 trades under 10 minutes — aggression maxed, crown appears", action: "state_event", state_changes: { crown_count: 1, mood: "greed" as const, prestige: 5, level: 2, traits_added: ["crown", "torn_clothes"] }, caption: "In. Out. Profit. Next. Sleep is for the convicted.", delay_ms: 0 },
    { step: 5, label: "Big Loss", description: "CHAOS99 rugged — scar +1, mood despair", action: "state_event", state_changes: { scar_count: 1, corruption: 20, mood: "despair" as const, traits_added: ["bandage"] }, caption: "Lost it all in 3 minutes. Personal best.", delay_ms: 0 },
    { step: 6, label: "Re-entry", description: "Immediately re-entered MOONSHOT — aggression 100", action: "state_event", state_changes: { survival_streak: 1, mood: "greed" as const, traits_added: ["flame"] }, caption: "You cannot stop someone who has nothing left to lose.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 mutations — all within 4 hours", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Generate identity card", action: "show_share_card", delay_ms: 0 },
  ],
};

const PRESET_ICE_WHALE: ReplayPreset = {
  preset_id: "ice_whale_v1",
  name: "Ice Whale",
  description: "Patient wins — long holds, peak exits, untouchable prestige",
  wallet_address: "0xicewhale000000000000000000000000000000001",
  initial_dna: { aggression: 18, conviction: 91, chaos: 12, luck: 78, survival: 85 },
  archetype: "ice_whale",
  steps: [
    { step: 1, label: "Connected", description: "0xiceW...0001 connected", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Conviction 91, Luck 78 — the whale surfaces", action: "show_dna", dna: { aggression: 18, conviction: 91, chaos: 12, luck: 78, survival: 85 }, archetype: "ice_whale", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Ice Whale", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "30-day Hold", description: "Held MEME4X for 30 days — prestige +50, royal cloak appears", action: "state_event", state_changes: { prestige: 50, crown_count: 2, mood: "euphoria" as const, level: 3, traits_added: ["royal_cloak", "crown", "gold_chain"] }, caption: "The market panicked. You slept. Then you sold.", delay_ms: 0 },
    { step: 5, label: "Peak Exit", description: "Sold at all-time high — perfect timing bonus", action: "state_event", state_changes: { prestige: 75, crown_count: 3, mood: "neutral" as const, level: 5, traits_added: ["gold_tooth"] }, caption: "They asked how. You said patience. They didn't believe you.", delay_ms: 0 },
    { step: 6, label: "7-day Rebuy", description: "Accumulated again at the dip — conviction unshaken", action: "state_event", state_changes: { survival_streak: 2, mood: "neutral" as const }, caption: "The price went down. The thesis didn't.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 milestone entries over 60 days", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Generate identity card", action: "show_share_card", delay_ms: 0 },
  ],
};

const PRESET_GHOST_BAGHOLDER: ReplayPreset = {
  preset_id: "ghost_bagholder_v1",
  name: "Ghost Bagholder",
  description: "Haunted by bags — still holding, still believing",
  wallet_address: "0xghostbagholder00000000000000000000000001",
  initial_dna: { aggression: 30, conviction: 87, chaos: 72, luck: 19, survival: 28 },
  archetype: "ghost_bagholder",
  steps: [
    { step: 1, label: "Connected", description: "0xghos...0001 connected", action: "connect_wallet", delay_ms: 0 },
    { step: 2, label: "Awakening", description: "Conviction 87, Luck 19 — the ghost materializes", action: "show_dna", dna: { aggression: 30, conviction: 87, chaos: 72, luck: 19, survival: 28 }, archetype: "ghost_bagholder", delay_ms: 0 },
    { step: 3, label: "Genesis", description: "You are: Ghost Bagholder", action: "show_genesis", delay_ms: 0 },
    { step: 4, label: "Rug ×2", description: "Two consecutive rugs — scar count 2, zombie eyes", action: "state_event", state_changes: { scar_count: 2, corruption: 60, mood: "despair" as const, traits_added: ["zombie_eyes", "bandage", "ghost"] }, caption: "The chart went to zero. Twice. The conviction did not.", delay_ms: 0 },
    { step: 5, label: "Still Holding", description: "Hasn't sold in 90 days — prestige 0, hope eternal", action: "state_event", state_changes: { prestige: 0, mood: "despair" as const, traits_added: ["ghost"] }, caption: "The devs left. The telegram is empty. You're still here.", delay_ms: 0 },
    { step: 6, label: "Survived", description: "Account still active after 3 months — survival streak 1", action: "state_event", state_changes: { survival_streak: 1, mood: "neutral" as const }, caption: "You haven't won. But you're still here. That's something.", delay_ms: 0 },
    { step: 7, label: "Diary", description: "3 haunting entries", action: "show_diary", delay_ms: 0 },
    { step: 8, label: "Share Card", description: "Generate identity card", action: "show_share_card", delay_ms: 0 },
  ],
};

const EMBEDDED_PRESET = PRESET_RUG_NECROMANCER;

const ALL_PRESETS = [
  PRESET_RUG_NECROMANCER,
  PRESET_MAD_GAMBLER,
  PRESET_ICE_WHALE,
  PRESET_GHOST_BAGHOLDER,
];
