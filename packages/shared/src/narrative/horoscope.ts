/**
 * T-HORO-01 — Daily Soul Horoscope.
 *
 * Fully deterministic: Seed = djb2(wallet + YYYY-MM-DD).
 * Same wallet + same date → same horoscope. Next day → different.
 * No LLM calls — pure static template bank.
 *
 * 6 archetypes × 5 fields × 10+ templates each.
 */
import type { ArchetypeId } from "../types/archetype";
import type { Mood } from "../types/state";

// ── djb2 hash — identical to name.ts impl ────────────────────────────────────
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

/** Pick an item from an array using a seed value (modulo). */
function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]!;
}

// ── Template bank ─────────────────────────────────────────────────────────────

export const HOROSCOPE_MOODS: Mood[] = [
  "neutral",
  "euphoria",
  "despair",
  "revenge",
  "greed",
  "ghost",
];

export const HOROSCOPE_MOOD_LABELS: Record<Mood, string> = {
  neutral: "NEUTRAL",
  euphoria: "EUPHORIA",
  despair: "DESPAIR",
  revenge: "REVENGE",
  greed: "GREED",
  ghost: "GHOST",
};

export const HOROSCOPE_LUCKY_TRAITS: string[] = [
  "🔥 revenge aura",
  "💎 diamond grip",
  "👁️ rug sense",
  "⚡ first-mover instinct",
  "🌙 late-night edge",
  "🩸 battle scars",
  "👑 crown energy",
  "🧟 zombie resilience",
  "🌊 ice clarity",
  "🎯 sniper reflex",
  "💀 flatline immunity",
  "🔮 chaos vision",
];

export const AVOID_LINES: Record<ArchetypeId, string[]> = {
  mad_gambler: [
    "Averaging down on the same token you rugged last week",
    "Opening three positions at once without checking the chart",
    "Aping into a token with a 5-minute chart and no liquidity",
    "Sending it before the contract is verified",
    "Rage-trading after a red candle — you'll make it worse",
    "Clicking buy on mobile with one eye open",
    "FOMO'ing into something that already 10x'd",
    "Going all-in on a Monday before coffee",
    "Trusting a dev who can't spell their own token name",
    "Doubling the position size to 'recover' faster",
  ],
  ice_whale: [
    "Moving your stop-loss just because it got uncomfortable",
    "Panic-selling a position you researched for three days",
    "Checking the chart more than once per hour",
    "Letting impatience turn a thesis into a trade",
    "Exiting early because someone in Telegram FUD'd",
    "Averaging up without a plan",
    "Breaking your hold time rule for no reason",
    "Listening to anyone with less conviction than you",
    "Reacting to a 2% dip in a 6-month position",
    "Selling the first crown just because it appeared",
  ],
  rug_necromancer: [
    "Averaging down on the 4th rug in a row",
    "Trusting a dev who went silent for 48 hours",
    "Entering a token where the contract has a mint function",
    "Sending it to a contract you haven't read",
    "Treating your corruption as a personality, not a warning",
    "Resurrecting a position that actually needs to die",
    "Letting your survival streak make you overconfident",
    "Buying a token just because you survived its cousin",
    "Ignoring your scar count — it's there for a reason",
    "Mistaking chaos for edge",
  ],
  diamond_cultist: [
    "Averaging down for the fifth time on the same bag",
    "Holding through a rug because 'conviction'",
    "Ignoring volume data because charts are noise to you",
    "Checking the all-time high and feeling good about now",
    "Converting a trade into a hold to avoid the loss",
    "Praying for a bounce in a dead token",
    "Adding to a position because you believe harder",
    "Treating your bags as a personality trait",
    "Following a cult you joined three corrections ago",
    "Refusing to exit even when the thesis is gone",
  ],
  sniper_jester: [
    "Holding anything longer than it takes to profit",
    "Getting attached to a token you were supposed to flip",
    "Staying in after the first 3x because 'it could 10x'",
    "Trading with a thesis — you're not built for that",
    "Letting a good trade turn into a bag",
    "Going slow when the market is fast",
    "Reading whitepapers — not your style, not your edge",
    "Waiting for a dip that already happened",
    "Entering too late just because others are printing",
    "Holding through a correction because you 'feel it'",
  ],
  ghost_bagholder: [
    "Opening the portfolio app — just don't",
    "Checking the price of that token from 2022",
    "Telling yourself it'll come back if you just wait",
    "Calculating what you'd have if you sold at the top",
    "Joining the Telegram to see if the devs are still alive",
    "Averaging down when the liquidity is gone",
    "Refreshing CoinGecko every 20 minutes",
    "Telling friends about a bag like it's still a trade",
    "Letting hope replace a stop-loss",
    "Holding through zero because selling means it's real",
  ],
};

export const EMBRACE_LINES: Record<ArchetypeId, string[]> = {
  mad_gambler: [
    "The first position of the day — make it the best one",
    "Your chaos is your edge when the market is slow",
    "Speed matters more than research today",
    "Aggression is the asset — deploy it early",
    "The market rewards those who move first",
    "Today is a send-it day — trust your gut",
    "Volatility is your environment. Breathe it in.",
    "Your entry speed is sharper than anyone else here",
    "The noise is your home. Navigate it.",
    "Impulsive is just another word for fast",
  ],
  ice_whale: [
    "The scar is the receipt",
    "Your patience is the position",
    "Let the noise pass — your thesis is still intact",
    "Hold. Everything else is distraction.",
    "Your conviction compounds while others panic",
    "The long game is still the only game",
    "Silence is your edge today",
    "One more day in the position is one day closer to right",
    "Your research was correct. Stand by it.",
    "The market eventually agrees with conviction",
  ],
  rug_necromancer: [
    "The scar is the receipt",
    "You've survived worse than this",
    "Every rug adds to the map — you know where not to go",
    "Your survival streak is the data. Trust it.",
    "Chaos is only dangerous if you don't know it personally",
    "You've been buried before. You know how to claw out.",
    "Today the necromancer breathes",
    "The dead tokens made you harder",
    "Your corruption is also your armor",
    "The market can't rug someone who's already rugged",
  ],
  diamond_cultist: [
    "Conviction is the rarest stat in this market",
    "Your thesis is intact. The price is not the thesis.",
    "The bag is heavy but your belief is heavier",
    "Long-term thinking is the ultimate edge",
    "Today, hold. Tomorrow, hold. Then it makes sense.",
    "Every diamond started as pressure",
    "Your patience costs nothing and compounds everything",
    "The faithful bag holder becomes the bag winner",
    "The market punishes doubt. You have none.",
    "Stay the course. The course is the point.",
  ],
  sniper_jester: [
    "In and out before they even see you",
    "Your speed is the moat — protect it",
    "The jester who laughs last profits",
    "Today's window is exactly your size",
    "Fast hands, clean exits, full pockets",
    "The market is slow today. You are not.",
    "Precision beats conviction here",
    "Take the shot when it opens. Don't think.",
    "Your reflexes are sharper than their research",
    "Laugh on the way in, laugh on the way out",
  ],
  ghost_bagholder: [
    "The ghost who waits sometimes gets the haunting right",
    "Stillness is also a strategy",
    "Not every day needs a move",
    "Your patience will outlast the market's memory",
    "Today, observe. Tomorrow, act.",
    "The bag you're holding might have one more breath",
    "Quiet conviction is still conviction",
    "The ghost who watches learns what the traders miss",
    "You've been this still before. It served you eventually.",
    "Waiting is free. Panic costs everything.",
  ],
};

export const FORTUNE_LINES: Record<ArchetypeId, string[]> = {
  mad_gambler: [
    "Your chaos is finally your edge today",
    "The next position is the one that makes the story",
    "Speed without hesitation is today's advantage",
    "The market is about to move. You're already in position.",
    "What looks reckless from outside is perfect from inside",
    "Today's ape is tomorrow's anecdote",
    "The degen who hesitates loses to the degen who doesn't",
    "Fortune favors the fast",
    "The chart can't track your gut",
    "Send it. The numbers will catch up.",
  ],
  ice_whale: [
    "The tide is turning in the direction of patience",
    "Your stillness today is the move",
    "What others call waiting, you call positioning",
    "The depth beneath your conviction cannot be measured",
    "The whale surfaces only when it chooses",
    "Your entry is already right — the market just needs time",
    "Calm is the sharpest instrument in volatile conditions",
    "The deep holder wins when the noise stops",
    "Your next exit will be remembered",
    "The ice doesn't melt from pressure — it redirects it",
  ],
  rug_necromancer: [
    "Your chaos is finally your edge today",
    "The necromancer who walks through fire emerges unburned",
    "You've died enough times to know this isn't death",
    "The most dangerous degen is the one who has nothing to lose",
    "Resurrection energy is peaking — trust it",
    "Today the dead token breathes again",
    "Your survival streak continues because it must",
    "The rug that couldn't kill you made you sharper",
    "Chaos recognizes chaos — and yields to it",
    "You carry the map of every bad trade. Use it.",
  ],
  diamond_cultist: [
    "The bag gets lighter right before it breaks",
    "What looks like stubbornness from outside is strategy from inside",
    "The deepest holders write the best endings",
    "Every red day is a test of the thesis — yours holds",
    "Conviction outlasts volatility in every cycle",
    "The diamond in the rough stays rough until it doesn't",
    "Your patience is the entry other people wish they had",
    "The long game begins where short-term thinking ends",
    "Hold the line. The line is all you have. It's enough.",
    "Belief compounds. You know this.",
  ],
  sniper_jester: [
    "In and out before they even see you — today especially",
    "The jester reads the room before the room reads itself",
    "Speed today is the only thesis that matters",
    "The window is open. You'll notice it before it closes.",
    "Luck doesn't explain your exits — skill does",
    "The market is laughing. You're laughing louder.",
    "Fast, clean, profitable. That's the whole story.",
    "Today's snipe has a name. You already know it.",
    "The jester wins by understanding the joke before it lands",
    "Precision is kindness to your portfolio",
  ],
  ghost_bagholder: [
    "The ghost who waits sometimes gets the haunting right",
    "Something shifts today in a bag you'd forgotten",
    "Stillness today is tomorrow's position",
    "The market remembers holders who don't panic",
    "Your silence is being rewarded somewhere in the chain",
    "Even ghosts have their moments of clarity",
    "One of your bags is about to breathe",
    "The quietest wallet in the room sometimes wins the biggest",
    "What you didn't sell might be exactly what saves you",
    "The bagholder who holds longest holds the story",
  ],
};

// ── Public types ──────────────────────────────────────────────────────────────

export interface DailyHoroscope {
  wallet: string;
  date: string;          // YYYY-MM-DD
  archetype: ArchetypeId;
  mood: Mood;
  moodLabel: string;
  luckyTrait: string;
  avoid: string;
  embrace: string;
  fortune: string;
}

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Generate a daily horoscope for a wallet + archetype pair.
 *
 * @param wallet - Wallet address (case-insensitive)
 * @param archetype - One of the 6 archetype IDs
 * @param date - ISO date string "YYYY-MM-DD" (defaults to today UTC)
 * @returns DailyHoroscope — deterministic for a given wallet+date
 */
export function getDailyHoroscope(
  wallet: string,
  archetype: ArchetypeId,
  date?: string,
): DailyHoroscope {
  const today = date ?? new Date().toISOString().slice(0, 10);
  const seed = djb2(wallet.toLowerCase() + today);

  const mood = pick(HOROSCOPE_MOODS, seed, 0);
  const luckyTrait = pick(HOROSCOPE_LUCKY_TRAITS, seed, 1);
  const avoid = pick(AVOID_LINES[archetype], seed, 2);
  const embrace = pick(EMBRACE_LINES[archetype], seed, 3);
  const fortune = pick(FORTUNE_LINES[archetype], seed, 4);

  return {
    wallet: wallet.toLowerCase(),
    date: today,
    archetype,
    mood,
    moodLabel: HOROSCOPE_MOOD_LABELS[mood],
    luckyTrait,
    avoid,
    embrace,
    fortune,
  };
}
