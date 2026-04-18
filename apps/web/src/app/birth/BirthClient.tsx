"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { playSynthSting, playIfUnmuted } from "@/lib/sfx";
import { analytics } from "@/lib/analytics";
import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";
import DNAPanel from "@/components/DNAPanel";
import ArchetypeReveal from "@/components/ArchetypeReveal";
import MintButton from "@/components/MintButton";
import CharacterDisplay from "@/components/CharacterDisplay";
import { createInitialState } from "@/lib/state-machine";

interface AnalyzeResponse {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  event_count: number;
}

type Phase = "scanning" | "dna" | "reveal" | "genesis" | "mint";
type Window = "7d" | "30d" | "180d";

const SCAN_LOG_LINES = [
  "→ Connecting to BNB chain...",
  "→ Fetching wallet history...",
  "→ Found {count} Four.meme transactions",
  "→ Detected {rugs} rug-pull candidates",
  "→ Window: 30 days",
  "→ Computing Aggression...",
  "→ Computing Conviction...",
  "→ Computing Chaos...",
  "→ Computing Luck...",
  "→ Computing Survival...",
  "→ Building Persona DNA...",
];

function useTypewriter(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
}

function ScanLog({ wallet, eventCount }: { wallet: string; eventCount: number }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [doneIndices, setDoneIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const rugs = Math.floor(eventCount / 5) || 1;
    const lines = SCAN_LOG_LINES.map((l) =>
      l.replace("{count}", String(eventCount)).replace("{rugs}", String(rugs)),
    );
    lines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        setTimeout(() => {
          setDoneIndices((prev) => new Set([...prev, i]));
        }, 300);
      }, i * 280);
    });
  }, [eventCount]);

  return (
    <div className="font-mono text-xs space-y-1 text-left w-full max-w-sm">
      <div className="text-gray-600 mb-2 text-[10px] uppercase tracking-widest">
        {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </div>
      {visibleLines.map((line, i) => (
        <div key={i} className="flex items-start gap-2 animate-in fade-in duration-300">
          <span className={doneIndices.has(i) ? "text-[var(--neon-green)]" : "text-gray-600"}>
            {doneIndices.has(i) ? "✓" : "·"}
          </span>
          <span className={doneIndices.has(i) ? "text-gray-300" : "text-gray-500"}>{line}</span>
        </div>
      ))}
    </div>
  );
}

interface BirthClientProps {
  wallet?: string;
}

export default function BirthClient({ wallet = "" }: BirthClientProps) {
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "idle" | "done" | "error">("idle");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("scanning");
  const [genesisVisible, setGenesisVisible] = useState(false);
  const [analysisWindow, setAnalysisWindow] = useState<Window>("30d");
  const [genesisImageUrl, setGenesisImageUrl] = useState<string | null>(null);
  const [genesisImageLoading, setGenesisImageLoading] = useState(false);
  const skipRef = useRef(false);

  const advanceToMint = () => {
    skipRef.current = true;
    setPhase("mint");
  };

  const advancePhase = () => {
    // Advance one phase at a time: dna → reveal → genesis → mint
    skipRef.current = true;
    setPhase((prev) => {
      if (prev === "dna") return "reveal";
      if (prev === "reveal") return "genesis";
      if (prev === "genesis") { setGenesisVisible(true); return "genesis"; }
      return "mint";
    });
  };

  const startAnalysis = async () => {
    setStatus("loading");
    setError(null);
    setPhase("scanning");
    skipRef.current = false;
    analytics.analysisStarted(wallet, analysisWindow);
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, window: analysisWindow }),
      });
        if (!resp.ok) {
          const err = await resp.json() as { error: string };
          throw new Error(err.error ?? "Analysis failed");
        }
        const result = await resp.json() as AnalyzeResponse;
        setData(result);
        setStatus("done");
        analytics.analysisCompleted(result.archetype.archetype);

        if (skipRef.current) return;
        setTimeout(() => { if (!skipRef.current) setPhase("dna"); }, 500);
        setTimeout(() => { if (!skipRef.current) setPhase("reveal"); }, 3500);
        setTimeout(() => {
          if (!skipRef.current) {
            setPhase("genesis");
            // T3-02: call genesis image API during genesis phase
            setGenesisImageLoading(true);
            fetch("/api/genesis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                wallet,
                dna: result.dna,
                archetype: result.archetype.archetype,
              }),
            })
              .then((r) => r.ok ? r.json() : null)
              .then((img: { url?: string; is_placeholder?: boolean } | null) => {
                if (img?.url && !img.is_placeholder) {
                  setGenesisImageUrl(img.url);
                }
              })
              .catch(() => {})
              .finally(() => {
                setGenesisImageLoading(false);
                if (!skipRef.current) {
                  setGenesisVisible(true);
                  playIfUnmuted(playSynthSting);
                }
              });
          }
        }, 5500);
        setTimeout(() => { if (!skipRef.current) setPhase("mint"); }, 9000);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        setStatus("error");
      }
  };

  useEffect(() => {
    if (!wallet) { router.replace("/"); return; }
    startAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  // ESC → skip to mint
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && data) advanceToMint();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  if (!wallet) return null;

  if (status === "error") {
    // Categorise error for actionable messaging
    const errLower = (error ?? "").toLowerCase();
    const errorTitle = "⚠ ANALYSIS FAILED";
    let errorMsg = error ?? "Unknown error";
    if (errLower.includes("no activity") || errLower.includes("no four.meme") || errLower.includes("no events") || errLower.includes("not found")) {
      errorMsg = "No Four.meme activity found in the last 30 days. Try a longer window or use Replay Demo.";
    } else if (errLower.includes("timeout") || errLower.includes("network") || errLower.includes("failed to fetch")) {
      errorMsg = "Connection issue. Check your internet and retry.";
    } else if (errLower.includes("500") || errLower.includes("503") || errLower.includes("unavailable")) {
      errorMsg = "Data source is temporarily unavailable. Try again in a moment.";
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-[var(--neon-red)] text-lg font-mono mb-4">{errorTitle}</div>
        <div className="text-gray-400 text-sm mb-6 max-w-xs text-center">{errorMsg}</div>
        <div className="flex gap-3">
          <button
            onClick={startAnalysis}
            className="px-6 py-2 bg-[var(--neon-green)] text-black font-bold rounded hover:brightness-110 transition-all text-sm"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/replay")}
            className="px-6 py-2 border border-[var(--degen-border)] text-gray-400 rounded hover:border-gray-400 transition-colors text-sm"
          >
            Try Replay Demo
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 border border-[var(--degen-border)] text-gray-400 rounded hover:border-gray-400 transition-colors text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Phase breadcrumb labels
  const phases: Phase[] = ["scanning", "dna", "reveal", "genesis", "mint"];
  const phaseLabels: Record<Phase, string> = {
    scanning: "Scanning",
    dna: "DNA",
    reveal: "Archetype",
    genesis: "Genesis",
    mint: "Mint",
  };
  const currentPhaseIdx = phases.indexOf(phase);

  const initialState = data
    ? createInitialState(wallet.toLowerCase(), data.archetype.archetype as any)
    : null;

  const genesisText = data
    ? `Hello. I am your ${data.archetype.profile.name}.`
    : "";

  return (
    <div className="min-h-screen px-4 py-12 pb-safe max-w-2xl mx-auto">
      {/* Phase breadcrumb */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {phases.map((p, i) => (
          <div key={p} className="flex items-center gap-1">
            <span
              className={`text-[10px] font-mono uppercase tracking-widest ${
                i < currentPhaseIdx
                  ? "text-[var(--neon-green)]"
                  : i === currentPhaseIdx
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {phaseLabels[p]}
            </span>
            {i < phases.length - 1 && (
              <span className="text-gray-800 text-[10px]">›</span>
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-xs tracking-widest text-gray-600 uppercase mb-2">The Awakening</div>
        <div className="text-[var(--neon-green)] font-mono text-sm">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </div>
      </div>

      {/* SCANNING phase */}
      {phase === "scanning" && (
        <div className="flex flex-col items-center gap-8">
          {/* 3.2: Silhouette preview — dark shape visible immediately, color floods in when DNA is ready */}
          <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
            {/* Pulsing silhouette base */}
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: "radial-gradient(circle, #1a1a2e 40%, transparent 80%)",
              }}
            />
            <div
              className="relative z-10 flex items-center justify-center rounded-2xl overflow-hidden"
              style={{ width: 160, height: 160, background: "#0a0a14", border: "2px solid #1a1a2e" }}
            >
              {/* Silhouette SVG — generic monster shape, dark */}
              <svg viewBox="0 0 100 100" width="120" height="120" opacity="0.4">
                <ellipse cx="50" cy="38" rx="28" ry="30" fill="#333"/>
                <ellipse cx="50" cy="72" rx="22" ry="20" fill="#2a2a2a"/>
                <ellipse cx="35" cy="55" rx="10" ry="5" fill="#333"/>
                <ellipse cx="65" cy="55" rx="10" ry="5" fill="#333"/>
                <circle cx="42" cy="34" r="5" fill="#222"/>
                <circle cx="58" cy="34" r="5" fill="#222"/>
              </svg>
              {/* Scan line animation */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, transparent 0%, rgba(0,255,136,0.07) 50%, transparent 100%)",
                  animation: "scanLine 2s linear infinite",
                }}
              />
            </div>
            {/* Scanning ring */}
            <div
              className="absolute inset-0 rounded-full border-2 animate-ping"
              style={{ borderColor: "#9945ff33" }}
            />
          </div>
          <ScanLog wallet={wallet} eventCount={data?.event_count ?? 14} />
        </div>
      )}

      {/* DNA Panel */}
      {(phase === "dna" || phase === "reveal" || phase === "genesis" || phase === "mint") && data && (
        <DNAPanel dna={data.dna} animated />
      )}

      {/* Archetype Reveal */}
      {(phase === "reveal" || phase === "genesis" || phase === "mint") && data && (
        <ArchetypeReveal archetype={data.archetype} />
      )}

      {/* GENESIS phase — character cinematic reveal */}
      {phase === "genesis" && data && initialState && (
        <div className="my-8 flex flex-col items-center gap-4">
          {/* T3-02: Show loading while genesis image is being generated */}
          {genesisImageLoading && (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="text-[var(--neon-purple)] text-sm font-mono animate-pulse">
                ✨ Your soul is taking form...
              </div>
              <div className="w-40 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--neon-purple)] animate-[pulse_1.5s_ease-in-out_infinite] w-full origin-left" />
              </div>
            </div>
          )}
          <div
            className={`transition-all duration-700 ${genesisVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            {/* T3-02: Use real genesis image if available, fallback to CharacterDisplay */}
            {genesisImageUrl ? (
              <div className="relative" style={{ width: 240, height: 240 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={genesisImageUrl}
                  alt="Genesis character"
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ border: "2px solid var(--neon-purple)" }}
                />
              </div>
            ) : (
              <CharacterDisplay
                archetype={data.archetype.archetype as any}
                state={initialState}
                wallet={wallet}
                size={240}
              />
            )}
          </div>
          {genesisVisible && (
            <div className="text-[var(--neon-gold)] font-mono text-sm italic text-center">
              <GenesisTypeline text={genesisText} />
            </div>
          )}
          <button
            onClick={advanceToMint}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
          >
            skip intro →
          </button>
        </div>
      )}

      {/* Mint CTA */}
      {phase === "mint" && data && (
        <>
          {initialState && (
            <div className="my-6 flex justify-center">
              <CharacterDisplay
                archetype={data.archetype.archetype as any}
                state={initialState}
                wallet={wallet}
                size={200}
              />
            </div>
          )}
          <MintButton wallet={wallet} dna={data.dna} archetype={data.archetype} />

          {/* Four.meme origin message — TF-01 */}
          <div className="mt-4 mb-2 text-center px-4 py-3 rounded-xl border border-[var(--degen-border)] bg-[var(--degen-card)]">
            <div className="text-xs text-[var(--neon-green)] font-bold mb-0.5">⚡ Born from Four.meme trades</div>
            <div className="text-[11px] text-gray-500">
              Your monster was shaped by your on-chain activity on Four.meme.
              Every trade you make will evolve it further.
            </div>
          </div>

          {/* Share Your Birth CTA — T1-01 */}
          <div className="mt-6 text-center">
            <div className="text-xs text-gray-700 mb-3">Record this moment</div>
            <button
              onClick={() => {
                const caption = `I was just born as a ${data.archetype.profile.name} on @four_meme. "${data.archetype.profile.tagline}" — my DegenBorn soul has awakened.`;
                const text = encodeURIComponent(`${caption}\n\nEvery Four.meme trade shapes my monster 👾\n#DegenBorn #fourmeme`);
                const url = encodeURIComponent(`${window.location.origin}/m/${wallet}`);
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
              }}
              className="px-8 py-3 font-black text-sm rounded-xl hover:brightness-110 transition-all"
              style={{
                background: `linear-gradient(135deg, var(--neon-purple), var(--neon-gold))`,
                color: "#000",
              }}
            >
              𝕏 Share Your Birth
            </button>
          </div>
        </>
      )}

      {/* Event count */}
      {data && phase !== "scanning" && (
        <div className="mt-8 text-center text-xs text-gray-700">
          Analyzed {data.event_count} on-chain events
        </div>
      )}

      {/* Phase advance controls */}
      {phase === "dna" && data && (
        <div className="text-center mt-6 flex flex-col items-center gap-2">
          <button
            onClick={advancePhase}
            className="px-6 py-2 border border-[var(--neon-purple)] text-[var(--neon-purple)] text-sm font-bold rounded-lg hover:bg-[var(--neon-purple)] hover:text-black transition-all"
          >
            Continue → View Archetype
          </button>
          <button onClick={advanceToMint} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Skip to Mint
          </button>
        </div>
      )}
      {(phase === "reveal" || phase === "genesis") && (
        <div className="text-center mt-4">
          <button onClick={advanceToMint} className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-gray-700 px-4 py-1.5 rounded">
            Skip to Mint →
          </button>
        </div>
      )}
    </div>
  );
}

function GenesisTypeline({ text }: { text: string }) {
  const displayed = useTypewriter(text, 45);
  return <span>"{displayed}"<span className="animate-pulse">_</span></span>;
}
