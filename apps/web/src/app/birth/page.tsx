"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";
import DNAPanel from "@/components/DNAPanel";
import ArchetypeReveal from "@/components/ArchetypeReveal";
import MintButton from "@/components/MintButton";

interface AnalyzeResponse {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  event_count: number;
}

function BirthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallet = searchParams.get("wallet") ?? "";

  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"scanning" | "dna" | "reveal" | "mint">("scanning");

  useEffect(() => {
    if (!wallet) {
      router.replace("/");
      return;
    }

    const analyze = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, window: "30d", useFixture: true }),
        });
        if (!resp.ok) {
          const err = await resp.json() as { error: string };
          throw new Error(err.error ?? "Analysis failed");
        }
        const result = await resp.json() as AnalyzeResponse;
        setData(result);
        setStatus("done");

        // Sequence the phases for drama
        setTimeout(() => setPhase("dna"), 500);
        setTimeout(() => setPhase("reveal"), 2500);
        setTimeout(() => setPhase("mint"), 4500);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        setStatus("error");
      }
    };

    analyze();
  }, [wallet, router]);

  if (!wallet) return null;

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-[var(--neon-red)] text-lg font-mono mb-4">⚠ ANALYSIS FAILED</div>
        <div className="text-gray-400 text-sm mb-6">{error}</div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 border border-[var(--border)] text-gray-400 rounded hover:border-gray-400 transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (status === "loading" || phase === "scanning") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-[var(--neon-green)] text-xs tracking-widest uppercase mb-8">
          Scanning wallet history...
        </div>
        <div className="flex gap-1 mb-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-8 bg-[var(--neon-green)] rounded opacity-0 animate-pulse"
              style={{ animationDelay: `${i * 150}ms`, animationFillMode: "forwards" }}
            />
          ))}
        </div>
        <div className="text-gray-600 text-xs font-mono">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-xs tracking-widest text-gray-600 uppercase mb-2">The Awakening</div>
        <div className="text-[var(--neon-green)] font-mono text-sm">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </div>
      </div>

      {/* DNA Panel */}
      {(phase === "dna" || phase === "reveal" || phase === "mint") && (
        <DNAPanel dna={data.dna} animated />
      )}

      {/* Archetype Reveal */}
      {(phase === "reveal" || phase === "mint") && (
        <ArchetypeReveal archetype={data.archetype} />
      )}

      {/* Mint CTA */}
      {phase === "mint" && (
        <MintButton wallet={wallet} dna={data.dna} archetype={data.archetype} />
      )}

      {/* Event count */}
      <div className="mt-8 text-center text-xs text-gray-700">
        Analyzed {data.event_count} on-chain events
      </div>
    </div>
  );
}

export default function BirthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <BirthContent />
    </Suspense>
  );
}
