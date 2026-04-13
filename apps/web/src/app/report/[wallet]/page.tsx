"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PersonaDNA, ArchetypeResult } from "@degenborn/shared";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
}

function dnaToGrade(score: number): string {
  if (score >= 90) return "S+";
  if (score >= 80) return "S";
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  if (grade.startsWith("S")) return "var(--neon-gold)";
  if (grade === "A") return "var(--neon-green)";
  if (grade === "B") return "var(--neon-blue, #00d4ff)";
  if (grade === "C") return "var(--neon-purple)";
  if (grade === "D") return "#ff8800";
  return "var(--neon-red)";
}

const TEACHER_COMMENTS: Record<string, string> = {
  mad_gambler: "Does not read the board. Apes in immediately. High energy. Often in detention.",
  ice_whale: "Quiet, methodical, and disturbingly patient. Intimidates other students.",
  rug_necromancer: "Has failed this course several times. Still here. Respect.",
  diamond_cultist: "Refuses to sell test answers. Conviction is admirable. Results are not.",
  sniper_jester: "Never stays long enough to finish the exam. Somehow still passing.",
  ghost_bagholder: "Present but absent. The bag grows heavier every semester.",
  unknown: "Identity unverified. Please submit your wallet for evaluation.",
};

export default function ReportCardPage() {
  const params = useParams<{ wallet: string }>();
  const wallet = params?.wallet ?? "";

  const [data, setData] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) return;
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    })
      .then((r) => r.json())
      .then((d: MonsterData) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [wallet]);

  const archetypeColor = data
    ? (ARCHETYPE_COLORS[data.archetype.archetype] ?? "#9945ff")
    : "#9945ff";

  const subjects = data?.dna
    ? [
        { name: "Aggression", score: data.dna.aggression, key: "agg" },
        { name: "Conviction", score: data.dna.conviction, key: "con" },
        { name: "Chaos", score: data.dna.chaos, key: "cha" },
        { name: "Luck", score: data.dna.luck, key: "lck" },
        { name: "Survival", score: data.dna.survival, key: "srv" },
      ]
    : [];

  const teacherComment = data
    ? (TEACHER_COMMENTS[data.archetype.archetype] ?? TEACHER_COMMENTS["unknown"]!)
    : "";

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/report/${wallet}`;
  const ogImageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/og/report/${wallet}`;

  const shareToX = () => {
    const archetypeName = data?.archetype.profile.name ?? "Unknown";
    const avgGrade = subjects.length
      ? dnaToGrade(Math.round(subjects.reduce((s, sub) => s + sub.score, 0) / subjects.length))
      : "?";
    const text = encodeURIComponent(
      `My Degen Report Card: ${archetypeName}\nOverall Grade: ${avgGrade}\n\n"${teacherComment}"\n\n— Prof. On-Chain, DegenBorn Academy × @four_meme\n#DegenBorn #fourmeme`
    );
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Home</Link>
        <div className="text-center">
          <div className="text-xs text-gray-600 uppercase tracking-widest font-mono">DegenBorn Academy</div>
          <div className="text-[10px] text-[var(--neon-green)] opacity-60">Report Card · {wallet.slice(0, 6)}...{wallet.slice(-4)}</div>
        </div>
        {wallet && (
          <Link href={`/monster?wallet=${wallet}`} className="text-xs text-gray-600 hover:text-gray-400">
            Soul Room →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-600 text-sm font-mono animate-pulse">
          Retrieving academic records...
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-[var(--neon-red)] text-sm">
          Could not load report card for this wallet.
        </div>
      ) : (
        <>
          {/* Report card container */}
          <div
            className="border-4 rounded-2xl overflow-hidden mb-6"
            style={{ borderColor: "#8b7355", background: "#faf6e8" }}
          >
            {/* Header */}
            <div className="bg-[#1a1a1a] px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[var(--neon-gold)] font-black text-xl tracking-widest uppercase">
                  DegenBorn Academy
                </div>
                <div className="text-gray-600 text-[10px] tracking-widest">
                  Est. 2024 · ⚡ Powered by Four.meme · BNB Smart Chain Campus
                </div>
              </div>
              <div
                className="border-2 rounded-full w-14 h-14 flex flex-col items-center justify-center text-center"
                style={{ borderColor: archetypeColor }}
              >
                <div className="text-[9px] font-black uppercase" style={{ color: archetypeColor }}>DEGEN</div>
                <div className="text-[8px]" style={{ color: archetypeColor }}>BORN</div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex gap-6">
              {/* Grades */}
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Academic Performance</div>
                <div className="space-y-2">
                  {subjects.map(({ name, score, key }) => {
                    const grade = dnaToGrade(score);
                    const gColor = gradeColor(grade);
                    return (
                      <div key={key} className="flex items-center gap-3 border-b border-[#ddd] pb-2">
                        <div className="text-[#333] font-bold text-sm flex-1">{name}</div>
                        <div className="text-gray-500 text-xs w-16 text-center font-mono">{score}/100</div>
                        <div
                          className="w-10 h-8 bg-[#1a1a1a] flex items-center justify-center rounded text-lg font-black"
                          style={{ color: gColor }}
                        >
                          {grade}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Parent signature */}
                <div className="mt-4 pt-3 border-t border-[#ccc]">
                  <div className="text-[10px] text-gray-400">Parent / Guardian Signature:</div>
                  <div className="text-2xl text-gray-200 italic mt-1">_____________________________</div>
                </div>
              </div>

              {/* Archetype + comment */}
              <div className="w-48 flex flex-col gap-3">
                <div
                  className="bg-[#1a1a1a] border-2 rounded-xl p-3 text-center"
                  style={{ borderColor: archetypeColor }}
                >
                  <div className="text-[10px] text-gray-600 tracking-widest mb-1">ARCHETYPE</div>
                  <div
                    className="font-black text-sm uppercase leading-tight"
                    style={{ color: archetypeColor }}
                  >
                    {data.archetype.profile.name}
                  </div>
                </div>
                <div className="bg-[#f5f0e0] border border-[#ccc] rounded-xl p-3 flex-1">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Teacher's Comment</div>
                  <div className="text-xs text-[#333] italic leading-relaxed">"{teacherComment}"</div>
                  <div className="text-[9px] text-gray-400 mt-2">— Prof. On-Chain</div>
                </div>
              </div>
            </div>
          </div>

          {/* Share actions */}
          <div className="flex gap-3">
            <button
              onClick={shareToX}
              className="flex-1 py-3 font-black text-sm rounded-xl text-black hover:brightness-110 transition-all"
              style={{ background: archetypeColor }}
            >
              𝕏 Share Report Card
            </button>
            <a
              href={ogImageUrl}
              download={`degenborn_report_${wallet.slice(0, 8)}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border border-gray-700 text-gray-400 text-sm font-mono rounded-xl hover:border-gray-400 hover:text-gray-300 transition-colors"
            >
              Save PNG
            </a>
          </div>

          <div className="text-center mt-4 text-[10px] text-gray-700">
            DegenBorn Academy does not accept appeals. Grades are final and deterministic.
          </div>
        </>
      )}
    </div>
  );
}
