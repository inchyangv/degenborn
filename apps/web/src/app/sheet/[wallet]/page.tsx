"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES, evaluateBadges } from "@degenborn/shared";
import type { BadgeDefinition } from "@degenborn/shared";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

// ── DNA → D&D stat mapping ────────────────────────────────────────────────
interface DnDStats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

function toModifier(score: number): string {
  // D&D modifier: (score - 10) / 2, rounded down; scale from 0-100 to 3-18
  const scaled = Math.round(3 + (score / 100) * 15);
  const mod = Math.floor((scaled - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

interface ArchetypeBonus { INT: number; WIS: number; CHA: number; }
const ARCHETYPE_BONUS: Record<string, ArchetypeBonus> = {
  mad_gambler:      { INT: 40, WIS: 20, CHA: 70 },
  ice_whale:        { INT: 70, WIS: 75, CHA: 50 },
  rug_necromancer:  { INT: 40, WIS: 60, CHA: 55 },
  diamond_cultist:  { INT: 80, WIS: 85, CHA: 30 },
  sniper_jester:    { INT: 60, WIS: 35, CHA: 80 },
  ghost_bagholder:  { INT: 70, WIS: 50, CHA: 15 },
};

function toDnD(dna: PersonaDNA, archetype: string): DnDStats {
  const bonus = ARCHETYPE_BONUS[archetype] ?? { INT: 50, WIS: 50, CHA: 50 };
  return {
    STR: dna.aggression,
    DEX: dna.luck,
    CON: dna.survival,
    INT: bonus.INT,
    WIS: bonus.WIS,
    CHA: bonus.CHA,
  };
}

// Alignment based on archetype
const ALIGNMENTS: Record<string, string> = {
  mad_gambler: "Chaotic Broke",
  ice_whale: "Lawful Patient",
  rug_necromancer: "Chaotic Undead",
  diamond_cultist: "Lawful Bagheld",
  sniper_jester: "Chaotic Profitable",
  ghost_bagholder: "Neutral Rekt",
};

function StatBlock({ label, value }: { label: string; value: number }) {
  const scaled = Math.round(3 + (value / 100) * 15);
  const mod = toModifier(value);
  return (
    <div className="flex flex-col items-center gap-1 border border-current/20 rounded p-2 min-w-[70px]">
      <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">{label}</div>
      <div className="text-2xl font-black">{scaled}</div>
      <div className="text-sm font-mono">{mod}</div>
    </div>
  );
}

export default function SheetPage() {
  const params = useParams();
  const wallet = typeof params.wallet === "string" ? params.wallet : "";

  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(true);

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
        setMonster({ dna: analyzed.dna, archetype: analyzed.archetype, state });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wallet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-sm">
        Loading soul sheet...
      </div>
    );
  }

  if (!monster) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-[var(--neon-red)] text-sm">Failed to load monster</div>
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs">← Home</Link>
      </div>
    );
  }

  const { dna, archetype, state } = monster;
  const color = ARCHETYPE_COLORS[archetype.archetype] ?? "#9945ff";
  const stats = toDnD(dna, archetype.archetype);
  const alignment = ALIGNMENTS[archetype.archetype] ?? "True Neutral";
  const badges: BadgeDefinition[] = evaluateBadges(state);
  const equipment = badges.slice(0, 6).map((b) => b.name);

  const hpMax = Math.round(state.level * 8 + (stats.CON - 50) * 0.3);
  const hpCurrent = Math.max(1, hpMax - state.scar_count * 5);
  const ac = Math.round(10 + (stats.DEX - 50) * 0.05 + state.level);
  const initiative = toModifier(dna.aggression);

  return (
    <div className="min-h-screen px-4 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between py-4 mb-4 border-b border-[var(--degen-border)]">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color }}>RPG Character Sheet</div>
          {wallet && (
            <Link href={`/monster?wallet=${wallet}`} className="text-xs text-gray-600 hover:text-gray-400">Soul Room →</Link>
          )}
        </div>

        {/* ── Character Sheet ─────────────────────────────────────────────── */}
        <div
          className="border-2 rounded-2xl overflow-hidden print:shadow-none"
          style={{ borderColor: color, color: "#e2e8f0", background: "var(--degen-card)" }}
        >
          {/* Header */}
          <div
            className="p-5 border-b-2"
            style={{ borderColor: `${color}55`, background: `${color}11` }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Character Name</div>
                <div className="text-xl font-black" style={{ color }}>{archetype.profile.name}</div>
                <div className="text-xs text-gray-500 italic mt-0.5">
                  &ldquo;{archetype.profile.tagline}&rdquo;
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Wallet</div>
                <div className="text-xs font-mono text-gray-400">{wallet.slice(0, 6)}...{wallet.slice(-4)}</div>
                <div className="text-xs text-gray-600 mt-1">Soul Level {state.level}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Class</div>
                <div className="text-sm font-bold">{archetype.profile.name}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Alignment</div>
                <div className="text-sm font-bold">{alignment}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Background</div>
                <div className="text-sm font-bold capitalize">{state.mood}</div>
              </div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="p-5 border-b border-[var(--degen-border)]">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-4">Ability Scores</div>
            <div className="flex flex-wrap gap-2 justify-between" style={{ color }}>
              {(Object.entries(stats) as [string, number][]).map(([stat, val]) => (
                <StatBlock key={stat} label={stat} value={val} />
              ))}
            </div>
            <div className="mt-4 text-[10px] text-gray-700">
              STR=Aggression · DEX=Luck · CON=Survival · INT/WIS/CHA from archetype
            </div>
          </div>

          {/* Combat Stats */}
          <div className="p-5 border-b border-[var(--degen-border)]">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Combat</div>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: "HP", value: `${hpCurrent}/${hpMax}` },
                { label: "AC", value: `${ac}` },
                { label: "Initiative", value: initiative },
                { label: "Scars", value: `${state.scar_count}` },
              ].map((item) => (
                <div key={item.label} className="bg-[var(--degen-muted)] rounded-lg p-2">
                  <div className="text-[10px] text-gray-600 uppercase tracking-widest">{item.label}</div>
                  <div className="text-lg font-black" style={{ color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment / Badges */}
          <div className="p-5 border-b border-[var(--degen-border)]">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Equipment (Badges)</div>
            {equipment.length === 0 ? (
              <div className="text-xs text-gray-600 italic">No badges earned yet.</div>
            ) : (
              <div className="space-y-1.5">
                {equipment.map((eq: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span style={{ color }}>⬡</span>
                    <span>{eq}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Traits / Skills */}
          <div className="p-5">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Active Traits</div>
            {state.active_traits.length === 0 ? (
              <div className="text-xs text-gray-600 italic">No traits unlocked.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {state.active_traits.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs rounded-full border capitalize"
                    style={{ borderColor: `${color}55`, color }}
                  >
                    {t.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-[var(--degen-border)] text-[10px] text-gray-700 text-center">
              DegenBorn Soul Character Sheet · {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </div>
          </div>
        </div>

        {/* Print & Actions */}
        <div className="flex gap-3 mt-4 flex-wrap print:hidden">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 font-black text-sm rounded-lg hover:brightness-110 transition-all"
            style={{ background: color, color: "#000" }}
          >
            Print / Save PDF
          </button>
          <Link
            href={`/origin/${wallet}`}
            className="px-5 py-2.5 border border-[var(--degen-border)] text-gray-400 font-bold text-sm rounded-lg hover:border-gray-400 hover:text-white transition-colors"
          >
            Origin Story →
          </Link>
          <Link
            href={`/battle?a=${wallet}`}
            className="px-5 py-2.5 border rounded-lg text-sm font-bold transition-colors hover:brightness-125"
            style={{ borderColor: `${color}55`, color }}
          >
            ⚔ Battle →
          </Link>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print, button, a { display: none !important; }
        }
      `}</style>
    </div>
  );
}
