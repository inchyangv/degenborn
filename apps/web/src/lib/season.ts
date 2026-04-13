/**
 * T4-05 — Degen Season framework
 *
 * Seasons are time-boxed events with:
 * - A theme ("Rug Season", "Bull Run", "Ghost Month")
 * - Bonus conditions that grant extra badges
 * - A start/end timestamp
 * - Season report card auto-generated on visit after season end
 */

export type SeasonTheme = "rug_season" | "bull_run" | "ghost_month" | "diamond_age";

export interface Season {
  id: string;
  name: string;
  theme: SeasonTheme;
  description: string;
  emoji: string;
  color: string;
  start_at: number;  // unix seconds
  end_at: number;    // unix seconds
  bonus_condition: string;
  bonus_badge: string;
  bonus_badge_description: string;
}

export interface SeasonBadge {
  season_id: string;
  season_name: string;
  badge: string;
  earned_at: number;
}

/** All seasons — static for hackathon demo */
const NOW = Math.floor(Date.now() / 1000);
const DAY = 86400;
const WEEK = 7 * DAY;

export const SEASONS: Season[] = [
  {
    id: "rug_season_s1",
    name: "Rug Season",
    theme: "rug_season",
    description:
      "The most treacherous fortnight on Four.meme. Every survivor earns a permanent mark of resilience.",
    emoji: "☠️",
    color: "#ff3d3d",
    start_at: NOW - 14 * DAY,
    end_at: NOW + 0,           // ending today — FOMO!
    bonus_condition: "Survive a rug pull during this season → earn Rug Season Survivor badge",
    bonus_badge: "☠️ Rug Season Survivor",
    bonus_badge_description:
      "Held through a rug pull during Rug Season and lived to tell the tale.",
  },
  {
    id: "bull_run_s1",
    name: "Bull Run",
    theme: "bull_run",
    description:
      "Win streak bonuses activate. Three consecutive wins = double crown points. The market is yours.",
    emoji: "🐂",
    color: "#00ff88",
    start_at: NOW,
    end_at: NOW + 14 * DAY,    // active now
    bonus_condition: "3+ consecutive wins during Bull Run → earn Bull Run Champion badge",
    bonus_badge: "🐂 Bull Run Champion",
    bonus_badge_description:
      "Achieved a 3+ win streak while the bulls were charging. Unstoppable.",
  },
  {
    id: "ghost_month_s1",
    name: "Ghost Month",
    theme: "ghost_month",
    description:
      "Honor the fallen. The longest-held dead position earns a Ghost of Ghosts badge. Inactivity is a strategy.",
    emoji: "👻",
    color: "#9945ff",
    start_at: NOW + 14 * DAY,
    end_at: NOW + 28 * DAY,    // upcoming
    bonus_condition:
      "Hold a dead token (0 USD value) for 30+ days during Ghost Month → Ghost of Ghosts badge",
    bonus_badge: "👻 Ghost of Ghosts",
    bonus_badge_description:
      "Maintained a dead position through the entire Ghost Month. Legendary patience or legendary denial.",
  },
  {
    id: "diamond_age_s1",
    name: "Diamond Age",
    theme: "diamond_age",
    description:
      "Conviction is currency. The longest uninterrupted hold earns Diamond Eternity. No sells allowed.",
    emoji: "💎",
    color: "#00d4ff",
    start_at: NOW + 28 * DAY,
    end_at: NOW + 42 * DAY,    // future
    bonus_condition:
      "Hold any Four.meme token for 14+ consecutive days without selling → Diamond Eternity badge",
    bonus_badge: "💎 Diamond Eternity",
    bonus_badge_description:
      "Held through the entire Diamond Age without a single exit. Absolute conviction.",
  },
];

export function getActiveSeason(nowSeconds?: number): Season | null {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  return SEASONS.find((s) => s.start_at <= now && s.end_at >= now) ?? null;
}

export function getUpcomingSeason(nowSeconds?: number): Season | null {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  return SEASONS.find((s) => s.start_at > now) ?? null;
}

export function getRecentlyEndedSeason(nowSeconds?: number): Season | null {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const DAY_WINDOW = 7 * 86400;
  return (
    SEASONS.find((s) => s.end_at < now && now - s.end_at < DAY_WINDOW) ?? null
  );
}

export function getSeasonStatus(season: Season): "active" | "upcoming" | "ended" {
  const now = Math.floor(Date.now() / 1000);
  if (now < season.start_at) return "upcoming";
  if (now > season.end_at) return "ended";
  return "active";
}

export function formatSeasonDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function seasonDaysRemaining(season: Season): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, Math.ceil((season.end_at - now) / 86400));
}
