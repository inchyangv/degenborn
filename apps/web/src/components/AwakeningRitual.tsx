/**
 * T-ATM-02 — Awakening Ritual overlay.
 *
 * Full-screen 3-second drama sequence shown when Mint fires:
 *   Phase 0 (0–1s):  Wallet address glyphs break apart & fade
 *   Phase 1 (1–2s):  Character silhouette assembles from dust
 *   Phase 2 (2–3s):  Name + tagline typewriter effect
 *   Phase done:       Cold silence, trait glow, fade to monster room
 *
 * Parent controls visibility with `visible` prop.
 * `onSkip` fires immediately, `onComplete` fires after phase 2.
 */
"use client";

import { useEffect, useState, useRef } from "react";
import type { ArchetypeResult } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import CharacterDisplay from "./CharacterDisplay";
import type { CharacterState } from "@degenborn/shared";

type Phase = 0 | 1 | 2 | "done";

interface Props {
  visible: boolean;
  wallet: string;
  archetype: ArchetypeResult;
  onSkip: () => void;
  onComplete: () => void;
}

function GlyphText({ text }: { text: string }) {
  const GLYPHS = "ᚠᚢᚦᚨᚱᚲᚷᛃᛇᛈᛉᛊᛏᛒᛗᛚᛜᛞᛟ◈◉◊▣▧▨◐◑◒◓";
  const [chars, setChars] = useState<string[]>(text.split(""));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    let frame = 0;
    const iter = setInterval(() => {
      setChars(
        text.split("").map((c, i) => {
          const scrambleUntil = text.length - Math.floor(frame / 3);
          if (i < scrambleUntil) {
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
          }
          return c;
        })
      );
      frame++;
      if (frame > text.length * 3 + 10) {
        setDone(true);
        clearInterval(iter);
      }
    }, 60);
    return () => clearInterval(iter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span className={`font-mono transition-opacity duration-500 ${done ? "opacity-0" : "opacity-100"}`}>
      {chars.join("")}
    </span>
  );
}

function Typewriter({ text, speed = 45 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span>{displayed}</span>;
}

const INITIAL_STATE: CharacterState = {
  wallet_address: "",
  archetype: "rug_necromancer",
  level: 1,
  mood: "neutral",
  corruption: 0,
  prestige: 0,
  scar_count: 0,
  crown_count: 0,
  survival_streak: 0,
  active_traits: [],
  updated_at: 0,
};

export default function AwakeningRitual({ visible, wallet, archetype, onSkip, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const completedRef = useRef(false);

  const color = ARCHETYPE_COLORS[archetype.archetype] ?? "#9945ff";

  useEffect(() => {
    if (!visible) {
      setPhase(0);
      setOverlayOpacity(0);
      completedRef.current = false;
      return;
    }

    completedRef.current = false;
    // Fade in overlay
    requestAnimationFrame(() => setOverlayOpacity(1));

    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => {
      setPhase("done");
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 3600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible, onComplete]);

  const handleSkip = () => {
    completedRef.current = true;
    onSkip();
  };

  if (!visible) return null;

  const initState: CharacterState = {
    ...INITIAL_STATE,
    wallet_address: wallet,
    archetype: archetype.archetype,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.97)",
        opacity: overlayOpacity,
        transition: "opacity 400ms ease",
      }}
    >
      {/* Phase 0: glyph disintegration */}
      {phase === 0 && (
        <div className="text-center animate-in fade-in duration-300">
          <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-4">
            Soul record detected
          </div>
          <div
            className="text-xl font-mono mb-2 ritual-glyph-out"
            style={{ color: `${color}cc` }}
          >
            <GlyphText text={`${wallet.slice(0, 6)}...${wallet.slice(-4)}`} />
          </div>
          <div className="text-xs text-gray-700 mt-4">dissolving identity...</div>
        </div>
      )}

      {/* Phase 1: dust assembly */}
      {phase === 1 && (
        <div className="text-center ritual-dust-assemble">
          <div
            className="relative mx-auto"
            style={{
              filter: `drop-shadow(0 0 30px ${color}99)`,
            }}
          >
            <CharacterDisplay
              archetype={archetype.archetype}
              state={initState}
              wallet={wallet}
              size={200}
            />
          </div>
          <div className="text-xs text-gray-600 font-mono mt-4">
            soul assembling...
          </div>
        </div>
      )}

      {/* Phase 2 + done: name reveal */}
      {(phase === 2 || phase === "done") && (
        <div className="text-center animate-in fade-in duration-500">
          <div
            className="relative mx-auto mb-6"
            style={{
              filter: `drop-shadow(0 0 40px ${color}cc)`,
            }}
          >
            <CharacterDisplay
              archetype={archetype.archetype}
              state={initState}
              wallet={wallet}
              size={220}
            />
          </div>
          <div
            className="text-3xl font-black mb-2 ritual-typewriter"
            style={{ color }}
          >
            <Typewriter text={archetype.profile.name} speed={50} />
          </div>
          <div className="text-sm text-gray-500 italic mt-1">
            <Typewriter text={`"${archetype.profile.tagline}"`} speed={35} />
          </div>
          <div className="text-xs text-gray-700 font-mono mt-4">
            soul core initialized
          </div>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 text-xs text-gray-700 hover:text-gray-500 transition-colors font-mono"
      >
        skip →
      </button>
    </div>
  );
}
