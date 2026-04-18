"use client";

import { useState } from "react";
import Link from "next/link";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

interface AdoptResult {
  child_wallet: string;
  child_dna: {
    aggression: number; conviction: number; chaos: number; luck: number; survival: number;
  };
  child_archetype: string;
  child_archetype_name: string;
  child_tagline: string;
  parent_a: string;
  parent_b: string;
  parent_a_archetype: string;
  parent_b_archetype: string;
  synthesis_notes: string;
  birth_url: string;
}

const DEMO_PAIRS = [
  {
    a: DEMO_WALLETS.rug_necromancer,
    b: DEMO_WALLETS.ice_whale,
    child: DEMO_WALLETS.diamond_cultist,
    label: "Necromancer × Whale",
  },
  {
    a: DEMO_WALLETS.mad_gambler,
    b: DEMO_WALLETS.sniper_jester,
    child: DEMO_WALLETS.ghost_bagholder,
    label: "Gambler × Jester",
  },
];

const DNA_LABELS = ["aggression", "conviction", "chaos", "luck", "survival"] as const;
const DNA_COLORS: Record<string, string> = {
  aggression: "var(--neon-red)", conviction: "var(--neon-purple)",
  chaos: "#f59e0b", luck: "var(--neon-green)", survival: "var(--neon-gold)",
};

export default function AdoptPage() {
  const [walletA, setWalletA] = useState("");
  const [walletB, setWalletB] = useState("");
  const [childWallet, setChildWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdoptResult | null>(null);

  const pair = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/adopt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_a: walletA, wallet_b: walletB, child_wallet: childWallet }),
      });
      const data = await resp.json() as AdoptResult & { error?: string };
      if (!resp.ok) throw new Error(data.error ?? "Pairing failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pairing failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d: typeof DEMO_PAIRS[0]) => {
    setWalletA(d.a); setWalletB(d.b); setChildWallet(d.child);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[var(--degen-bg)] text-white pb-16">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs">← Home</Link>
        <div className="text-center">
          <div className="text-[var(--neon-purple)] font-black text-base tracking-widest">💑 PAIRING</div>
          <div className="text-[10px] text-gray-600">two Soul Cores → one child monster</div>
        </div>
        <div className="w-12" />
      </div>

      <div className="max-w-sm mx-auto px-4 pt-6">
        <p className="text-gray-500 text-xs text-center mb-4">
          Two analyzed wallets mutually pair to produce a child Soul Core. DNA is blended deterministically — rules decide, AI expresses.
        </p>

        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {DEMO_PAIRS.map((d) => (
            <button key={d.label} onClick={() => fillDemo(d)} className="px-3 py-1 text-[10px] border border-gray-700 text-gray-400 rounded-full hover:border-[var(--neon-purple)] hover:text-[var(--neon-purple)] transition-colors">
              {d.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          <input value={walletA} onChange={(e) => setWalletA(e.target.value)} placeholder="Parent A wallet 0x…" className="w-full px-3 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-purple)] outline-none" />
          <input value={walletB} onChange={(e) => setWalletB(e.target.value)} placeholder="Parent B wallet 0x…" className="w-full px-3 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-purple)] outline-none" />
          <input value={childWallet} onChange={(e) => setChildWallet(e.target.value)} placeholder="Child wallet 0x… (new address)" className="w-full px-3 py-2 bg-[var(--degen-card)] border border-[var(--neon-purple)]/30 rounded text-xs text-white font-mono focus:border-[var(--neon-purple)] outline-none" />
        </div>

        <button onClick={pair} disabled={loading || !walletA || !walletB || !childWallet} className="w-full py-3 bg-[var(--neon-purple)] text-white font-black text-sm rounded-lg hover:brightness-110 transition-all disabled:opacity-40">
          {loading ? "Synthesizing DNA…" : "💑 CREATE CHILD MONSTER"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/40 rounded text-red-400 text-xs text-center">{error}</div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-[var(--degen-card)] border border-[var(--neon-purple)] rounded-2xl p-4">
              <div className="text-[10px] text-[var(--neon-purple)] font-black tracking-widest mb-2">CHILD BORN</div>
              <div className="font-black text-xl mb-0.5" style={{ color: ARCHETYPE_COLORS[result.child_archetype as keyof typeof ARCHETYPE_COLORS] ?? "#888" }}>
                {result.child_archetype_name}
              </div>
              <div className="text-xs text-gray-400 italic mb-3">&ldquo;{result.child_tagline}&rdquo;</div>
              <div className="text-[10px] text-gray-600 font-mono mb-3">{result.child_wallet.slice(0, 8)}…{result.child_wallet.slice(-6)}</div>

              <div className="space-y-1.5 mb-3">
                {DNA_LABELS.map((axis) => (
                  <div key={axis}>
                    <div className="flex justify-between text-[9px] mb-0.5">
                      <span className="text-gray-500 capitalize">{axis}</span>
                      <span style={{ color: DNA_COLORS[axis] }}>{result.child_dna[axis]}</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${result.child_dna[axis]}%`, background: DNA_COLORS[axis] }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-gray-600 leading-relaxed italic mb-3">{result.synthesis_notes}</div>

              <div className="text-[9px] text-gray-600 mb-3">
                Parents: <span className="font-mono">{result.parent_a.slice(0, 6)}…</span> ({result.parent_a_archetype}) × <span className="font-mono">{result.parent_b.slice(0, 6)}…</span> ({result.parent_b_archetype})
              </div>

              <Link href={result.birth_url} className="block w-full py-2 text-center bg-[var(--neon-purple)] text-white font-black text-xs rounded-lg hover:brightness-110 transition-all">
                Summon Child Monster →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
