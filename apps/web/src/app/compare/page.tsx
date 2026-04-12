"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";
import DNAPanel from "@/components/DNAPanel";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

async function loadMonster(wallet: string): Promise<MonsterData> {
  const resp = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  const analyzed = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult };
  const { createInitialState } = await import("@/lib/state-machine");
  const state = createInitialState(wallet.toLowerCase(), analyzed.archetype.archetype as any);
  return { dna: analyzed.dna, archetype: analyzed.archetype, state };
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const walletA = searchParams.get("a") ?? "";
  const walletB = searchParams.get("b") ?? "";

  const [inputA, setInputA] = useState(walletA);
  const [inputB, setInputB] = useState(walletB);
  const [dataA, setDataA] = useState<MonsterData | null>(null);
  const [dataB, setDataB] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletA || !walletB) return;
    setLoading(true);
    setError(null);
    Promise.all([loadMonster(walletA), loadMonster(walletB)])
      .then(([a, b]) => { setDataA(a); setDataB(b); })
      .catch((e) => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, [walletA, walletB]);

  const handleCompare = () => {
    if (!inputA || !inputB) return;
    router.push(`/compare?a=${encodeURIComponent(inputA)}&b=${encodeURIComponent(inputB)}`);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <h1 className="text-2xl font-black text-white">Monster Showdown</h1>
      </div>

      {/* Input form */}
      <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-5 mb-8">
        <div className="text-xs text-gray-600 uppercase tracking-widest mb-4">Compare two wallets</div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            placeholder="Wallet A (0x...)"
            className="flex-1 px-4 py-2.5 bg-[var(--degen-muted)] border border-[var(--degen-border)] rounded-lg text-sm text-gray-300 placeholder-gray-600 font-mono focus:outline-none focus:border-[var(--neon-green)] transition-colors"
          />
          <div className="flex items-center justify-center text-gray-600 font-black text-lg">VS</div>
          <input
            type="text"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            placeholder="Wallet B (0x...)"
            className="flex-1 px-4 py-2.5 bg-[var(--degen-muted)] border border-[var(--degen-border)] rounded-lg text-sm text-gray-300 placeholder-gray-600 font-mono focus:outline-none focus:border-[var(--neon-purple)] transition-colors"
          />
          <button
            onClick={handleCompare}
            disabled={!inputA || !inputB || loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-green)] text-black font-black rounded-lg hover:brightness-110 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? "Loading..." : "Compare →"}
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-2">
          Share URL: <span className="font-mono text-gray-500">/compare?a=WALLET_A&amp;b=WALLET_B</span>
        </div>
      </div>

      {error && (
        <div className="text-[var(--neon-red)] text-sm text-center py-8">{error}</div>
      )}

      {loading && (
        <div className="text-[var(--neon-green)] text-sm font-mono text-center animate-pulse py-8">
          Loading monsters...
        </div>
      )}

      {/* Side-by-side comparison */}
      {dataA && dataB && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { data: dataA, wallet: walletA, label: "A", color: "var(--neon-green)" },
            { data: dataB, wallet: walletB, label: "B", color: "var(--neon-purple)" },
          ].map(({ data, wallet, label, color }) => {
            const archetypeColor = ARCHETYPE_COLORS[data.archetype.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#9945ff";
            return (
              <div
                key={wallet}
                className="bg-[var(--degen-card)] border rounded-2xl overflow-hidden"
                style={{ borderColor: `${archetypeColor}44` }}
              >
                {/* Tag */}
                <div className="px-4 pt-3 pb-0">
                  <span
                    className="text-xs font-mono font-black px-2 py-0.5 rounded"
                    style={{ background: `${color}22`, color }}
                  >
                    {label}
                  </span>
                </div>

                {/* Character */}
                <div
                  className="flex flex-col items-center py-6 gap-3"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${archetypeColor}22, transparent 70%)` }}
                >
                  <CharacterDisplay
                    archetype={data.archetype.archetype as any}
                    state={data.state}
                    wallet={wallet}
                    size={200}
                  />
                  <div className="text-center">
                    <div className="text-lg font-black text-white">{data.archetype.profile.name}</div>
                    <div className="text-xs font-mono" style={{ color: archetypeColor }}>
                      "{data.archetype.profile.tagline}"
                    </div>
                    <div className="text-xs text-gray-600 font-mono mt-1">
                      {wallet.slice(0, 6)}...{wallet.slice(-4)} · Lv.{data.state.level}
                    </div>
                  </div>
                </div>

                {/* DNA */}
                <div className="px-4 pb-4">
                  <DNAPanel dna={data.dna} />
                  <Link
                    href={`/monster?wallet=${wallet}`}
                    className="mt-3 block text-center py-2 text-sm font-bold border rounded-lg transition-colors hover:brightness-125"
                    style={{ borderColor: `${archetypeColor}44`, color: archetypeColor }}
                  >
                    View Monster →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No winner message */}
      {dataA && dataB && !loading && (
        <div className="mt-6 text-center text-xs text-gray-600">
          No winner declared — this is a mirror, not a battle.
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
