"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
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

function BirthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallet = searchParams.get("wallet") ?? "";

  const [status, setStatus] = useState<"loading" | "idle" | "done" | "error">("idle");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("scanning");
  const [genesisVisible, setGenesisVisible] = useState(false);
  const [analysisWindow, setAnalysisWindow] = useState<Window>("30d");
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
            setTimeout(() => {
              setGenesisVisible(true);
              playIfUnmuted(playSynthSting);
            }, 100);
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
        <div className="flex flex-col items-center gap-6">
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
          <div
            className={`transition-all duration-700 ${genesisVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            <CharacterDisplay
              archetype={data.archetype.archetype as any}
              state={initialState}
              wallet={wallet}
              size={240}
            />
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

export default function BirthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <BirthContent />
    </Suspense>
  );
}
