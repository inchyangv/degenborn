"use client";

import { useState } from "react";
import Link from "next/link";

interface PatronData {
  token_address: string;
  patron_wallet: string;
  patron_archetype: string;
  patron_name: string;
  patron_tagline: string;
  hold_amount_usd: number;
  monster_url: string;
  is_demo: boolean;
}

const DEMO_TOKENS = [
  { address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", symbol: "WBNB" },
  { address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", symbol: "CAKE" },
  { address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8", symbol: "ETH" },
];

export default function PatronPage() {
  const [tokenAddr, setTokenAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patron, setPatron] = useState<PatronData | null>(null);

  const lookup = async (addr: string) => {
    if (!addr) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/patron/${addr.trim().toLowerCase()}`);
      if (!resp.ok) {
        const err = await resp.json() as { error: string };
        throw new Error(err.error);
      }
      const data = await resp.json() as PatronData;
      setPatron(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--degen-bg)] text-white pb-16">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-center">
          <div className="text-[var(--neon-gold)] font-black text-base tracking-widest">⚜ PATRON SAINT</div>
          <div className="text-[10px] text-gray-600">top holder monster of any Four.meme token</div>
        </div>
        <div className="w-12" />
      </div>

      <div className="max-w-sm mx-auto px-4 pt-8">
        <p className="text-gray-500 text-xs text-center mb-6">
          Enter a Four.meme token contract address. The wallet that holds the most gets crowned its <span className="text-[var(--neon-gold)]">Patron Saint</span>.
          When the holder changes, the crown moves — drama guaranteed.
        </p>

        {/* Demo tokens */}
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {DEMO_TOKENS.map((t) => (
            <button
              key={t.address}
              onClick={() => { setTokenAddr(t.address); lookup(t.address); }}
              className="px-3 py-1 text-[10px] border border-gray-700 text-gray-400 rounded-full hover:border-[var(--neon-gold)] hover:text-[var(--neon-gold)] transition-colors font-mono"
            >
              ${t.symbol}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            value={tokenAddr}
            onChange={(e) => setTokenAddr(e.target.value)}
            placeholder="0x token contract address"
            className="flex-1 px-3 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-gold)] outline-none"
          />
          <button
            onClick={() => lookup(tokenAddr)}
            disabled={loading || !tokenAddr}
            className="px-4 py-2 bg-[var(--neon-gold)] text-black font-black text-xs rounded hover:brightness-110 transition-all disabled:opacity-40"
          >
            {loading ? "…" : "Find"}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/40 rounded text-red-400 text-xs text-center mb-4">{error}</div>
        )}

        {patron && (
          <div className="bg-[var(--degen-card)] border border-[var(--neon-gold)] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-900/20 to-transparent px-4 py-3 border-b border-[var(--degen-border)]">
              <div className="text-[10px] text-[var(--neon-gold)] font-black tracking-widest mb-0.5">⚜ PATRON SAINT</div>
              <div className="text-[10px] text-gray-600 font-mono">{patron.token_address.slice(0, 10)}…{patron.token_address.slice(-6)}</div>
            </div>

            <div className="p-4">
              <div className="text-lg font-black mb-0.5" style={{ color: "var(--neon-gold)" }}>
                {patron.patron_name}
              </div>
              <div className="text-xs text-gray-400 italic mb-3">&ldquo;{patron.patron_tagline}&rdquo;</div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-gray-600">Wallet</div>
                  <div className="text-xs font-mono text-white">{patron.patron_wallet.slice(0, 8)}…{patron.patron_wallet.slice(-6)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-600">Est. Holdings</div>
                  <div className="text-sm font-black text-[var(--neon-green)]">${patron.hold_amount_usd.toLocaleString()}</div>
                </div>
              </div>

              {patron.is_demo && (
                <div className="text-[9px] text-gray-600 text-center mb-3">
                  Demo mode — holdings estimated from on-chain activity proxy
                </div>
              )}

              <Link
                href={patron.monster_url}
                className="block w-full py-2 text-center bg-[var(--neon-gold)] text-black font-black text-xs rounded-lg hover:brightness-110 transition-all"
              >
                View Patron Monster →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
