"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

interface FriendEntry {
  wallet: string;
  archetype: string;
  archetype_name: string;
  dna_distance: number;
  shared_tokens: number;
  monster_url: string;
}

interface FriendsData {
  wallet: string;
  friends: FriendEntry[];
  is_demo: boolean;
}

function FriendsContent() {
  const searchParams = useSearchParams();
  const initialWallet = searchParams.get("wallet") ?? "";
  const [wallet, setWallet] = useState(initialWallet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FriendsData | null>(null);

  const lookup = async (addr: string) => {
    if (!addr) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/friends?wallet=${encodeURIComponent(addr.trim().toLowerCase())}`);
      if (!resp.ok) {
        const err = await resp.json() as { error: string };
        throw new Error(err.error);
      }
      const result = await resp.json() as FriendsData;
      setData(result);
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
          <div className="text-[var(--neon-green)] font-black text-base tracking-widest">👥 FRIEND GRAPH</div>
          <div className="text-[10px] text-gray-600">monsters you&apos;ve traded alongside</div>
        </div>
        <div className="w-12" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <p className="text-gray-500 text-xs text-center mb-4">
          Enter a wallet to see which other monsters they&apos;ve shared tokens with —
          the degen social graph nobody asked for.
        </p>

        {/* Demo shortcuts */}
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {Object.entries(DEMO_WALLETS).slice(0, 5).map(([key, addr]) => (
            <button
              key={key}
              onClick={() => { setWallet(addr); lookup(addr); }}
              className="px-2 py-1 text-[9px] border border-gray-700 text-gray-500 rounded-full hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] transition-colors font-mono"
            >
              {key.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x wallet address"
            className="flex-1 px-3 py-2 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded text-xs text-white font-mono focus:border-[var(--neon-green)] outline-none"
          />
          <button
            onClick={() => lookup(wallet)}
            disabled={loading || !wallet}
            className="px-4 py-2 bg-[var(--neon-green)] text-black font-black text-xs rounded hover:brightness-110 transition-all disabled:opacity-40"
          >
            {loading ? "…" : "Find"}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/40 rounded text-red-400 text-xs text-center mb-4">{error}</div>
        )}

        {data && (
          <div>
            <div className="text-[10px] text-gray-600 mb-3 text-center">
              {data.friends.length} monsters found · sorted by shared tokens
              {data.is_demo && " (demo data)"}
            </div>
            <div className="space-y-2">
              {data.friends.map((friend) => {
                const color = ARCHETYPE_COLORS[friend.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#888";
                return (
                  <Link
                    key={friend.wallet}
                    href={friend.monster_url}
                    className="flex items-center gap-3 p-3 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl hover:border-gray-500 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base shrink-0"
                      style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}
                    >
                      {friend.archetype_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-gray-500 truncate">{friend.wallet.slice(0, 8)}…{friend.wallet.slice(-6)}</div>
                      <div className="text-xs font-black" style={{ color }}>{friend.archetype_name}</div>
                    </div>
                    <div className="text-right text-[9px] text-gray-600 shrink-0">
                      <div className="text-[var(--neon-green)]">{friend.shared_tokens} tokens</div>
                      <div>dist {friend.dna_distance}</div>
                    </div>
                  </Link>
                );
              })}
              {data.friends.length === 0 && (
                <div className="text-center text-gray-600 text-sm py-8">
                  No friend monsters found yet. Analyze more wallets first.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--degen-bg)] flex items-center justify-center text-gray-600">Loading…</div>}>
      <FriendsContent />
    </Suspense>
  );
}
