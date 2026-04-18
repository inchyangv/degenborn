"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";
import { runBattle } from "@/lib/battle-engine";
import type { BattleResult, BattleSoulInput } from "@/lib/battle-engine";
import Link from "next/link";
import html2canvas from "html2canvas";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

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

function toSoulInput(wallet: string, data: MonsterData): BattleSoulInput {
  return {
    wallet,
    archetype: data.archetype.archetype,
    name: data.archetype.profile.name,
    dna: {
      aggression: data.dna.aggression,
      conviction: data.dna.conviction,
      chaos: data.dna.chaos,
      luck: data.dna.luck,
      survival: data.dna.survival,
    },
    level: data.state.level,
  };
}

const SAMPLE_WALLETS = [
  { label: "Rug Necromancer", wallet: DEMO_WALLETS.rug_necromancer },
  { label: "Ice Whale", wallet: DEMO_WALLETS.ice_whale },
  { label: "Mad Gambler", wallet: DEMO_WALLETS.mad_gambler },
  { label: "Sniper Jester", wallet: DEMO_WALLETS.sniper_jester },
  { label: "Ghost Bagholder", wallet: DEMO_WALLETS.ghost_bagholder },
];

function BattleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const walletA = searchParams.get("a") ?? "";
  const walletB = searchParams.get("b") ?? "";

  const [inputA, setInputA] = useState(walletA);
  const [inputB, setInputB] = useState(walletB);
  const [dataA, setDataA] = useState<MonsterData | null>(null);
  const [dataB, setDataB] = useState<MonsterData | null>(null);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundIdx, setRoundIdx] = useState(-1);
  const [animating, setAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!walletA || !walletB) return;
    setInputA(walletA);
    setInputB(walletB);
    setLoading(true);
    setError(null);
    setResult(null);
    setRoundIdx(-1);
    Promise.all([loadMonster(walletA), loadMonster(walletB)])
      .then(([a, b]) => {
        setDataA(a);
        setDataB(b);
        const battle = runBattle(toSoulInput(walletA, a), toSoulInput(walletB, b));
        setResult(battle);
        // animate rounds
        setAnimating(true);
        let i = 0;
        const tick = () => {
          setRoundIdx(i);
          i++;
          if (i < battle.rounds.length) setTimeout(tick, 1200);
          else { setTimeout(() => setAnimating(false), 600); }
        };
        setTimeout(tick, 400);
      })
      .catch((e: Error) => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, [walletA, walletB]);

  const handleFight = () => {
    if (!inputA.trim() || !inputB.trim()) return;
    router.push(`/battle?a=${encodeURIComponent(inputA.trim())}&b=${encodeURIComponent(inputB.trim())}`);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0a0a0f", scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `degenborn_battle_${(walletA || "a").slice(0, 8)}_vs_${(walletB || "b").slice(0, 8)}.png`;
    link.click();
  };

  const colorA = dataA ? (ARCHETYPE_COLORS[dataA.archetype.archetype] ?? "#9945ff") : "#9945ff";
  const colorB = dataB ? (ARCHETYPE_COLORS[dataB.archetype.archetype] ?? "#00d4ff") : "#00d4ff";

  return (
    <div className="min-h-screen pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between py-4 mb-4 border-b border-[var(--degen-border)]">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          <div className="text-xs font-mono text-[var(--neon-gold)] uppercase tracking-widest">Soul Battle</div>
          <Link href="/gallery" className="text-xs text-gray-600 hover:text-gray-400">Gallery →</Link>
        </div>

        {/* Input form */}
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-5 mb-6">
          <div className="text-xs text-gray-600 uppercase tracking-widest mb-4">Enter two wallets to battle</div>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              placeholder="Wallet A address"
              className="flex-1 bg-[var(--degen-muted)] border border-[var(--degen-border)] rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--neon-purple)]"
            />
            <span className="text-gray-600 self-center font-black text-lg hidden sm:block">⚔</span>
            <input
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              placeholder="Wallet B address"
              className="flex-1 bg-[var(--degen-muted)] border border-[var(--degen-border)] rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[var(--neon-gold)]"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-700 self-center">Sample:</span>
            {SAMPLE_WALLETS.map((s) => (
              <button
                key={s.wallet}
                onClick={() => {
                  if (!inputA || inputA === s.wallet) { setInputA(s.wallet); }
                  else if (!inputB || inputB === s.wallet) { setInputB(s.wallet); }
                  else setInputB(s.wallet);
                }}
                className="px-2 py-0.5 text-xs border border-[var(--degen-border)] text-gray-500 rounded-full hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleFight}
            disabled={!inputA.trim() || !inputB.trim()}
            className="w-full py-3 bg-[var(--neon-gold)] text-black font-black text-sm rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
          >
            ⚔ START BATTLE
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500 font-mono text-sm">
            Loading souls...
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-[var(--neon-red)] text-sm">{error}</div>
        )}

        {dataA && dataB && result && (
          <>
            {/* Battle card — downloadable */}
            <div ref={cardRef} className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl overflow-hidden mb-6">
              {/* Header */}
              <div className="text-center py-3 border-b border-[var(--degen-border)] bg-[var(--degen-muted)]">
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Soul Battle</div>
              </div>

              {/* VS arena */}
              <div className="flex items-stretch">
                {/* Fighter A */}
                <div
                  className="flex-1 flex flex-col items-center py-8 px-4"
                  style={{ background: `radial-gradient(circle at 60% 40%, ${colorA}18, transparent)` }}
                >
                  <CharacterDisplay
                    archetype={dataA.archetype.archetype}
                    state={result.winner === "A" ? { ...dataA.state, active_traits: [...(dataA.state.active_traits ?? []), "crown"] } : dataA.state}
                    wallet={walletA}
                    size={140}
                  />
                  <div className="mt-3 text-center">
                    <div className="font-black text-white text-base">{dataA.archetype.profile.name}</div>
                    <div className="text-xs font-mono" style={{ color: colorA }}>
                      Lv {dataA.state.level}
                    </div>
                    {result.winner === "A" && (
                      <div className="mt-1 text-xs font-black text-[var(--neon-gold)]">👑 WINNER</div>
                    )}
                    {result.winner === "B" && (
                      <div className="mt-1 text-xs text-gray-600">defeated</div>
                    )}
                  </div>
                  <div className="mt-2 text-2xl font-black" style={{ color: colorA }}>
                    {result.score_a}
                  </div>
                </div>

                {/* VS divider */}
                <div className="flex flex-col items-center justify-center px-4 border-x border-[var(--degen-border)]">
                  <div className="text-xl font-black text-gray-600">VS</div>
                </div>

                {/* Fighter B */}
                <div
                  className="flex-1 flex flex-col items-center py-8 px-4"
                  style={{ background: `radial-gradient(circle at 40% 40%, ${colorB}18, transparent)` }}
                >
                  <CharacterDisplay
                    archetype={dataB.archetype.archetype}
                    state={result.winner === "B" ? { ...dataB.state, active_traits: [...(dataB.state.active_traits ?? []), "crown"] } : dataB.state}
                    wallet={walletB}
                    size={140}
                  />
                  <div className="mt-3 text-center">
                    <div className="font-black text-white text-base">{dataB.archetype.profile.name}</div>
                    <div className="text-xs font-mono" style={{ color: colorB }}>
                      Lv {dataB.state.level}
                    </div>
                    {result.winner === "B" && (
                      <div className="mt-1 text-xs font-black text-[var(--neon-gold)]">👑 WINNER</div>
                    )}
                    {result.winner === "A" && (
                      <div className="mt-1 text-xs text-gray-600">defeated</div>
                    )}
                  </div>
                  <div className="mt-2 text-2xl font-black" style={{ color: colorB }}>
                    {result.score_b}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="text-center py-4 border-t border-[var(--degen-border)] bg-[var(--degen-muted)]">
                {result.winner === "DRAW" ? (
                  <div className="text-sm font-mono text-gray-400">DRAW — two mirrors, one chain</div>
                ) : (
                  <div className="text-sm font-mono" style={{ color: result.winner === "A" ? colorA : colorB }}>
                    {result.winner === "A" ? dataA.archetype.profile.name : dataB.archetype.profile.name} wins
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1 italic">{result.summary_en}</div>
              </div>
            </div>

            {/* Round log */}
            <div className="mb-6">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Battle Log</div>
              <div className="space-y-3">
                {result.rounds.map((r, i) => (
                  <div
                    key={r.round}
                    className={`bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-4 transition-all duration-500 ${
                      i <= roundIdx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-600 font-mono uppercase">Round {r.round}</div>
                      <div
                        className="text-xs font-black"
                        style={{
                          color: r.result === "A_WINS" ? colorA : r.result === "B_WINS" ? colorB : "var(--neon-gold)",
                        }}
                      >
                        {r.result === "A_WINS"
                          ? `${dataA.archetype.profile.name} wins`
                          : r.result === "B_WINS"
                          ? `${dataB.archetype.profile.name} wins`
                          : "DRAW"}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 italic">{r.description}</div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-600 mb-0.5" style={{ color: colorA }}>
                          {dataA.archetype.profile.name}
                        </div>
                        <div className="text-xs text-gray-300 italic">&ldquo;{r.dialogue_a.en}&rdquo;</div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-[10px] text-gray-600 mb-0.5" style={{ color: colorB }}>
                          {dataB.archetype.profile.name}
                        </div>
                        <div className="text-xs text-gray-300 italic">&ldquo;{r.dialogue_b.en}&rdquo;</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 bg-[var(--neon-gold)] text-black font-black text-sm rounded-lg hover:brightness-110 transition-all"
              >
                ↓ Download PNG
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/battle?a=${encodeURIComponent(walletA)}&b=${encodeURIComponent(walletB)}`;
                  navigator.clipboard.writeText(url);
                }}
                className="px-5 py-2.5 border border-[var(--degen-border)] text-gray-400 font-bold text-sm rounded-lg hover:border-gray-400 hover:text-white transition-colors"
              >
                🔗 Copy Link
              </button>
              <Link
                href={`/monster?wallet=${walletA}`}
                className="px-5 py-2.5 border rounded-lg text-sm font-bold transition-colors hover:brightness-125"
                style={{ borderColor: `${colorA}55`, color: colorA }}
              >
                View A's Soul →
              </Link>
              <Link
                href={`/monster?wallet=${walletB}`}
                className="px-5 py-2.5 border rounded-lg text-sm font-bold transition-colors hover:brightness-125"
                style={{ borderColor: `${colorB}55`, color: colorB }}
              >
                View B's Soul →
              </Link>
            </div>
          </>
        )}

        {/* Default state */}
        {!walletA && !walletB && !loading && (
          <div className="text-center py-10 text-gray-600 text-sm">
            Enter two wallet addresses above to start a deterministic soul battle.
            <br />
            Same wallets → same result every time.
          </div>
        )}
      </div>
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600 text-sm">Loading...</div>}>
      <BattleContent />
    </Suspense>
  );
}
