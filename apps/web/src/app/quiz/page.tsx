"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArchetypeId } from "@degenborn/shared";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";

// ── DNA weights per answer ────────────────────────────────────────────────
interface DNAVector {
  aggression: number;
  conviction: number;
  chaos: number;
  luck: number;
  survival: number;
}

interface QuizAnswer {
  text: string;
  delta: Partial<DNAVector>;
}

interface QuizQuestion {
  id: number;
  question: string;
  answers: QuizAnswer[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "A new token just launched with 100x hype. What do you do?",
    answers: [
      { text: "Ape in immediately — I'll figure it out later", delta: { aggression: 30, chaos: 20 } },
      { text: "Research for 5 minutes then go in if it checks out", delta: { aggression: 15, luck: 10 } },
      { text: "Wait for liquidity to stabilize before entry", delta: { conviction: 20, survival: 10 } },
      { text: "Skip it — I've seen this movie before", delta: { conviction: 15, chaos: -10 } },
    ],
  },
  {
    id: 2,
    question: "Your bag is down 60% from your entry. The devs are quiet.",
    answers: [
      { text: "Cut losses now and move on", delta: { survival: 20, aggression: 10 } },
      { text: "Hold — I believe in the thesis", delta: { conviction: 30, luck: -5 } },
      { text: "Average down — this is a gift", delta: { conviction: 20, chaos: 15 } },
      { text: "Walk away and pretend it never happened", delta: { chaos: 20, survival: -10 } },
    ],
  },
  {
    id: 3,
    question: "You just 5x'd on a trade. What's next?",
    answers: [
      { text: "Sell everything and lock in profit", delta: { luck: 25, survival: 15 } },
      { text: "Sell half, let the rest ride", delta: { luck: 15, conviction: 15 } },
      { text: "Keep holding — it's going 100x", delta: { conviction: 25, chaos: 10 } },
      { text: "Immediately ape the profits into the next thing", delta: { aggression: 30, chaos: 20 } },
    ],
  },
  {
    id: 4,
    question: "How do you usually find your trades?",
    answers: [
      { text: "Twitter CT alpha and Telegram groups", delta: { aggression: 20, chaos: 15 } },
      { text: "On-chain data and wallet tracking", delta: { luck: 25, conviction: 10 } },
      { text: "I follow a few tokens I understand deeply", delta: { conviction: 30, aggression: -10 } },
      { text: "Gut feeling and vibes", delta: { chaos: 25, luck: 10 } },
    ],
  },
  {
    id: 5,
    question: "After a brutal loss streak, you...",
    answers: [
      { text: "Take a break and review what went wrong", delta: { survival: 30, conviction: 10 } },
      { text: "Immediately get back in to recover losses", delta: { aggression: 25, chaos: 20 } },
      { text: "Keep holding bags hoping for recovery", delta: { conviction: 20, survival: -10 } },
      { text: "Blame the market and come back in a week", delta: { survival: 15, chaos: 10 } },
    ],
  },
];

// ── Archetype classification (from PROJECT.md rules) ──────────────────────
function classifyArchetype(dna: DNAVector): ArchetypeId {
  const { aggression, conviction, chaos, luck, survival } = dna;
  const high = 60;

  if (chaos >= high && survival >= high) return "rug_necromancer";
  if (aggression >= high && luck >= high) return "sniper_jester";
  if (conviction >= high && luck >= high && survival >= high) return "ice_whale";
  if (conviction >= high && luck < 40 && survival >= high) return "diamond_cultist";
  if (aggression >= high && chaos >= high) return "mad_gambler";
  if (conviction >= high && chaos >= high) return "ghost_bagholder";

  // Fallback: find dominant axis
  const axes: Array<[keyof DNAVector, number]> = [
    ["aggression", aggression],
    ["conviction", conviction],
    ["chaos", chaos],
    ["luck", luck],
    ["survival", survival],
  ];
  axes.sort((a, b) => b[1] - a[1]);
  const top = axes[0]![0];
  const dominant: Record<keyof DNAVector, ArchetypeId> = {
    aggression: "mad_gambler",
    conviction: "diamond_cultist",
    chaos: "rug_necromancer",
    luck: "sniper_jester",
    survival: "ice_whale",
  };
  return dominant[top];
}

export default function QuizPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1-5 = questions, 6 = result
  const [dna, setDna] = useState<DNAVector>({ aggression: 50, conviction: 50, chaos: 50, luck: 50, survival: 50 });
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ArchetypeId | null>(null);

  const handleAnswer = (qi: number, answerIdx: number) => {
    const question = QUESTIONS[qi]!;
    const answer = question.answers[answerIdx]!;
    const newDna = { ...dna };
    (Object.keys(answer.delta) as Array<keyof DNAVector>).forEach((key) => {
      newDna[key] = Math.max(0, Math.min(100, newDna[key] + (answer.delta[key] ?? 0)));
    });
    setDna(newDna);
    setSelectedAnswers((prev) => [...prev, answerIdx]);

    if (qi + 1 >= QUESTIONS.length) {
      setResult(classifyArchetype(newDna));
      setStep(QUESTIONS.length + 1);
    } else {
      setStep(qi + 2);
    }
  };

  const reset = () => {
    setStep(0);
    setDna({ aggression: 50, conviction: 50, chaos: 50, luck: 50, survival: 50 });
    setSelectedAnswers([]);
    setResult(null);
  };

  // Intro
  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-16">
        <div className="max-w-md w-full text-center">
          <div className="text-xs text-[var(--neon-purple)] font-mono uppercase tracking-widest mb-4">
            Pre-reveal Quiz
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Which archetype are you?</h1>
          <p className="text-gray-400 text-sm mb-8">
            5 questions. No wallet needed. Get your approximate archetype — then connect to see your real soul.
          </p>
          <button
            onClick={() => setStep(1)}
            className="px-10 py-4 bg-[var(--neon-purple)] text-white font-black text-lg rounded-xl hover:brightness-110 transition-all"
          >
            Start Quiz →
          </button>
          <div className="mt-4">
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Questions
  if (step >= 1 && step <= QUESTIONS.length) {
    const qi = step - 1;
    const question = QUESTIONS[qi]!;
    const progress = (qi / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-16">
        <div className="max-w-md w-full">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{qi + 1} / {QUESTIONS.length}</span>
              <button onClick={reset} className="text-gray-700 hover:text-gray-500 transition-colors">Reset</button>
            </div>
            <div className="h-1 bg-[var(--degen-muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--neon-purple)] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6">
            <div className="text-white font-black text-base mb-5">{question.question}</div>
            <div className="space-y-3">
              {question.answers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(qi, i)}
                  className="w-full text-left p-4 border border-[var(--degen-border)] rounded-xl text-sm text-gray-300 hover:border-[var(--neon-purple)] hover:text-white transition-all"
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result
  if (result) {
    const profile = ARCHETYPE_PROFILES[result];
    const color = ARCHETYPE_COLORS[result];

    const shareUrl = `${window?.location?.origin ?? ""}/quiz?result=${result}&agg=${dna.aggression}&con=${dna.conviction}&cha=${dna.chaos}&lck=${dna.luck}&srv=${dna.survival}`;
    const shareText = `I'm a ${profile.name}. "${profile.tagline}" What degen are you?`;

    const shareToX = () => {
      const text = encodeURIComponent(`${shareText} #DegenBorn #fourmeme`);
      const url = encodeURIComponent(shareUrl);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
    };

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // fallback: select text
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-16">
        <div className="max-w-md w-full text-center">
          <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-4">
            Your approximate archetype
          </div>

          <div
            className="bg-[var(--degen-card)] border-2 rounded-2xl p-8 mb-6"
            style={{ borderColor: `${color}55` }}
          >
            <div
              className="text-3xl font-black mb-2"
              style={{ color }}
            >
              {profile.name}
            </div>
            <div className="text-sm italic text-gray-400 mb-4">
              &ldquo;{profile.tagline}&rdquo;
            </div>
            <div className="text-sm text-gray-400 mb-6">{profile.description}</div>

            {/* Approximate DNA bars */}
            <div className="space-y-2 text-left mb-6">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Approximate DNA</div>
              {(Object.entries(dna) as Array<[keyof DNAVector, number]>).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-16 text-[10px] font-mono text-gray-600 uppercase">{key.slice(0, 3)}</div>
                  <div className="flex-1 h-1.5 bg-[var(--degen-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${val}%`, background: color }}
                    />
                  </div>
                  <div className="w-6 text-[10px] font-mono text-right" style={{ color }}>{val}</div>
                </div>
              ))}
            </div>

            <div
              className="text-xs text-gray-500 p-3 rounded-xl border italic"
              style={{ borderColor: `${color}33`, background: `${color}09` }}
            >
              This is an approximation. Connect your wallet to see your real DNA — computed from actual on-chain behavior.
            </div>
          </div>

          {/* Share row — primary CTA */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={shareToX}
              className="flex-1 py-3 font-black text-sm rounded-xl hover:brightness-110 transition-all text-black"
              style={{ background: color }}
            >
              𝕏 &quot;I&apos;m a {profile.name}&quot;
            </button>
            <button
              onClick={copyLink}
              className="px-4 py-3 border-2 text-sm font-mono rounded-xl hover:opacity-80 transition-all"
              style={{ borderColor: `${color}55`, color }}
            >
              Copy link
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="block px-10 py-4 border font-black text-base rounded-xl hover:brightness-110 transition-all text-center"
              style={{ borderColor: `${color}44`, color }}
            >
              Connect Wallet to See Real Soul →
            </Link>
            <Link
              href="/replay"
              className="block px-10 py-4 border border-gray-800 font-bold text-sm rounded-xl hover:border-gray-600 transition-all text-center text-gray-500"
            >
              ▶ Watch Replay Demo
            </Link>
            <button
              onClick={reset}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Retake quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
