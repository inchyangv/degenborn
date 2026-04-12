"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PersonaDNA, ArchetypeResult, CharacterState, MutationEvent, DiaryPage } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";
import ShareCard from "@/components/ShareCard";
import { buildSoulShareLink } from "@/lib/challenge-link";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

export default function PublicMonsterView({ wallet }: { wallet: string }) {
  const [data, setData] = useState<MonsterData | null>(null);
  const [diary, setDiary] = useState<MutationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const fromWallet = searchParams.get("from");

  useEffect(() => {
    if (!wallet) return;
    const load = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, useFixture: true }),
        });
        const analyzed = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult };
        const { createInitialState } = await import("@/lib/state-machine");
        const state = createInitialState(wallet.toLowerCase(), analyzed.archetype.archetype as any);
        setData({ dna: analyzed.dna, archetype: analyzed.archetype, state });

        const diaryResp = await fetch(`/api/diary?wallet=${wallet.toLowerCase()}`);
        if (diaryResp.ok) {
          const page = await diaryResp.json() as DiaryPage;
          setDiary(page.entries);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wallet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--neon-green)] text-sm font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 text-sm">Monster not found</div>
        <Link href="/" className="text-gray-400 hover:text-white text-xs">← Back home</Link>
      </div>
    );
  }

  const { dna, archetype, state } = data;
  const glowBase = ARCHETYPE_COLORS[archetype.archetype as keyof typeof ARCHETYPE_COLORS] ?? "#9945ff";

  return (
    <div className="min-h-screen pb-12">
      {/* Read-only banner */}
      <div className="flex justify-center py-2 bg-[var(--degen-muted)] border-b border-[var(--degen-border)]">
        <span className="text-xs text-gray-500 font-mono">
          👁 Public view · {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </span>
      </div>

      {/* Challenge banner — shown when visitor arrived via ?from= link */}
      {fromWallet && fromWallet !== wallet.toLowerCase() && (
        <div className="flex justify-center py-2 px-4 border-b border-[var(--degen-border)]" style={{ background: `${glowBase}10` }}>
          <span className="text-xs font-mono" style={{ color: glowBase }}>
            ⚔ {fromWallet.slice(0, 6)}...{fromWallet.slice(-4)} has challenged you to reveal your soul →{" "}
            <Link href={`/?from=${fromWallet}`} className="underline opacity-80 hover:opacity-100">
              Connect your wallet
            </Link>
          </span>
        </div>
      )}

      {/* Character hero */}
      <div
        className="flex flex-col items-center gap-4 py-10"
        style={{ background: `radial-gradient(circle at 50% 40%, ${glowBase}22, transparent 70%)` }}
      >
        <CharacterDisplay
          archetype={archetype.archetype as any}
          state={state}
          wallet={wallet}
          size={300}
        />
        <div className="text-center">
          <h1 className="text-3xl font-black text-white">{archetype.profile.name}</h1>
          <div className="text-[var(--neon-green)] text-sm font-mono">"{archetype.profile.tagline}"</div>
        </div>
        {diary.length > 0 && (
          <div className="text-3xl font-black text-[var(--neon-purple)]">
            {diary.length}
            <span className="text-sm font-mono text-gray-500 ml-2">mutations</span>
          </div>
        )}
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {/* Share card */}
        <ShareCard dna={dna} archetype={archetype} state={state} wallet={wallet} />

        {/* Recent mutations */}
        {diary.length > 0 && (
          <div className="mt-6">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Recent Mutations</div>
            <div className="space-y-2">
              {diary.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-lg p-3"
                >
                  <div className="text-xs text-[var(--neon-purple)] uppercase mb-1">{entry.reason}</div>
                  <div className="text-sm text-gray-300 italic">"{entry.generated_caption}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500 mb-3">Want your own monster?</div>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-green)] text-black font-black rounded-xl hover:brightness-110 transition-all"
          >
            Connect Wallet →
          </Link>
        </div>
      </div>
    </div>
  );
}
