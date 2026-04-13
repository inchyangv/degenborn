"use client";

/**
 * T4-05 — Degen Season events page (/season)
 *
 * Displays:
 * - Active season with countdown
 * - Upcoming seasons
 * - Recently ended seasons with report summary
 * - Season badge system
 */

import Link from "next/link";
import {
  SEASONS,
  getActiveSeason,
  getUpcomingSeason,
  getSeasonStatus,
  formatSeasonDate,
  seasonDaysRemaining,
} from "@/lib/season";
import type { Season } from "@/lib/season";

function StatusBadge({ status }: { status: "active" | "upcoming" | "ended" }) {
  const styles = {
    active: { bg: "#00ff8822", color: "#00ff88", border: "#00ff8844", text: "🟢 LIVE NOW" },
    upcoming: { bg: "#00d4ff22", color: "#00d4ff", border: "#00d4ff44", text: "🔵 UPCOMING" },
    ended: { bg: "#ff3d3d22", color: "#ff3d3d", border: "#ff3d3d44", text: "⚪ ENDED" },
  };
  const s = styles[status];
  return (
    <span
      className="text-[10px] font-black px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.text}
    </span>
  );
}

function SeasonCard({ season }: { season: Season }) {
  const status = getSeasonStatus(season);
  const daysLeft = status === "active" ? seasonDaysRemaining(season) : 0;
  const daysUntil =
    status === "upcoming"
      ? Math.ceil((season.start_at - Math.floor(Date.now() / 1000)) / 86400)
      : 0;

  return (
    <div
      className="rounded-2xl border-2 p-5 transition-all"
      style={{
        borderColor: status === "active" ? season.color : `${season.color}44`,
        background:
          status === "active"
            ? `linear-gradient(135deg, ${season.color}15 0%, #0a0a0f 100%)`
            : `linear-gradient(135deg, ${season.color}06 0%, #0a0a0f 100%)`,
        boxShadow: status === "active" ? `0 0 30px ${season.color}20` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{season.emoji}</span>
          <div>
            <div className="font-black text-white text-base">{season.name}</div>
            <div className="text-[10px] text-gray-600 font-mono">
              {formatSeasonDate(season.start_at)} — {formatSeasonDate(season.end_at)}
            </div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{season.description}</p>

      {/* Countdown */}
      {status === "active" && daysLeft > 0 && (
        <div
          className="rounded-xl p-3 mb-3 text-center"
          style={{ background: `${season.color}11`, border: `1px solid ${season.color}33` }}
        >
          <div className="text-2xl font-black" style={{ color: season.color }}>
            {daysLeft}d
          </div>
          <div className="text-[10px] text-gray-500">remaining — don&apos;t miss it</div>
        </div>
      )}
      {status === "upcoming" && (
        <div
          className="rounded-xl p-3 mb-3 text-center"
          style={{ background: `${season.color}08`, border: `1px solid ${season.color}22` }}
        >
          <div className="text-xl font-black text-gray-400">in {daysUntil} days</div>
          <div className="text-[10px] text-gray-600">prepare yourself</div>
        </div>
      )}

      {/* Bonus condition */}
      <div
        className="rounded-xl p-3 mb-4"
        style={{ background: "#0a0a14", border: `1px solid ${season.color}22` }}
      >
        <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">
          Season Badge
        </div>
        <div className="text-sm font-black mb-1" style={{ color: season.color }}>
          {season.bonus_badge}
        </div>
        <div className="text-[10px] text-gray-500 leading-relaxed">
          {season.bonus_condition}
        </div>
      </div>

      {/* Share CTA for active season */}
      {status === "active" && (
        <button
          onClick={() => {
            const text = encodeURIComponent(
              `${season.emoji} ${season.name} is LIVE on DegenBorn × @four_meme!\n\n${season.description}\n\n🏆 Earn: ${season.bonus_badge}\n\nJoin → degenborn.xyz/season\n#DegenBorn #DegenSeason @four_meme`
            );
            window.open(
              `https://twitter.com/intent/tweet?text=${text}`,
              "_blank",
              "noopener"
            );
          }}
          className="w-full py-2.5 font-black text-sm rounded-xl transition-all text-black hover:brightness-110"
          style={{ background: season.color }}
        >
          𝕏 Share This Season
        </button>
      )}
    </div>
  );
}

export default function SeasonPage() {
  const activeSeason = getActiveSeason();
  const upcomingSeason = getUpcomingSeason();

  const shareToX = () => {
    const text = encodeURIComponent(
      `DegenBorn Season events are live! 🎯\n\nTime-limited badges. Limited window. Four.meme trades count.\n\nCheck your season status → degenborn.xyz/season\n#DegenBorn @four_meme`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener"
    );
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--degen-border)]">
        <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
          ← Home
        </Link>
        <div className="text-xs text-[var(--neon-gold)] font-mono uppercase tracking-widest">
          Degen Season
        </div>
        <Link href="/gallery" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          Gallery →
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🗓️</div>
          <h1 className="text-3xl font-black text-[var(--neon-gold)] mb-2">Degen Season</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Time-limited events on Four.meme. Each season has unique bonus conditions and
            exclusive badges. Miss it and it&apos;s gone forever.
          </p>
          {activeSeason && (
            <div
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black"
              style={{
                background: `${activeSeason.color}22`,
                color: activeSeason.color,
                border: `1px solid ${activeSeason.color}55`,
              }}
            >
              <span className="animate-pulse">●</span>
              {activeSeason.name} is happening now — {seasonDaysRemaining(activeSeason)} days left
            </div>
          )}
        </div>

        {/* FOMO banner */}
        <div
          className="rounded-2xl p-4 mb-8 text-center border"
          style={{ borderColor: "#ffd70033", background: "#ffd70008" }}
        >
          <div className="text-sm font-black text-[#ffd700] mb-1">
            ⚠️ Season badges are time-limited and non-repeatable
          </div>
          <div className="text-xs text-gray-500">
            Once a season ends, the badge is only available to those who qualified. Trade on
            Four.meme to earn them while the window is open.
          </div>
        </div>

        {/* Season list */}
        <div className="space-y-4 mb-10">
          {SEASONS.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>

        {/* How it works */}
        <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-2xl p-5 mb-8">
          <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">
            How Season Badges Work
          </div>
          <div className="space-y-2">
            {[
              {
                icon: "⚡",
                text: "Trade on Four.meme during the season window",
              },
              {
                icon: "🎯",
                text: "Meet the bonus condition (survive rug, win streak, etc.)",
              },
              {
                icon: "🏆",
                text: "Connect your wallet to DegenBorn — badge auto-awarded",
              },
              {
                icon: "🔒",
                text: "Badge is permanently visible in your Monster Room",
              },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="flex-shrink-0 mt-0.5">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="text-center mb-6">
          <button
            onClick={shareToX}
            className="px-6 py-3 font-black text-sm rounded-xl text-black hover:brightness-110 transition-all"
            style={{ background: "var(--neon-gold)" }}
          >
            𝕏 Tell Your Degen Friends
          </button>
        </div>

        <div className="text-center text-[10px] text-gray-800">
          Season events powered by Four.meme on-chain activity · DegenBorn
        </div>
      </div>
    </div>
  );
}
