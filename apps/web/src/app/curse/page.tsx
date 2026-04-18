"use client";

import { useState } from "react";
import Link from "next/link";
import CharacterDisplay from "@/components/CharacterDisplay";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

interface MonsterData {
  wallet: string;
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

interface CurseResult {
  roast_a: string;
  roast_b: string;
  verdict: string;
  winner: "A" | "B" | "BOTH_LOST";
  winner_reason: string;
}

async function analyzeWallet(wallet: string): Promise<MonsterData> {
  const resp = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  if (!resp.ok) throw new Error(`Failed to analyze ${wallet}`);
  const data = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult; state?: CharacterState };
  const { createInitialState } = await import("@/lib/state-machine");
  const state = data.state ?? createInitialState(wallet.toLowerCase(), data.archetype.archetype as never);
  return { wallet: wallet.toLowerCase(), dna: data.dna, archetype: data.archetype, state };
}

const DEMO_PAIRS = [
  { a: DEMO_WALLETS.rug_necromancer, b: DEMO_WALLETS.ice_whale, label: "Necromancer vs Whale" },
  { a: DEMO_WALLETS.mad_gambler, b: DEMO_WALLETS.ghost_bagholder, label: "Gambler vs Ghost" },
  { a: DEMO_WALLETS.diamond_cultist, b: DEMO_WALLETS.sniper_jester, label: "Cultist vs Jester" },
];

export default function CursePage() {
  const [walletA, setWalletA] = useState("");
  const [walletB, setWalletB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataA, setDataA] = useState<MonsterData | null>(null);
  const [dataB, setDataB] = useState<MonsterData | null>(null);
  const [result, setResult] = useState<CurseResult | null>(null);

  const handleBattle = async () => {
    if (!walletA || !walletB) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [mA, mB] = await Promise.all([analyzeWallet(walletA), analyzeWallet(walletB)]);
      setDataA(mA);
      setDataB(mB);

      const resp = await fetch("/api/curse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletA: mA.wallet, walletB: mB.wallet,
          dnaA: mA.dna, dnaB: mB.dna,
          archetypeA: mA.archetype, archetypeB: mB.archetype,
        }),
      });
      if (!resp.ok) throw new Error("Curse API failed");
      const curseResult = await resp.json() as CurseResult;
      setResult(curseResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (pair: typeof DEMO_PAIRS[0]) => {
    setWalletA(pair.a);
    setWalletB(pair.b);
    setResult(null);
    setDataA(null);
    setDataB(null);
  };

  const colorA = dataA ? (ARCHETYPE_COLORS[dataA.archetype.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#888") : "#888";
  const colorB = dataB ? (ARCHETYPE_COLORS[dataB.archetype.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#888") : "#888";

  return (
    <div className="min-h-screen bg-[var(--degen-bg)] text-white pb-16">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-center">
          <div className="text-[var(--neon-red)] font-black text-lg tracking-widest">☠ CURSED MODE</div>
          <div className="text-[10px] text-gray-600">two wallets enter. the oracle decides.</div>
        </div>
        <Link href="/battle" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Battle →</Link>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Demo pairs */}
        <div className="flex gap-2 flex-wrap mb-6 justify-center">
          {DEMO_PAIRS.map((pair) => (
            <button
              key={pair.label}
              onClick={() => fillDemo(pair)}
              className="px-3 py-1.5 text-[10px] border border-gray-700 text-gray-400 rounded-full hover:border-[var(--neon-red)] hover:text-[var(--neon-red)] transition-colors"
            >
              {pair.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-[10px] text-gray-600 mb-1 font-mono">WALLET A</div>
            <input
              value={walletA}
              onChange={(e) => setWalletA(e.target.value)}
              placeholder="0x... or paste address"
              className="w-full px-3 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-red)] outline-none"
            />
          </div>
          <div>
            <div className="text-[10px] text-gray-600 mb-1 font-mono">WALLET B</div>
            <input
              value={walletB}
              onChange={(e) => setWalletB(e.target.value)}
              placeholder="0x... or paste address"
              className="w-full px-3 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-red)] outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleBattle}
          disabled={loading || !walletA || !walletB}
          className="w-full py-3 bg-[var(--neon-red)] text-black font-black text-sm rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
        >
          {loading ? "The Oracle Speaks…" : "⚔ CURSE THEM BOTH"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/40 rounded text-red-400 text-xs text-center">{error}</div>
        )}

        {/* Results */}
        {result && dataA && dataB && (
          <div className="mt-8 space-y-6">
            {/* Winner banner */}
            <div className={`p-4 rounded-xl border text-center ${
              result.winner === "BOTH_LOST"
                ? "border-gray-600 bg-gray-900/40"
                : result.winner === "A"
                  ? `border-[${colorA}] bg-black/40`
                  : `border-[${colorB}] bg-black/40`
            }`}>
              <div className="text-2xl font-black mb-1">
                {result.winner === "BOTH_LOST" ? "💀 BOTH LOST" : result.winner === "A" ? "🏆 A WINS" : "🏆 B WINS"}
              </div>
              <div className="text-[10px] text-gray-400 font-mono">{result.winner_reason}</div>
            </div>

            {/* Monsters side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Side A */}
              <div className={`rounded-xl overflow-hidden border ${result.winner === "A" ? "border-[var(--neon-gold)]" : "border-[var(--degen-border)]"}`}>
                <div className="p-3 bg-[var(--degen-card)]">
                  <div className="text-[10px] text-gray-600 mb-2 font-mono">{dataA.wallet.slice(0, 6)}…{dataA.wallet.slice(-4)}</div>
                  <CharacterDisplay
                    archetype={dataA.archetype.archetype as import("@degenborn/shared").ArchetypeId}
                    state={dataA.state}
                    wallet={dataA.wallet}
                    size={120}
                  />
                  <div className="mt-2 text-[10px] font-black text-center" style={{ color: colorA }}>
                    {ARCHETYPE_PROFILES[dataA.archetype.archetype as keyof typeof ARCHETYPE_PROFILES]?.name ?? dataA.archetype.archetype}
                  </div>
                </div>
                <div className="p-3 bg-black/20">
                  <p className="text-[11px] text-gray-300 leading-relaxed">{result.roast_a}</p>
                </div>
              </div>

              {/* Side B */}
              <div className={`rounded-xl overflow-hidden border ${result.winner === "B" ? "border-[var(--neon-gold)]" : "border-[var(--degen-border)]"}`}>
                <div className="p-3 bg-[var(--degen-card)]">
                  <div className="text-[10px] text-gray-600 mb-2 font-mono">{dataB.wallet.slice(0, 6)}…{dataB.wallet.slice(-4)}</div>
                  <CharacterDisplay
                    archetype={dataB.archetype.archetype as import("@degenborn/shared").ArchetypeId}
                    state={dataB.state}
                    wallet={dataB.wallet}
                    size={120}
                  />
                  <div className="mt-2 text-[10px] font-black text-center" style={{ color: colorB }}>
                    {ARCHETYPE_PROFILES[dataB.archetype.archetype as keyof typeof ARCHETYPE_PROFILES]?.name ?? dataB.archetype.archetype}
                  </div>
                </div>
                <div className="p-3 bg-black/20">
                  <p className="text-[11px] text-gray-300 leading-relaxed">{result.roast_b}</p>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className="p-4 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl">
              <div className="text-[10px] text-[var(--neon-red)] font-black mb-2 tracking-widest">THE ORACLE&apos;S VERDICT</div>
              <p className="text-sm text-gray-300 leading-relaxed italic">{result.verdict}</p>
            </div>

            {/* Share */}
            <button
              onClick={() => {
                const text = `☠ CURSED MODE on @DegenBorn\n\n${result.winner === "BOTH_LOST" ? "Both wallets lost. Certified ngmi." : `${result.winner === "A" ? dataA.wallet.slice(0, 8) : dataB.wallet.slice(0, 8)}… wins the roast battle.`}\n\n${result.verdict}\n\n#DegenBorn #FourMeme`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="w-full py-2 border border-gray-700 text-gray-400 text-xs rounded-lg hover:border-gray-400 transition-colors font-mono"
            >
              Share roast on X →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
