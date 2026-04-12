"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import CharacterDisplay from "@/components/CharacterDisplay";
import SummoningBanner from "@/components/SummoningBanner";
import type { CharacterState, ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";

const SAMPLE_MONSTERS: Array<{
  archetype: ArchetypeId;
  wallet: string;
  wallet_short: string;
  state: CharacterState;
}> = [
  {
    archetype: "rug_necromancer",
    wallet: "0xrugnecromancer000000000000000000000000001",
    wallet_short: "0xrugN...0001",
    state: {
      wallet_address: "0xrugnecromancer000000000000000000000000001",
      archetype: "rug_necromancer",
      level: 5,
      mood: "revenge",
      corruption: 40,
      prestige: 15,
      scar_count: 2,
      crown_count: 1,
      survival_streak: 3,
      active_traits: ["zombie_eyes", "crown", "revenge_aura", "bandage"],
      updated_at: 1712700000,
    },
  },
  {
    archetype: "ice_whale",
    wallet: "0xicewhale000000000000000000000000000000001",
    wallet_short: "0xiceW...0001",
    state: {
      wallet_address: "0xicewhale000000000000000000000000000000001",
      archetype: "ice_whale",
      level: 7,
      mood: "neutral",
      corruption: 0,
      prestige: 75,
      scar_count: 0,
      crown_count: 3,
      survival_streak: 2,
      active_traits: ["crown", "gold_chain", "royal_cloak", "gold_tooth"],
      updated_at: 1712700000,
    },
  },
  {
    archetype: "mad_gambler",
    wallet: "0xmadgambler0000000000000000000000000000001",
    wallet_short: "0xmadG...0001",
    state: {
      wallet_address: "0xmadgambler0000000000000000000000000000001",
      archetype: "mad_gambler",
      level: 3,
      mood: "greed",
      corruption: 0,
      prestige: 10,
      scar_count: 1,
      crown_count: 1,
      survival_streak: 0,
      active_traits: ["crown", "torn_clothes"],
      updated_at: 1712700000,
    },
  },
  {
    archetype: "sniper_jester",
    wallet: "0xsniperjester000000000000000000000000001",
    wallet_short: "0xsniJ...0001",
    state: {
      wallet_address: "0xsniperjester000000000000000000000000001",
      archetype: "sniper_jester",
      level: 4,
      mood: "euphoria",
      corruption: 5,
      prestige: 25,
      scar_count: 0,
      crown_count: 2,
      survival_streak: 1,
      active_traits: ["crown", "gold_tooth"],
      updated_at: 1712700000,
    },
  },
  {
    archetype: "ghost_bagholder",
    wallet: "0xghostbagholder00000000000000000000000001",
    wallet_short: "0xghst...0001",
    state: {
      wallet_address: "0xghostbagholder00000000000000000000000001",
      archetype: "ghost_bagholder",
      level: 2,
      mood: "ghost",
      corruption: 60,
      prestige: 0,
      scar_count: 3,
      crown_count: 0,
      survival_streak: 0,
      active_traits: ["bandage", "torn_clothes", "zombie_eyes"],
      updated_at: 1712700000,
    },
  },
];

const FLOW_STEPS = [
  { label: "Connect", color: "var(--neon-green)" },
  { label: "Analyze", color: "var(--neon-purple)" },
  { label: "Meet Your Monster", color: "var(--neon-gold)" },
];

function MonsterCarousel() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % SAMPLE_MONSTERS.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const m = SAMPLE_MONSTERS[idx]!;
  const color = ARCHETYPE_COLORS[m.archetype] ?? "#9945ff";
  const profile = ARCHETYPE_PROFILES[m.archetype];

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: color }}
      />
      <div
        className="transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.92)" }}
      >
        <CharacterDisplay
          archetype={m.archetype}
          state={m.state}
          wallet={m.wallet}
          size={220}
        />
      </div>
      <div
        className="mt-3 text-center transition-all duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="font-black text-white text-lg">{profile.name}</div>
        <div className="text-xs font-mono" style={{ color }}>
          &ldquo;{profile.tagline}&rdquo;
        </div>
      </div>
      {/* Context line */}
      <div
        className="text-[10px] text-gray-600 text-center mt-2 px-2 max-w-[200px] leading-relaxed transition-all duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {m.state.scar_count >= 2
          ? `This trader survived ${m.state.scar_count} rugs. Now they're a ${m.archetype}.`
          : m.state.crown_count >= 1
          ? `${m.state.crown_count} win streak${m.state.crown_count > 1 ? "s" : ""}. This is what a ${m.archetype} looks like.`
          : `On-chain activity, turned into a living identity.`}
      </div>
      {/* Dot indicators */}
      <div className="flex gap-1.5 mt-4">
        {SAMPLE_MONSTERS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 300); }}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i === idx ? color : "#333" }}
            aria-label={`Show monster ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const fromWallet = searchParams.get("from");

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleAnalyze = () => {
    if (!address) return;
    setAnalyzeLoading(true);
    router.push(`/birth?wallet=${address}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pb-16 relative overflow-x-hidden">
      {/* Summoning banner — shown when visitor arrives via challenge link */}
      {fromWallet && (
        <div className="w-full max-w-md mt-6 mb-2">
          <SummoningBanner
            fromWallet={fromWallet}
            onConnect={!isConnected ? handleConnect : undefined}
          />
        </div>
      )}

      {/* ═══ HERO — first 10 seconds ═══ */}
      <section className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10 pt-14 pb-10">
        {/* Left — text + CTA */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-xs tracking-[0.4em] text-[var(--neon-purple)] mb-4 uppercase">
            Four.meme × AI Identity Engine
          </div>
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight text-white mb-5 glitch-text"
            data-text="DEGENBORN"
          >
            DEGEN<span className="text-[var(--neon-green)]">BORN</span>
          </h1>

          {/* Flow line — Wallet → Persona DNA → Soul Core */}
          <div className="flex items-center gap-2 mb-6 flex-wrap justify-center md:justify-start">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-black border"
                  style={{ color: step.color, borderColor: `${step.color}55`, background: `${step.color}11` }}
                >
                  {step.label}
                </span>
                {i < FLOW_STEPS.length - 1 && (
                  <span className="text-gray-700 font-mono text-sm">→</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-base max-w-sm mb-8">
            Connect your wallet. See what kind of trader you really are.
          </p>

          {/* CTA block */}
          {!isConnected ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleConnect}
                disabled={isPending}
                className="px-8 py-4 bg-[var(--neon-green)] text-black font-black text-base rounded-lg hover:brightness-110 transition-all disabled:opacity-50 w-full sm:w-auto"
              >
                {isPending ? "CONNECTING..." : "CONNECT WALLET"}
              </button>
              <Link
                href="/replay"
                className="px-8 py-4 border-2 border-[var(--neon-purple)] text-[var(--neon-purple)] font-black text-base rounded-lg hover:brightness-125 transition-all text-center"
              >
                ▶ Try Replay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center md:items-start gap-3 w-full">
              <div className="text-sm text-[var(--neon-green)] font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)} ✓
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzeLoading}
                  className="px-8 py-4 bg-[var(--neon-purple)] text-white font-black text-base rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {analyzeLoading ? "AWAKENING..." : "AWAKEN MY MONSTER"}
                </button>
                <Link
                  href="/replay"
                  className="px-8 py-4 border-2 border-[var(--neon-purple)] text-[var(--neon-purple)] font-black text-base rounded-lg hover:brightness-125 transition-all text-center"
                >
                  ▶ Try Replay
                </Link>
              </div>
              <button
                onClick={() => disconnect()}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                disconnect
              </button>
            </div>
          )}
        </div>

        {/* Right — cycling monster carousel */}
        <div className="flex-shrink-0 w-64 md:w-72">
          <MonsterCarousel />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-4xl border-t border-[var(--degen-border)] mb-10" />

      {/* ═══ How it works ═══ */}
      <section className="w-full max-w-4xl mb-14">
        <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-6">How it works</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🔗", title: "Connect", desc: "Link your wallet. We read your Four.meme activity." },
            { icon: "🧬", title: "Awaken", desc: "5 DNA axes are computed. Your archetype is revealed." },
            { icon: "⚡", title: "Evolve", desc: "Every trade shapes your monster. Traits. Scars. Crowns." },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-5 text-center"
            >
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="font-black text-white mb-1">{step.title}</div>
              <div className="text-sm text-gray-500">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Gallery strip (all 5 sample monsters) ═══ */}
      <section className="w-full max-w-4xl mb-14">
        <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-6">Sample monsters</div>
        <div className="flex gap-4 overflow-x-auto pb-2 justify-center flex-wrap md:flex-nowrap">
          {SAMPLE_MONSTERS.map((m) => {
            const profile = ARCHETYPE_PROFILES[m.archetype];
            const color = ARCHETYPE_COLORS[m.archetype] ?? "#9945ff";
            return (
              <Link
                key={m.wallet}
                href={`/monster?wallet=${m.wallet}`}
                className="flex-shrink-0 bg-[var(--degen-card)] border rounded-2xl overflow-hidden hover:scale-[1.03] transition-all w-44"
                style={{ borderColor: `${color}44` }}
              >
                <div
                  className="flex items-center justify-center py-4"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${color}22, #0a0a0f)` }}
                >
                  <CharacterDisplay
                    archetype={m.archetype}
                    state={m.state}
                    wallet={m.wallet}
                    size={100}
                  />
                </div>
                <div className="p-3 text-center">
                  <div className="font-black text-white text-sm leading-tight">{profile.name}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color }}>
                    Lv {m.state.level}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ Secondary links ═══ */}
      <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600 mb-10">
        <Link href="/gallery" className="hover:text-[var(--neon-green)] transition-colors">
          → Monster Gallery
        </Link>
        <Link href="/studio" className="hover:text-[var(--neon-purple)] transition-colors">
          → Meme Studio
        </Link>
        <Link href="/certificate/0xrugnecromancer000000000000000000000000001" className="hover:text-[var(--neon-gold)] transition-colors">
          → Birth Certificate
        </Link>
        <Link href="/graveyard" className="hover:text-[var(--neon-red)] transition-colors">
          → Graveyard
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-700 space-y-1">
        <div>Built for Four.meme Hackathon · Chain: BNB Smart Chain</div>
        <div className="flex justify-center gap-4 mt-2 flex-wrap">
          <span
            className="text-gray-600 cursor-help underline decoration-dotted"
            title="Soul Core is your non-transferable on-chain identity NFT. Once minted, it is bound to your wallet forever."
          >
            What is Soul Core?
          </span>
          <span className="text-gray-800">·</span>
          <Link
            href="https://four.meme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            What is Four.meme?
          </Link>
          <span className="text-gray-800">·</span>
          <span
            className="text-gray-600 cursor-help underline decoration-dotted"
            title="5 axes: Aggression (trade frequency), Conviction (hold length), Chaos (volatility/rugs), Luck (exit timing), Survival (recovery rate). Each is normalized 0–100."
          >
            How is DNA calculated?
          </span>
        </div>
      </div>
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  );
}
