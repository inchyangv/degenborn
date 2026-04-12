/**
 * T-HORO-01 — /horoscope page.
 *
 * Standalone share page for the daily soul horoscope.
 * URL: /horoscope?wallet=0x...&archetype=rug_necromancer
 *
 * Reads wallet + archetype from query params and renders the full horoscope card.
 */
import type { Metadata } from "next";
import { ARCHETYPE_PROFILES, getDailyHoroscope } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";
import DailyHoroscope from "@/components/DailyHoroscope";

interface Props {
  searchParams: Promise<{ wallet?: string; archetype?: string; date?: string }>;
}

const VALID_ARCHETYPES: ArchetypeId[] = [
  "mad_gambler",
  "ice_whale",
  "rug_necromancer",
  "diamond_cultist",
  "sniper_jester",
  "ghost_bagholder",
];

function isValidArchetype(v: string): v is ArchetypeId {
  return VALID_ARCHETYPES.includes(v as ArchetypeId);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const wallet = params.wallet ?? "0x0000000000000000000000000000000000000000";
  const archetype: ArchetypeId = isValidArchetype(params.archetype ?? "")
    ? (params.archetype as ArchetypeId)
    : "mad_gambler";

  const horoscope = getDailyHoroscope(wallet, archetype, params.date);
  const profile = ARCHETYPE_PROFILES[archetype];
  const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  return {
    title: `${short}'s Daily Reading — DegenBorn`,
    description: `${profile.name} · ${horoscope.date} · "${horoscope.fortune}"`,
    openGraph: {
      title: `${short}'s DegenBorn Daily Reading`,
      description: `Mood: ${horoscope.moodLabel} · ${horoscope.fortune}`,
    },
    twitter: {
      card: "summary",
      title: `${short}'s DegenBorn Daily Reading`,
      description: `Mood: ${horoscope.moodLabel} · ${horoscope.fortune}`,
    },
  };
}

export default async function HoroscopePage({ searchParams }: Props) {
  const params = await searchParams;
  const wallet = params.wallet ?? "0x0000000000000000000000000000000000000000";
  const archetype: ArchetypeId = isValidArchetype(params.archetype ?? "")
    ? (params.archetype as ArchetypeId)
    : "mad_gambler";
  const date = params.date;

  const isDemo = !params.wallet;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs tracking-widest uppercase opacity-40">DegenBorn</div>
          <h1 className="text-xl font-bold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            Daily Soul Reading
          </h1>
          {isDemo && (
            <p className="text-xs opacity-40">
              Demo mode — connect at{" "}
              <a href="/" className="underline opacity-70">degenborn.xyz</a>
            </p>
          )}
        </div>

        <DailyHoroscope
          wallet={wallet}
          archetype={archetype}
          date={date}
          standalone
        />

        {!isDemo && (
          <div className="text-center">
            <a
              href={`/m/${wallet}`}
              className="text-xs opacity-50 hover:opacity-80 transition-opacity underline"
            >
              ← Back to Monster Room
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
