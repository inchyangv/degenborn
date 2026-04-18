"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";

interface PackMember {
  wallet: string;
  archetype: string;
  archetype_name: string;
  dna_summary: { aggression: number; conviction: number; chaos: number; luck: number; survival: number };
  mood: string;
}

interface PackData {
  token_address: string | null;
  pack_name: string;
  member_count: number;
  members: PackMember[];
  avg_dna: { aggression: number; conviction: number; chaos: number; luck: number; survival: number };
  pack_mood: string;
  is_demo: boolean;
}

const MOOD_EMOJI: Record<string, string> = {
  neutral: "😐", greed: "🤑", despair: "💀", revenge: "😤", euphoria: "🚀", ghost: "👻",
};

const DEMO_TOKENS = [
  { address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", symbol: "WBNB" },
  { address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", symbol: "CAKE" },
];

export default function PackPage() {
  const [tokenAddr, setTokenAddr] = useState("");
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<PackData | null>(null);

  useEffect(() => {
    // Load default pack on mount
    fetch("/api/pack").then((r) => r.json()).then((d) => setPack(d as PackData)).catch(() => null);
  }, []);

  const lookup = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tokenAddr) params.set("token", tokenAddr.trim().toLowerCase());
      if (symbol) params.set("symbol", symbol.trim());
      const resp = await fetch(`/api/pack?${params}`);
      if (!resp.ok) throw new Error("Pack lookup failed");
      const data = await resp.json() as PackData;
      setPack(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const archetypeCount = pack ? Object.entries(
    pack.members.reduce((acc, m) => { acc[m.archetype] = (acc[m.archetype] ?? 0) + 1; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="min-h-screen bg-[var(--degen-bg)] text-white pb-16">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-center">
          <div className="text-[var(--neon-purple)] font-black text-base tracking-widest">🐺 PACK / CULT</div>
          <div className="text-[10px] text-gray-600">monsters united by shared tokens</div>
        </div>
        <div className="w-12" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Token input */}
        <div className="flex gap-2 mb-3">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol (e.g. PEPE)"
            className="w-24 px-2 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-purple)] outline-none"
          />
          <input
            value={tokenAddr}
            onChange={(e) => setTokenAddr(e.target.value)}
            placeholder="Token contract 0x…"
            className="flex-1 px-3 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-purple)] outline-none"
          />
          <button
            onClick={lookup}
            disabled={loading}
            className="px-4 py-2 bg-[var(--neon-purple)] text-white font-black text-xs rounded hover:brightness-110 transition-all disabled:opacity-40"
          >
            {loading ? "…" : "Find"}
          </button>
        </div>
        <div className="flex gap-2 mb-6">
          {DEMO_TOKENS.map((t) => (
            <button
              key={t.address}
              onClick={() => { setTokenAddr(t.address); setSymbol(t.symbol); }}
              className="px-3 py-1 text-[10px] border border-gray-700 text-gray-400 rounded-full hover:border-[var(--neon-purple)] hover:text-[var(--neon-purple)] transition-colors"
            >
              ${t.symbol}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/40 rounded text-red-400 text-xs text-center mb-4">{error}</div>
        )}

        {pack && (
          <div className="space-y-4">
            {/* Pack header */}
            <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-black text-base text-[var(--neon-purple)]">{pack.pack_name}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    {pack.member_count} members · Pack mood: {MOOD_EMOJI[pack.pack_mood] ?? "😐"} {pack.pack_mood}
                    {pack.is_demo && " · demo data"}
                  </div>
                </div>
                <div className="text-3xl">{MOOD_EMOJI[pack.pack_mood] ?? "😐"}</div>
              </div>
            </div>

            {/* Average DNA */}
            <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-black mb-3 tracking-widest">PACK DNA AVERAGE</div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {Object.entries(pack.avg_dna).map(([key, val]) => (
                  <div key={key}>
                    <div className="text-[var(--neon-green)] font-black text-base">{val}</div>
                    <div className="text-gray-600 text-[9px] capitalize">{key.slice(0, 4)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Archetype breakdown */}
            {archetypeCount.length > 0 && (
              <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4">
                <div className="text-[10px] text-gray-500 font-black mb-3 tracking-widest">PACK COMPOSITION</div>
                <div className="space-y-2">
                  {archetypeCount.map(([archetype, count]) => {
                    const color = ARCHETYPE_COLORS[archetype as keyof typeof ARCHETYPE_COLORS] ?? "#888";
                    const name = ARCHETYPE_PROFILES[archetype as keyof typeof ARCHETYPE_PROFILES]?.name ?? archetype;
                    const pct = Math.round((count / pack.member_count) * 100);
                    return (
                      <div key={archetype}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span style={{ color }}>{name}</span>
                          <span className="text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Member list */}
            <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--degen-border)]">
                <div className="text-[10px] text-gray-500 font-black tracking-widest">PACK MEMBERS</div>
              </div>
              <div className="divide-y divide-[var(--degen-border)]">
                {pack.members.slice(0, 10).map((m) => {
                  const color = ARCHETYPE_COLORS[m.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#888";
                  return (
                    <Link
                      key={m.wallet}
                      href={`/monster?wallet=${m.wallet}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--degen-muted)] transition-colors"
                    >
                      <div className="text-lg">{MOOD_EMOJI[m.mood] ?? "😐"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-gray-400 truncate">{m.wallet.slice(0, 8)}…{m.wallet.slice(-6)}</div>
                        <div className="text-[10px] font-black" style={{ color }}>{m.archetype_name}</div>
                      </div>
                      <div className="text-[9px] text-gray-600 text-right">
                        <div>⚡{m.dna_summary.aggression}</div>
                        <div>🎲{m.dna_summary.chaos}</div>
                      </div>
                    </Link>
                  );
                })}
                {pack.members.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-600 text-xs">No pack members found for this token.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
