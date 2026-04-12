"use client";

/**
 * T-CERT-01 — CertificateView client component.
 * Fetches wallet data and renders BirthCertificate.
 */

import { useEffect, useState } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import BirthCertificate from "@/components/BirthCertificate";
import Link from "next/link";
import { generateCharacterName } from "@degenborn/archetype";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

export default function CertificateView({ wallet }: { wallet: string }) {
  const [data, setData] = useState<MonsterData | null>(null);
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
        if (!resp.ok) return;
        const analyzed = (await resp.json()) as { dna: PersonaDNA; archetype: ArchetypeResult };
        const { createInitialState } = await import("@/lib/state-machine");
        const state = createInitialState(
          wallet.toLowerCase(),
          analyzed.archetype.archetype as CharacterState["archetype"],
        );
        setData({ dna: analyzed.dna, archetype: analyzed.archetype, state });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wallet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--neon-green)] text-sm font-mono animate-pulse">
          Issuing certificate...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 text-sm">Certificate not found</div>
        <Link href="/" className="text-gray-400 hover:text-white text-xs">
          ← Back home
        </Link>
      </div>
    );
  }

  const { dna, archetype, state } = data;
  const charName = generateCharacterName(wallet, archetype.archetype, {
    archetype: archetype.archetype,
    crown_count: state.crown_count,
    scar_count: state.scar_count,
    survival_streak: state.survival_streak,
    corruption: state.corruption,
    prestige: state.prestige,
    mood: state.mood,
  });

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs tracking-widest uppercase opacity-40">DegenBorn</div>
          <h1
            className="text-xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Soul Birth Certificate
          </h1>
        </div>

        <BirthCertificate
          wallet={wallet}
          archetype={archetype.archetype}
          state={state}
          dna={dna}
          characterName={charName.name}
          characterTitle={charName.title}
        />

        <div className="text-center space-y-2">
          <Link
            href={`/m/${wallet}`}
            className="text-xs opacity-50 hover:opacity-80 transition-opacity underline block"
          >
            ← View Monster Room
          </Link>
        </div>
      </div>
    </main>
  );
}
