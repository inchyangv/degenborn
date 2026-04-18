"use client";

import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState, useEffect } from "react";
import Link from "next/link";
import CharacterDisplay from "@/components/CharacterDisplay";
import SummoningBanner from "@/components/SummoningBanner";
import type { CharacterState, ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";
import { DEMO_WALLETS } from "@/lib/demo-wallets";

const SAMPLE_MONSTERS: Array<{
  archetype: ArchetypeId;
  wallet: string;
  wallet_short: string;
  state: CharacterState;
}> = [
  {
    archetype: "rug_necromancer",
    wallet: DEMO_WALLETS.rug_necromancer,
    wallet_short: "0xrugN...0001",
    state: {
      wallet_address: DEMO_WALLETS.rug_necromancer,
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
    wallet: DEMO_WALLETS.ice_whale,
    wallet_short: "0xiceW...0001",
    state: {
      wallet_address: DEMO_WALLETS.ice_whale,
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
    wallet: DEMO_WALLETS.mad_gambler,
    wallet_short: "0xmadG...0001",
    state: {
      wallet_address: DEMO_WALLETS.mad_gambler,
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
    wallet: DEMO_WALLETS.sniper_jester,
    wallet_short: "0xsniJ...0001",
    state: {
      wallet_address: DEMO_WALLETS.sniper_jester,
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
    wallet: DEMO_WALLETS.ghost_bagholder,
    wallet_short: "0xghst...0001",
    state: {
      wallet_address: DEMO_WALLETS.ghost_bagholder,
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

const DEMO_PREVIEWS = [
  { label: "Rug Necromancer", emoji: "💀", key: "rug_necromancer" as const },
  { label: "Mad Gambler", emoji: "🎰", key: "mad_gambler" as const },
  { label: "Ice Whale", emoji: "🐋", key: "ice_whale" as const },
  { label: "Ghost Bagholder", emoji: "👻", key: "ghost_bagholder" as const },
];

interface LandingClientProps {
  fromWallet?: string | null;
}

export default function LandingClient({ fromWallet = null }: LandingClientProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [pasteWallet, setPasteWallet] = useState("");
  const [pasteError, setPasteError] = useState("");

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleAnalyze = () => {
    if (!address) return;
    setAnalyzeLoading(true);
    router.push(`/birth?wallet=${address}`);
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pasteWallet.trim();
    if (!trimmed) return;
    // Accepts 0x addresses (42 chars) or ENS-style aliases
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      setPasteError("Paste a valid 0x wallet address.");
      return;
    }
    setPasteError("");
    router.push(`/birth?wallet=${trimmed.toLowerCase()}`);
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
          <div className="flex flex-col items-center md:items-start gap-1 mb-4">
            <div className="text-xs tracking-[0.4em] text-[var(--neon-purple)] uppercase">
              Four.meme × AI Identity Engine
            </div>
            <div className="text-[10px] text-[var(--neon-green)] opacity-70 tracking-widest uppercase">
              ⚡ Powered by Four.meme
            </div>
          </div>
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight text-white mb-3 glitch-text"
            data-text="DEGENBORN"
          >
            DEGEN<span className="text-[var(--neon-green)]">BORN</span>
          </h1>

          {/* TF-06: Core positioning tagline */}
          <p className="text-sm text-gray-500 mb-5 max-w-sm italic leading-relaxed">
            Four.meme is where meme tokens are born.{" "}
            <span className="text-[var(--neon-green)] not-italic font-black">
              DegenBorn is where meme traders are born.
            </span>
          </p>

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
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <button
                onClick={handleConnect}
                disabled={isPending}
                className="w-full px-8 py-4 bg-[var(--neon-green)] text-black font-black text-base rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isPending ? "Connecting..." : "⚡ Connect Wallet"}
              </button>

              {/* No-wallet: paste address */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-600 uppercase tracking-widest">
                  <span className="px-3 bg-[#0a0a0f]">or paste any wallet</span>
                </div>
              </div>
              <form onSubmit={handlePasteSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={pasteWallet}
                  onChange={(e) => { setPasteWallet(e.target.value); setPasteError(""); }}
                  placeholder="0x... wallet address"
                  className="flex-1 px-3 py-2.5 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-lg text-sm font-mono text-gray-200 placeholder-gray-700 focus:outline-none focus:border-[var(--neon-purple)] transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 border border-[var(--neon-purple)] text-[var(--neon-purple)] font-black text-sm rounded-lg hover:bg-[var(--neon-purple)] hover:text-black transition-all"
                >
                  →
                </button>
              </form>
              {pasteError && <p className="text-xs text-red-500 font-mono -mt-2">{pasteError}</p>}

              {/* Demo previews */}
              <div className="flex gap-2 flex-wrap">
                {DEMO_PREVIEWS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => router.push(`/birth?wallet=${DEMO_WALLETS[d.key]}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-full text-xs text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-all"
                  >
                    <span>{d.emoji}</span>
                    <span className="font-mono">{d.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-700 -mt-1">↑ Try a demo monster — no wallet needed</p>

              <Link
                href="/replay"
                className="text-center text-xs text-gray-600 hover:text-[var(--neon-purple)] transition-colors underline decoration-dotted"
              >
                Or watch the full Replay demo →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center md:items-start gap-3 w-full max-w-sm">
              <div className="text-sm text-[var(--neon-green)] font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)} ✓
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzeLoading}
                  className="w-full px-8 py-4 bg-[var(--neon-purple)] text-white font-black text-base rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {analyzeLoading ? "AWAKENING..." : "AWAKEN MY MONSTER"}
                </button>
                <Link
                  href="/replay"
                  className="text-center text-xs text-gray-600 hover:text-[var(--neon-purple)] transition-colors underline decoration-dotted"
                >
                  Or watch the full Replay demo →
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

      {/* ═══ Four.meme Return Loop — TF-03 ═══ */}
      <section className="w-full max-w-4xl mb-14">
        <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-6">The Loop</div>
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center text-xs">
            {[
              { icon: "⚡", label: "Trade on Four.meme", sub: "Any buy, sell, or rug event", color: "var(--neon-green)" },
              { arrow: true },
              { icon: "🧬", label: "DegenBorn analyzes", sub: "DNA scores update", color: "var(--neon-purple)" },
              { arrow: true },
              { icon: "👾", label: "Monster evolves", sub: "New traits & mutations", color: "var(--neon-gold)" },
              { arrow: true },
              { icon: "𝕏", label: "Share your monster", sub: "Brings new traders to Four.meme", color: "var(--neon-green)" },
            ].map((step, i) =>
              "arrow" in step ? (
                <div key={i} className="text-gray-700 font-mono text-lg hidden md:block">→</div>
              ) : (
                <div key={i} className="flex-1 min-w-[120px] bg-[var(--degen-muted)] rounded-xl p-4">
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <div className="font-black text-white text-xs mb-0.5">{step.label}</div>
                  <div className="text-gray-600 text-[10px]">{step.sub}</div>
                </div>
              )
            )}
          </div>
          <div className="text-center mt-4 text-[10px] text-gray-600 italic">
            Every trade on Four.meme shapes your monster. Every shared monster brings someone new to Four.meme.
          </div>
        </div>
      </section>

      {/* ═══ TF-06: Value for Four.meme — "Practical Value" slide ═══ */}
      <section className="w-full max-w-4xl mb-14">
        <div className="text-xs text-gray-600 uppercase tracking-widest text-center mb-2">
          What DegenBorn gives Four.meme
        </div>
        <div className="text-center text-[10px] text-gray-700 mb-6 italic">
          We don't just use Four.meme data. We make Four.meme more fun to use.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "🔁",
              title: "Retention Engine",
              color: "var(--neon-green)",
              points: [
                "Every trade = character growth",
                "Users return to see mutations",
                "Trading becomes identity building",
              ],
            },
            {
              icon: "📢",
              title: "Viral UGC Machine",
              color: "var(--neon-gold)",
              points: [
                "Monster cards shared on X",
                "Every share → Four.meme logo",
                "\"Born from @four_meme trades\"",
              ],
            },
            {
              icon: "🏆",
              title: "Loyalty Intelligence",
              color: "var(--neon-purple)",
              points: [
                "Four.meme Loyalty Score per wallet",
                "Bronze → Legendary tier system",
                "Identify & reward power traders",
              ],
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-[var(--degen-card)] border rounded-2xl p-5"
              style={{ borderColor: `${card.color}44` }}
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="font-black text-white text-sm mb-3" style={{ color: card.color }}>
                {card.title}
              </div>
              <ul className="space-y-1">
                {card.points.map((pt) => (
                  <li key={pt} className="text-xs text-gray-400 flex gap-1.5">
                    <span style={{ color: card.color }}>›</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href={`/api/widget/${DEMO_WALLETS.rug_necromancer}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-[var(--neon-green)] transition-colors underline decoration-dotted"
          >
            → See the embeddable widget API (for Four.meme profile integration)
          </Link>
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
        <Link href={`/report/${DEMO_WALLETS.rug_necromancer}`} className="hover:text-[var(--neon-gold)] transition-colors">
          → Report Card
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
