"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId, Mood, TraitId } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

/**
 * /family/[wallet] — Creator-Monster Family Tree (TODO 2.3)
 *
 * Shows the "family" spawned from a creator wallet:
 *  - Parent: the creator monster
 *  - Children: monsters of wallets that traded the creator's tokens
 *
 * In demo mode: uses archetype fixtures for child monsters.
 */

type ArchetypeIdStr = ArchetypeId;

interface MonsterCard {
  wallet: string;
  archetype: ArchetypeIdStr;
  archetype_name: string;
  level: number;
  token_symbol?: string;
}

// Deterministic child derivation for demo
function deriveChildren(wallet: string): MonsterCard[] {
  const CHILD_ORDER: ArchetypeIdStr[] = [
    "mad_gambler", "ghost_bagholder", "sniper_jester",
    "diamond_cultist", "rug_necromancer", "ice_whale",
  ];
  const CHILD_WALLETS: Record<ArchetypeIdStr, string> = {
    mad_gambler: DEMO_WALLETS.mad_gambler,
    ghost_bagholder: DEMO_WALLETS.ghost_bagholder,
    sniper_jester: DEMO_WALLETS.sniper_jester,
    diamond_cultist: DEMO_WALLETS.diamond_cultist,
    rug_necromancer: DEMO_WALLETS.rug_necromancer,
    ice_whale: DEMO_WALLETS.ice_whale,
  };
  const TOKENS = ["$BONK", "$PEPE", "$DOGE", "$APE", "$MOON", "$CHAD"];

  let h = 5381;
  for (let i = 0; i < wallet.length; i++) {
    h = ((h << 5) + h) ^ wallet.charCodeAt(i);
    h = h >>> 0;
  }
  const count = 3 + (h % 4); // 3–6 children
  const offset = h % CHILD_ORDER.length;
  const ordered = [...CHILD_ORDER.slice(offset), ...CHILD_ORDER.slice(0, offset)];

  return ordered.slice(0, count).map((arc, i) => ({
    wallet: CHILD_WALLETS[arc],
    archetype: arc,
    archetype_name: ARCHETYPE_PROFILES[arc].name,
    level: 1 + ((h + i) % 5),
    token_symbol: TOKENS[(h + i) % TOKENS.length],
  }));
}

interface AnalyzeResult {
  archetype?: { archetype: ArchetypeIdStr; profile: { name: string } };
  creator_stats?: { tokens_created: number; created_tokens: { symbol?: string }[] };
  derived_state?: { level: number; mood: string; active_traits: string[]; scar_count: number; crown_count: number; corruption: number; prestige: number; survival_streak: number };
}

export default function FamilyPage() {
  const params = useParams<{ wallet: string }>();
  const wallet = params?.wallet?.toLowerCase() ?? "";

  const [parentData, setParentData] = useState<AnalyzeResult | null>(null);
  const [children, setChildren] = useState<MonsterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, useFixture: true }),
        });
        if (!res.ok) throw new Error("Analysis failed");
        const data: AnalyzeResult = await res.json();
        setParentData(data);
        // In demo mode, derive children from wallet hash
        setChildren(deriveChildren(wallet));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [wallet]);

  const parentArchetype = parentData?.archetype?.archetype ?? "rug_necromancer";
  const parentName = parentData?.archetype?.profile?.name ?? "Unknown Monster";
  const parentColor = (ARCHETYPE_COLORS as Record<string, string>)[parentArchetype] ?? "#9945ff";
  const tokensCreated = parentData?.creator_stats?.tokens_created ?? 0;
  const parentState = parentData?.derived_state ?? {
    wallet_address: wallet,
    archetype: parentArchetype,
    level: 1,
    mood: "neutral" as Mood,
    corruption: 0,
    prestige: 0,
    scar_count: 0,
    crown_count: 0,
    survival_streak: 0,
    active_traits: [],
    updated_at: 0,
  };

  const shortWallet = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";

  return (
    <main className="min-h-screen px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/monster?wallet=${wallet}`} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to Monster Room
          </Link>
        </div>

        <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-2">
          Creator Family Tree
        </div>
        <h1 className="text-3xl font-black text-white text-center mb-1">
          {shortWallet}&apos;s <span style={{ color: parentColor }}>Monster Dynasty</span>
        </h1>
        <p className="text-sm text-gray-600 text-center mb-10">
          Tokens launched → traders who bought → monsters spawned
        </p>

        {loading && (
          <div className="text-center text-gray-600 font-mono text-sm py-16">
            Loading family tree...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 text-sm py-8">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Parent (creator) */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="bg-[var(--degen-card)] border-2 rounded-2xl p-6 w-full max-w-sm text-center"
                style={{ borderColor: `${parentColor}66` }}
              >
                <div className="text-xs uppercase tracking-widest mb-3" style={{ color: parentColor }}>
                  Creator / Parent
                </div>
                <div className="flex justify-center mb-4">
                  <CharacterDisplay
                    archetype={parentArchetype as ArchetypeId}
                    state={{ ...parentState, wallet_address: wallet, archetype: parentArchetype as ArchetypeId, mood: (parentState.mood as Mood) ?? "neutral", active_traits: (parentState.active_traits ?? []) as TraitId[], updated_at: Date.now() / 1000 }}
                    wallet={wallet}
                    size={160}
                  />
                </div>
                <div className="font-black text-white text-lg">{parentName}</div>
                <div className="font-mono text-xs text-gray-600 mb-3">{shortWallet}</div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black border"
                  style={{ borderColor: `${parentColor}44`, color: parentColor, background: `${parentColor}11` }}
                >
                  🚀 {tokensCreated > 0 ? `${tokensCreated} token${tokensCreated !== 1 ? "s" : ""}` : "Tokens"} launched
                </div>
              </div>
            </div>

            {/* Connector line */}
            {children.length > 0 && (
              <div className="flex flex-col items-center mb-6">
                <div className="w-0.5 h-8 bg-gradient-to-b" style={{ background: `linear-gradient(to bottom, ${parentColor}66, transparent)` }} />
                <div className="text-xs text-gray-600 font-mono">
                  {children.length} child monster{children.length !== 1 ? "s" : ""} spawned
                </div>
                <div className="w-0.5 h-8 bg-gradient-to-b" style={{ background: `linear-gradient(to bottom, transparent, #9945ff33)` }} />
              </div>
            )}

            {/* Children grid */}
            {children.length > 0 && (
              <>
                <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-4">
                  Children — Traders who bought the creator&apos;s tokens
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  {children.map((child) => {
                    const childColor = (ARCHETYPE_COLORS as Record<string, string>)[child.archetype] ?? "#9945ff";
                    const childShort = `${child.wallet.slice(0, 6)}...${child.wallet.slice(-4)}`;
                    return (
                      <Link
                        key={child.wallet}
                        href={`/m/${child.wallet}`}
                        className="bg-[var(--degen-card)] border rounded-2xl p-4 text-center hover:scale-[1.02] transition-all"
                        style={{ borderColor: `${childColor}33` }}
                      >
                        <CharacterDisplay
                          archetype={child.archetype}
                          state={{
                            wallet_address: child.wallet,
                            archetype: child.archetype,
                            level: child.level,
                            mood: "neutral" as Mood,
                            corruption: 0,
                            prestige: 0,
                            scar_count: 0,
                            crown_count: 0,
                            survival_streak: 0,
                            active_traits: [],
                            updated_at: 0,
                          }}
                          wallet={child.wallet}
                          size={100}
                          showTraitBadges={false}
                        />
                        <div className="font-black text-white text-sm mt-2 leading-tight">{child.archetype_name}</div>
                        <div className="font-mono text-[10px] text-gray-700 mt-0.5">{childShort}</div>
                        {child.token_symbol && (
                          <div className="text-[10px] mt-1" style={{ color: childColor }}>
                            via {child.token_symbol}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-600 mt-0.5">Lv.{child.level}</div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {/* Stats summary */}
            <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">Dynasty Stats</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-white">{tokensCreated}</div>
                  <div className="text-xs text-gray-600">Tokens Launched</div>
                </div>
                <div>
                  <div className="text-2xl font-black" style={{ color: parentColor }}>{children.length}</div>
                  <div className="text-xs text-gray-600">Child Monsters</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {children.reduce((s, c) => s + c.level, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Total Dynasty XP</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-6 text-[10px] text-gray-700">
              Demo mode — real family trees populate as wallets are analyzed · DegenBorn × Four.meme
            </div>
          </>
        )}
      </div>
    </main>
  );
}
