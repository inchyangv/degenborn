"use client";

/**
 * T-RET-01 — Daily Delta Banner.
 *
 * Shown at the top of Monster Room when the character's state has changed
 * since the user's last visit.
 * Clicking "See what happened" scrolls to the mutation diary.
 *
 * State comparison happens client-side via localStorage snapshot.
 */

import { useEffect, useState } from "react";
import type { CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";
import { loadSnapshot, saveSnapshot, computeDelta } from "@/lib/visit-snapshot";
import type { StateDelta } from "@/lib/visit-snapshot";

interface Props {
  wallet: string;
  state: CharacterState;
  /** id of the diary element to scroll to when CTA is clicked */
  diaryElementId?: string;
}

export default function DailyDeltaBanner({
  wallet,
  state,
  diaryElementId = "mutation-diary",
}: Props) {
  const [delta, setDelta] = useState<StateDelta | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const color = ARCHETYPE_COLORS[state.archetype] ?? "#9945ff";

  useEffect(() => {
    if (!wallet || typeof window === "undefined") return;

    const prev = loadSnapshot(wallet);
    if (prev) {
      const d = computeDelta(prev, state);
      if (d.hasAnyChange) {
        setDelta(d);
      }
    }

    // Update snapshot after computing delta
    saveSnapshot(wallet, state);
  }, [wallet, state]);

  if (!delta || dismissed) return null;

  const bullets: string[] = [];
  if (delta.levelChanged) {
    bullets.push(`Level ${delta.levelBefore} → ${delta.levelAfter}`);
  }
  if (delta.newScars > 0) {
    bullets.push(`${delta.newScars} new scar${delta.newScars > 1 ? "s" : ""}`);
  }
  if (delta.newCrowns > 0) {
    bullets.push(`${delta.newCrowns} new crown${delta.newCrowns > 1 ? "s" : ""}`);
  }
  if (delta.moodChanged) {
    bullets.push(`Mood: ${delta.moodBefore} → ${delta.moodAfter}`);
  }
  if (delta.traitsDelta > 0) {
    bullets.push(`${delta.traitsDelta} new trait${delta.traitsDelta > 1 ? "s" : ""}`);
  }

  const handleSeeMore = () => {
    const el = document.getElementById(diaryElementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setDismissed(true);
  };

  return (
    <div
      className="w-full flex items-center justify-between gap-3 px-4 py-2 text-xs"
      style={{
        background: `${color}15`,
        borderBottom: `1px solid ${color}33`,
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span style={{ color }} className="shrink-0">
          ⚡
        </span>
        <span className="opacity-70 truncate">
          <span className="text-white opacity-90">Your soul changed since your last visit. </span>
          {bullets.join(" · ")}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleSeeMore}
          className="underline transition-opacity opacity-60 hover:opacity-90 whitespace-nowrap"
          style={{ color }}
        >
          See what happened
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-30 hover:opacity-60 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
