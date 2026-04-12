"use client";

/**
 * T-EULO-01 — Flatline Eulogy page: /eulogy/[wallet]
 *
 * Fetches wallet data (via /api/analyze), derives flatline status,
 * and renders the EulogyCard. If the wallet is active (not flatlined),
 * shows a "still alive" message. Resurrection stamp if came back.
 */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import Link from "next/link";
import EulogyCard from "@/components/EulogyCard";
import { deriveFlatlineStatus } from "@/lib/flatline";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

// Fixture: flatlined wallet for demo
const FLATLINE_FIXTURE_WALLET = "0xflatlineddemo00000000000000000000000001";

export default function EulogyPage() {
  const params = useParams<{ wallet: string }>();
  const wallet = params.wallet ?? "";
  const [data, setData] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // For demo purposes: flatline fixture wallet has a fixed lastActiveAt 45 days ago
  const isFixture = wallet.toLowerCase() === FLATLINE_FIXTURE_WALLET.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const lastActiveAt = isFixture ? now - 45 * 86400 : now - 35 * 86400; // demo: 35-45d ago
  const birthAt = isFixture ? now - 180 * 86400 : now - 90 * 86400;
  const isFlatlined = deriveFlatlineStatus(lastActiveAt);
  const resurrected = false; // would be true if wallet re-activated since eulogy was indexed

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 font-mono text-sm">Invalid wallet</div>
      </div>
    );
  }

  useEffect(() => {
    if (!wallet) return;
    const load = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, useFixture: true }),
        });
        if (!resp.ok) throw new Error("Failed");
        const analyzed = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult };
        const { createInitialState } = await import("@/lib/state-machine");
        // Give fixture wallets some scars for dramatic effect
        const state = createInitialState(wallet.toLowerCase(), analyzed.archetype.archetype as any);
        const demoState: CharacterState = {
          ...state,
          scar_count: isFixture ? 4 : state.scar_count,
          mood: isFixture ? "despair" : state.mood,
          level: isFixture ? 3 : state.level,
        };
        setData({ dna: analyzed.dna, archetype: analyzed.archetype, state: demoState });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wallet, isFixture]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 font-mono text-sm">Loading soul records…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-red-500 font-mono text-sm">Failed to load wallet data</div>
        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
      </div>
    );
  }

  const { dna, archetype, state } = data;

  return (
    <div className="min-h-screen pb-12">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-xs text-gray-600 font-mono uppercase tracking-widest">Soul Records</div>
        <Link href="/graveyard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Graveyard →</Link>
      </div>

      <div className="max-w-md mx-auto px-4 pt-8">
        {!isFlatlined ? (
          /* Soul is still active */
          <div className="text-center space-y-4 py-12">
            <div className="text-4xl">💚</div>
            <div className="text-white font-black text-xl">Soul is still active</div>
            <div className="text-gray-500 text-sm">
              {wallet.slice(0, 6)}…{wallet.slice(-4)} was last seen less than 30 days ago.
            </div>
            <div className="text-gray-600 text-xs">
              Flatline is declared only after 30 days of silence.
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <Link
                href={`/monster?wallet=${wallet}`}
                className="px-5 py-2 text-xs font-bold rounded-lg text-black transition-all hover:brightness-110"
                style={{ background: "var(--neon-green)" }}
              >
                View Monster Room
              </Link>
              <Link
                href="/graveyard"
                className="px-5 py-2 text-xs border border-gray-700 text-gray-400 rounded-lg hover:border-gray-400 transition-colors"
              >
                Graveyard
              </Link>
            </div>
          </div>
        ) : (
          /* Soul is flatlined */
          <EulogyCard
            dna={dna}
            archetype={archetype}
            state={state}
            wallet={wallet}
            birthAt={birthAt}
            lastActiveAt={lastActiveAt}
            resurrected={resurrected}
          />
        )}

        {/* Link to monster room even if flatlined */}
        {isFlatlined && (
          <div className="mt-4 text-center">
            <Link
              href={`/monster?wallet=${wallet}`}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              View full Soul Core →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
