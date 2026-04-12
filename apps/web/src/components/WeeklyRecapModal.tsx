/**
 * T-RET-03 — Weekly Recap Digest modal.
 *
 * Shown on Monday visit when there are changes since last week.
 * Displays a summary of mutations, badge gains, and level changes.
 * No external push — in-app only. Share card available.
 */
"use client";

import { useEffect, useState } from "react";
import type { CharacterState } from "@degenborn/shared";
import { ARCHETYPE_COLORS } from "@degenborn/shared";

const WEEKLY_RECAP_KEY = "degenborn_weekly_recap_v1";
const WEEKLY_SHOWN_KEY = "degenborn_weekly_shown";

interface StoredWeekState {
  week: string;     // YYYY-WW
  level: number;
  scar_count: number;
  crown_count: number;
  corruption: number;
  prestige: number;
}

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function isMonday(date: Date): boolean {
  return date.getDay() === 1;
}

interface WeeklyRecapModalProps {
  wallet: string;
  state: CharacterState;
}

interface Delta {
  levelDelta: number;
  scarDelta: number;
  crownDelta: number;
  corruptionDelta: number;
  prestigeDelta: number;
}

export default function WeeklyRecapModal({ wallet, state }: WeeklyRecapModalProps) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState<Delta | null>(null);
  const [prevWeek, setPrevWeek] = useState<string | null>(null);

  const color = ARCHETYPE_COLORS[state.archetype] ?? "#9945ff";
  const currentWeek = isoWeek(new Date());

  useEffect(() => {
    if (typeof window === "undefined" || !wallet) return;

    // Only show on Mondays (or always show if forced for dev — remove in prod)
    const today = new Date();
    if (!isMonday(today)) return;

    const shownKey = `${WEEKLY_SHOWN_KEY}::${wallet}::${currentWeek}`;
    if (localStorage.getItem(shownKey)) return; // already shown this week

    const raw = localStorage.getItem(`${WEEKLY_RECAP_KEY}::${wallet}`);
    if (!raw) {
      // First visit — store current state, don't show yet
      const snapshot: StoredWeekState = {
        week: currentWeek,
        level: state.level,
        scar_count: state.scar_count,
        crown_count: state.crown_count,
        corruption: state.corruption,
        prestige: state.prestige,
      };
      localStorage.setItem(`${WEEKLY_RECAP_KEY}::${wallet}`, JSON.stringify(snapshot));
      return;
    }

    const prev: StoredWeekState = JSON.parse(raw);
    if (prev.week === currentWeek) return; // Same week, no recap

    const d: Delta = {
      levelDelta: state.level - prev.level,
      scarDelta: state.scar_count - prev.scar_count,
      crownDelta: state.crown_count - prev.crown_count,
      corruptionDelta: state.corruption - prev.corruption,
      prestigeDelta: state.prestige - prev.prestige,
    };

    // Only show if there were changes
    const hasChanges =
      d.levelDelta !== 0 ||
      d.scarDelta !== 0 ||
      d.crownDelta !== 0 ||
      Math.abs(d.corruptionDelta) >= 5 ||
      Math.abs(d.prestigeDelta) >= 5;

    if (hasChanges) {
      setPrevWeek(prev.week);
      setDelta(d);
      setOpen(true);
    }

    // Update stored state for next week
    const snapshot: StoredWeekState = {
      week: currentWeek,
      level: state.level,
      scar_count: state.scar_count,
      crown_count: state.crown_count,
      corruption: state.corruption,
      prestige: state.prestige,
    };
    localStorage.setItem(`${WEEKLY_RECAP_KEY}::${wallet}`, JSON.stringify(snapshot));
    localStorage.setItem(shownKey, "1");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, currentWeek]);

  if (!open || !delta) return null;

  const lines: Array<{ label: string; value: string; color: string }> = [];
  if (delta.levelDelta > 0) lines.push({ label: "Level up", value: `+${delta.levelDelta}`, color: "var(--neon-gold)" });
  if (delta.scarDelta > 0) lines.push({ label: "Scars gained", value: `+${delta.scarDelta}`, color: "var(--neon-red)" });
  if (delta.crownDelta > 0) lines.push({ label: "Crowns earned", value: `+${delta.crownDelta}`, color: "var(--neon-gold)" });
  if (delta.corruptionDelta > 0) lines.push({ label: "Corruption", value: `+${delta.corruptionDelta}`, color: "#9945ff" });
  if (delta.corruptionDelta < 0) lines.push({ label: "Corruption cleared", value: `${delta.corruptionDelta}`, color: "var(--neon-green)" });
  if (delta.prestigeDelta > 0) lines.push({ label: "Prestige gained", value: `+${delta.prestigeDelta}`, color: "var(--neon-gold)" });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-[var(--degen-card)] border-2 rounded-2xl p-6 max-w-sm w-full"
        style={{ borderColor: `${color}55` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] mb-1" style={{ color }}>
            Weekly Recap
          </div>
          <div className="text-xs text-gray-600 font-mono">
            {prevWeek} → {currentWeek}
          </div>
          <div className="text-lg font-black text-white mt-2">
            Your soul changed last week.
          </div>
        </div>

        {/* Change list */}
        <div className="space-y-2 mb-5">
          {lines.length === 0 ? (
            <div className="text-xs text-gray-600 text-center italic">
              No major changes. The soul held steady.
            </div>
          ) : (
            lines.map((l, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--degen-muted)] rounded-lg px-3 py-2">
                <div className="text-sm text-gray-300">{l.label}</div>
                <div className="text-sm font-black" style={{ color: l.color }}>{l.value}</div>
              </div>
            ))
          )}
        </div>

        {/* Current state */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-center">
          {[
            { label: "Level", value: state.level, color: "var(--neon-gold)" },
            { label: "Scars", value: state.scar_count, color: "var(--neon-red)" },
            { label: "Crowns", value: state.crown_count, color: "var(--neon-gold)" },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--degen-muted)] rounded-lg py-2">
              <div className="text-[10px] text-gray-600 uppercase tracking-widest">{item.label}</div>
              <div className="text-xl font-black" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `Week ${currentWeek}: Level ${state.level} · ${state.scar_count} scars · ${state.crown_count} crowns — DegenBorn`
              );
            }}
            className="flex-1 py-2 text-sm font-black rounded-lg"
            style={{ background: color, color: "#000" }}
          >
            Copy Recap
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm border border-[var(--degen-border)] text-gray-400 rounded-lg hover:border-gray-400 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
