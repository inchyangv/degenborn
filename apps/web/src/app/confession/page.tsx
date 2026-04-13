"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import CharacterDisplay from "@/components/CharacterDisplay";
import Link from "next/link";

interface MonsterData {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
}

interface Message {
  role: "visitor" | "soul";
  text: string;
}

function ConfessionContent() {
  const searchParams = useSearchParams();
  const wallet = searchParams.get("wallet") ?? "";

  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [shareTarget, setShareTarget] = useState<Message | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wallet) return;
    const load = async () => {
      try {
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet }),
        });
        const analyzed = await resp.json() as { dna: PersonaDNA; archetype: ArchetypeResult };
        const { createInitialState } = await import("@/lib/state-machine");
        const state = createInitialState(wallet.toLowerCase(), analyzed.archetype.archetype as any);
        setMonster({ dna: analyzed.dna, archetype: analyzed.archetype, state });
        // Opening greeting
        setMessages([
          { role: "soul", text: `The booth is open. ${analyzed.archetype.profile.name} listens. Speak.` },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wallet]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || thinking || !monster) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "visitor", text: userMsg }]);
    setThinking(true);

    try {
      const resp = await fetch("/api/confession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          message: userMsg,
          archetype_name: monster.archetype.profile.name,
          tone_seed: monster.archetype.profile.tone_seed,
        }),
      });
      const data = await resp.json() as { reply?: string; error?: string };
      const reply = data.reply ?? "...";
      setMessages((m) => [...m, { role: "soul", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "soul", text: "The soul is unreachable right now." }]);
    } finally {
      setThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const color = monster ? (ARCHETYPE_COLORS[monster.archetype.archetype] ?? "#9945ff") : "#9945ff";

  return (
    <div className="min-h-screen pb-16 px-4 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex flex-col flex-1">
        {/* Nav */}
        <div className="flex items-center justify-between py-4 mb-4 border-b border-[var(--degen-border)]">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color }}>
            Confession Booth
          </div>
          {wallet && (
            <Link href={`/monster?wallet=${wallet}`} className="text-xs text-gray-600 hover:text-gray-400">
              Soul Room →
            </Link>
          )}
        </div>

        {!wallet && (
          <div className="text-center py-16 text-gray-600 text-sm">
            Add <code className="text-gray-400">?wallet=0x...</code> to speak with a soul.
          </div>
        )}

        {loading && wallet && (
          <div className="text-center py-16 text-gray-600 text-sm font-mono">
            Opening the booth...
          </div>
        )}

        {monster && (
          <>
            {/* Character header */}
            <div
              className="flex items-center gap-4 p-4 rounded-2xl mb-4"
              style={{ background: `${color}11`, border: `1px solid ${color}33` }}
            >
              <CharacterDisplay
                archetype={monster.archetype.archetype}
                state={monster.state}
                wallet={wallet}
                size={60}
              />
              <div>
                <div className="font-black text-white text-sm">{monster.archetype.profile.name}</div>
                <div className="text-xs italic mt-0.5" style={{ color }}>
                  &ldquo;{monster.archetype.profile.tagline}&rdquo;
                </div>
              </div>
              <div className="ml-auto text-[10px] text-gray-700 font-mono">
                No logs stored
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm relative group ${
                      msg.role === "visitor"
                        ? "bg-[var(--degen-muted)] text-gray-300 rounded-tr-none"
                        : "text-white rounded-tl-none"
                    }`}
                    style={msg.role === "soul" ? { background: `${color}22`, border: `1px solid ${color}44` } : {}}
                  >
                    {msg.role === "soul" && (
                      <div className="text-[10px] font-mono mb-1" style={{ color }}>
                        {monster.archetype.profile.name}
                      </div>
                    )}
                    {msg.text}
                    {/* Share button on soul replies */}
                    {msg.role === "soul" && (
                      <button
                        onClick={() => setShareTarget(msg)}
                        className="mt-2 block text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color }}
                      >
                        𝕏 Share this line →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-2.5 rounded-2xl rounded-tl-none text-sm"
                    style={{ background: `${color}11`, border: `1px solid ${color}33` }}
                  >
                    <span className="text-gray-600 font-mono">...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex gap-2 items-end p-3 rounded-2xl"
              style={{ border: `1px solid ${color}33`, background: "var(--degen-card)" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Speak to the soul... (Enter to send)"
                rows={2}
                maxLength={280}
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="px-4 py-2 font-black text-sm rounded-xl transition-all disabled:opacity-40"
                style={{ background: color, color: "#000" }}
              >
                →
              </button>
            </div>
            <div className="text-[10px] text-gray-700 text-right mt-1">
              {input.length}/280 · conversation not stored
            </div>
          </>
        )}

        {/* Share modal */}
        {shareTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
            onClick={() => setShareTarget(null)}
          >
            <div
              className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-3">Share this reply</div>
              <div
                className="p-4 rounded-xl mb-4 text-sm italic"
                style={{ background: `${color}11`, border: `1px solid ${color}33`, color: "white" }}
              >
                &ldquo;{shareTarget.text}&rdquo;
                <div className="mt-2 text-[10px] text-gray-600">
                  — {monster?.archetype.profile.name} · DegenBorn Confession Booth
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `My soul said: "${shareTarget.text}"\n\n— ${monster?.archetype.profile.name} on @four_meme × @DegenBorn\n#DegenBorn #fourmeme`
                    );
                    const url = encodeURIComponent(`${window.location.origin}/confession?wallet=${wallet}`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
                    setShareTarget(null);
                  }}
                  className="w-full py-2 text-sm font-black rounded-lg"
                  style={{ background: color, color: "#000" }}
                >
                  𝕏 Share to X
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `"${shareTarget.text}" — ${monster?.archetype.profile.name} · DegenBorn × four.meme`
                      );
                      setShareTarget(null);
                    }}
                    className="flex-1 py-2 text-sm border rounded-lg"
                    style={{ borderColor: `${color}44`, color }}
                  >
                    Copy Text
                  </button>
                  <button
                    onClick={() => setShareTarget(null)}
                    className="px-4 py-2 text-sm border border-[var(--degen-border)] text-gray-400 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600 text-sm">Loading...</div>}>
      <ConfessionContent />
    </Suspense>
  );
}
