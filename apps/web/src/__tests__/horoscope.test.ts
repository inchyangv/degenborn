/**
 * T-HORO-01 — Daily Soul Horoscope unit tests.
 *
 * AC:
 * - Same date = same horoscope (determinism)
 * - Different date = different horoscope
 * - All 6 archetypes return valid horoscopes
 * - 5 days × 3 wallets = 15 cases, all well-formed
 */
import { getDailyHoroscope } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";

const WALLETS = [
  "0xabc1234567890abcdef1234567890abcdef12345",
  "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
  "0x1111111111111111111111111111111111111111",
];

const ARCHETYPES: ArchetypeId[] = [
  "mad_gambler",
  "ice_whale",
  "rug_necromancer",
  "diamond_cultist",
  "sniper_jester",
  "ghost_bagholder",
];

const DATES = [
  "2026-04-13",
  "2026-04-14",
  "2026-04-15",
  "2026-04-16",
  "2026-04-17",
];

describe("getDailyHoroscope — determinism", () => {
  test("same wallet + same date + same archetype → identical horoscope", () => {
    const h1 = getDailyHoroscope(WALLETS[0]!, "mad_gambler", "2026-04-13");
    const h2 = getDailyHoroscope(WALLETS[0]!, "mad_gambler", "2026-04-13");
    expect(h1).toEqual(h2);
  });

  test("different date → different mood or fortune", () => {
    const h1 = getDailyHoroscope(WALLETS[0]!, "rug_necromancer", "2026-04-13");
    const h2 = getDailyHoroscope(WALLETS[0]!, "rug_necromancer", "2026-04-14");
    // At least one field should differ across dates
    const sameEverything =
      h1.mood === h2.mood &&
      h1.luckyTrait === h2.luckyTrait &&
      h1.avoid === h2.avoid &&
      h1.embrace === h2.embrace &&
      h1.fortune === h2.fortune;
    expect(sameEverything).toBe(false);
  });

  test("different wallet → different horoscope on same date", () => {
    const h1 = getDailyHoroscope(WALLETS[0]!, "ice_whale", "2026-04-13");
    const h2 = getDailyHoroscope(WALLETS[1]!, "ice_whale", "2026-04-13");
    const sameEverything =
      h1.mood === h2.mood &&
      h1.luckyTrait === h2.luckyTrait &&
      h1.avoid === h2.avoid &&
      h1.embrace === h2.embrace &&
      h1.fortune === h2.fortune;
    expect(sameEverything).toBe(false);
  });

  test("wallet address is case-insensitive", () => {
    const h1 = getDailyHoroscope("0xABC123", "mad_gambler", "2026-04-13");
    const h2 = getDailyHoroscope("0xabc123", "mad_gambler", "2026-04-13");
    expect(h1).toEqual(h2);
  });
});

describe("getDailyHoroscope — all archetypes", () => {
  test.each(ARCHETYPES)("archetype %s returns a valid horoscope", (archetype) => {
    const h = getDailyHoroscope(WALLETS[0]!, archetype, "2026-04-13");
    expect(h.archetype).toBe(archetype);
    expect(h.mood).toBeTruthy();
    expect(h.moodLabel).toBeTruthy();
    expect(h.luckyTrait.length).toBeGreaterThan(0);
    expect(h.avoid.length).toBeGreaterThan(0);
    expect(h.embrace.length).toBeGreaterThan(0);
    expect(h.fortune.length).toBeGreaterThan(0);
    expect(h.date).toBe("2026-04-13");
  });
});

describe("getDailyHoroscope — 15 cases (5 days × 3 wallets)", () => {
  const cases: Array<{ wallet: string; date: string }> = WALLETS.slice(0, 3).flatMap((w) =>
    DATES.map((d) => ({ wallet: w, date: d })),
  );

  test("all 15 cases produce well-formed horoscopes", () => {
    for (const { wallet, date } of cases) {
      const h = getDailyHoroscope(wallet, "mad_gambler", date);
      expect(h.wallet).toBe(wallet);
      expect(h.date).toBe(date);
      expect(h.archetype).toBe("mad_gambler");
      expect(typeof h.mood).toBe("string");
      expect(typeof h.avoid).toBe("string");
      expect(typeof h.embrace).toBe("string");
      expect(typeof h.fortune).toBe("string");
    }
  });

  test("all 15 cases produce unique (wallet, date) combinations", () => {
    const keys = new Set<string>();
    for (const { wallet, date } of cases) {
      keys.add(`${wallet}::${date}`);
    }
    expect(keys.size).toBe(15);
  });
});
