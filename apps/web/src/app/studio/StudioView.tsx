"use client";

/**
 * T-MEME-01 — StudioView client component.
 * Loads wallet data then renders MemeTemplateStudio.
 */

import { useEffect, useState } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import MemeTemplateStudio from "@/components/MemeTemplateStudio";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

export default function StudioView({ wallet }: { wallet: string }) {
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
          Loading meme studio...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 text-sm">Could not load wallet data</div>
        <Link href="/" className="text-gray-400 hover:text-white text-xs">
          ← Back home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-12 px-4">
      <div className="max-w-xl mx-auto space-y-6 pt-8">
        <div className="text-center space-y-1">
          <div className="text-xs tracking-widest uppercase opacity-40">DegenBorn</div>
          <h1
            className="text-xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Meme Template Studio
          </h1>
          <p className="text-xs opacity-40">
            10 templates · your character · your words
          </p>
        </div>

        <MemeTemplateStudio
          wallet={wallet}
          archetype={data.archetype.archetype}
          state={data.state}
        />

        <div className="text-center">
          <Link
            href={`/m/${wallet}`}
            className="text-xs opacity-40 hover:opacity-70 transition-opacity underline"
          >
            ← Back to Monster Room
          </Link>
        </div>
      </div>
    </main>
  );
}
