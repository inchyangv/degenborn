/**
 * T-INV-02 — Sibling / Rival Discovery panel.
 *
 * Shows the most similar (Sibling) and most opposite (Rival) soul
 * from the sample corpus, computed via cosine similarity of DNA vectors.
 *
 * Displayed in the Monster Room as a "Your Kin" side panel / section.
 */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { PersonaDNA, ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import CharacterDisplay from "./CharacterDisplay";
import type { CharacterState } from "@degenborn/shared";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

// ── Sample corpus ──────────────────────────────────────────────────────────
interface CorpusEntry {
  wallet: string;
  short: string;
  archetype: ArchetypeId;
  dna: [number, number, number, number, number]; // [agg, con, cha, lck, srv]
  state: CharacterState;
}

const CORPUS: CorpusEntry[] = [
  {
    wallet: DEMO_WALLETS.rug_necromancer,
    short: "0xrugN...0001",
    archetype: "rug_necromancer",
    dna: [55, 45, 82, 41, 91],
    state: {
      wallet_address: DEMO_WALLETS.rug_necromancer,
      archetype: "rug_necromancer",
      level: 5, mood: "revenge", corruption: 40, prestige: 15,
      scar_count: 2, crown_count: 1, survival_streak: 3,
      active_traits: ["zombie_eyes", "crown", "revenge_aura", "bandage"],
      updated_at: 1712700000,
    },
  },
  {
    wallet: DEMO_WALLETS.ice_whale,
    short: "0xiceW...0001",
    archetype: "ice_whale",
    dna: [18, 91, 12, 78, 85],
    state: {
      wallet_address: DEMO_WALLETS.ice_whale,
      archetype: "ice_whale",
      level: 7, mood: "neutral", corruption: 0, prestige: 75,
      scar_count: 0, crown_count: 3, survival_streak: 2,
      active_traits: ["crown", "gold_chain", "royal_cloak", "gold_tooth"],
      updated_at: 1712700000,
    },
  },
  {
    wallet: DEMO_WALLETS.mad_gambler,
    short: "0xmadG...0001",
    archetype: "mad_gambler",
    dna: [94, 22, 88, 55, 48],
    state: {
      wallet_address: DEMO_WALLETS.mad_gambler,
      archetype: "mad_gambler",
      level: 3, mood: "greed", corruption: 20, prestige: 10,
      scar_count: 1, crown_count: 1, survival_streak: 0,
      active_traits: ["crown", "torn_clothes", "bandage"],
      updated_at: 1712700000,
    },
  },
  {
    wallet: DEMO_WALLETS.sniper_jester,
    short: "0xsniJ...0001",
    archetype: "sniper_jester",
    dna: [82, 30, 40, 89, 55],
    state: {
      wallet_address: DEMO_WALLETS.sniper_jester,
      archetype: "sniper_jester",
      level: 4, mood: "euphoria", corruption: 5, prestige: 25,
      scar_count: 0, crown_count: 2, survival_streak: 1,
      active_traits: ["crown", "gold_tooth"],
      updated_at: 1712700000,
    },
  },
  {
    wallet: DEMO_WALLETS.ghost_bagholder,
    short: "0xghst...0001",
    archetype: "ghost_bagholder",
    dna: [30, 87, 72, 19, 28],
    state: {
      wallet_address: DEMO_WALLETS.ghost_bagholder,
      archetype: "ghost_bagholder",
      level: 2, mood: "ghost", corruption: 60, prestige: 0,
      scar_count: 3, crown_count: 0, survival_streak: 0,
      active_traits: ["bandage", "torn_clothes", "zombie_eyes"],
      updated_at: 1712700000,
    },
  },
  {
    wallet: DEMO_WALLETS.diamond_cultist,
    short: "0xdiaC...0001",
    archetype: "diamond_cultist",
    dna: [25, 90, 30, 20, 80],
    state: {
      wallet_address: DEMO_WALLETS.diamond_cultist,
      archetype: "diamond_cultist",
      level: 4, mood: "neutral", corruption: 10, prestige: 20,
      scar_count: 1, crown_count: 0, survival_streak: 2,
      active_traits: ["bandage"],
      updated_at: 1712700000,
    },
  },
];

// ── Cosine similarity ─────────────────────────────────────────────────────
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function dnaToVec(dna: PersonaDNA): number[] {
  return [dna.aggression, dna.conviction, dna.chaos, dna.luck, dna.survival];
}

interface SiblingRivalPanelProps {
  currentWallet: string;
  dna: PersonaDNA;
}

export default function SiblingRivalPanel({ currentWallet, dna }: SiblingRivalPanelProps) {
  const { sibling, rival } = useMemo(() => {
    const vec = dnaToVec(dna);
    const others = CORPUS.filter(
      (e) => e.wallet.toLowerCase() !== currentWallet.toLowerCase()
    );

    const scored = others.map((e) => ({
      entry: e,
      sim: cosineSimilarity(vec, e.dna),
    }));

    scored.sort((a, b) => b.sim - a.sim);
    return {
      sibling: scored[0]?.entry ?? null,
      rival: scored[scored.length - 1]?.entry ?? null,
    };
  }, [currentWallet, dna]);

  if (!sibling || !rival) return null;

  const sibColor = ARCHETYPE_COLORS[sibling.archetype] ?? "#9945ff";
  const rivColor = ARCHETYPE_COLORS[rival.archetype] ?? "#ff3d3d";

  return (
    <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-4">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-4">Your Kin</div>
      <div className="grid grid-cols-2 gap-3">
        {/* Sibling */}
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: `${sibColor}11`, border: `1px solid ${sibColor}33` }}
        >
          <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: sibColor }}>
            Soul Sibling
          </div>
          <div className="flex justify-center mb-2">
            <CharacterDisplay
              archetype={sibling.archetype}
              state={sibling.state}
              wallet={sibling.wallet}
              size={80}
            />
          </div>
          <div className="text-xs font-black text-white mb-0.5">
            {ARCHETYPE_PROFILES[sibling.archetype].name}
          </div>
          <div className="text-[10px] text-gray-600 mb-2">{sibling.short}</div>
          <Link
            href={`/compare?a=${currentWallet}&b=${sibling.wallet}`}
            className="block text-[10px] font-bold py-1 rounded-lg transition-colors hover:brightness-125"
            style={{ background: `${sibColor}22`, color: sibColor }}
          >
            Compare →
          </Link>
        </div>

        {/* Rival */}
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: `${rivColor}11`, border: `1px solid ${rivColor}33` }}
        >
          <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: rivColor }}>
            Soul Rival
          </div>
          <div className="flex justify-center mb-2">
            <CharacterDisplay
              archetype={rival.archetype}
              state={rival.state}
              wallet={rival.wallet}
              size={80}
            />
          </div>
          <div className="text-xs font-black text-white mb-0.5">
            {ARCHETYPE_PROFILES[rival.archetype].name}
          </div>
          <div className="text-[10px] text-gray-600 mb-2">{rival.short}</div>
          <Link
            href={`/battle?a=${currentWallet}&b=${rival.wallet}`}
            className="block text-[10px] font-bold py-1 rounded-lg transition-colors hover:brightness-125"
            style={{ background: `${rivColor}22`, color: rivColor }}
          >
            Battle ⚔ →
          </Link>
        </div>
      </div>
    </div>
  );
}
