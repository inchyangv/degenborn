/**
 * Badge system unit tests
 * Run with: npx jest src/__tests__/badges.test.ts
 */
import { evaluateBadges, diffBadges, BADGE_CATALOG, pickShowcaseBadges } from "@degenborn/shared";
import type { CharacterState } from "@degenborn/shared";

function makeState(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    wallet_address: "0xtest",
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
    ...overrides,
  };
}

describe("BADGE_CATALOG", () => {
  it("has at least 15 badges", () => {
    expect(BADGE_CATALOG.length).toBeGreaterThanOrEqual(15);
  });

  it("all badges have required fields", () => {
    for (const badge of BADGE_CATALOG) {
      expect(typeof badge.id).toBe("string");
      expect(typeof badge.name).toBe("string");
      expect(typeof badge.description).toBe("string");
      expect(typeof badge.emoji).toBe("string");
      expect(["common", "uncommon", "rare", "epic", "mythic"]).toContain(badge.rarity);
      expect(typeof badge.check).toBe("function");
    }
  });
});

describe("evaluateBadges", () => {
  it("fresh state earns only four_meme_native", () => {
    const badges = evaluateBadges(makeState());
    expect(badges.map((b) => b.id)).toEqual(["four_meme_native"]);
  });

  it("first_blood earned when crown_count >= 1", () => {
    const badges = evaluateBadges(makeState({ crown_count: 1 }));
    expect(badges.some((b) => b.id === "first_blood")).toBe(true);
  });

  it("triple_crowned earned when crown_count >= 3", () => {
    const badges = evaluateBadges(makeState({ crown_count: 3 }));
    expect(badges.some((b) => b.id === "triple_crowned")).toBe(true);
  });

  it("hall_of_scars earned when scar_count >= 5", () => {
    const badges = evaluateBadges(makeState({ scar_count: 5 }));
    expect(badges.some((b) => b.id === "hall_of_scars")).toBe(true);
  });

  it("phoenix_protocol earned when survival_streak >= 3", () => {
    const badges = evaluateBadges(makeState({ survival_streak: 3 }));
    expect(badges.some((b) => b.id === "phoenix_protocol")).toBe(true);
  });

  it("the_flatline earned when mood === ghost", () => {
    const badges = evaluateBadges(makeState({ mood: "ghost" }));
    expect(badges.some((b) => b.id === "the_flatline")).toBe(true);
  });

  it("rug_necromancer_badge earned at corruption >= 60 and survival_streak >= 2", () => {
    const badges = evaluateBadges(makeState({ corruption: 65, survival_streak: 2 }));
    expect(badges.some((b) => b.id === "rug_necromancer_badge")).toBe(true);
  });

  it("evaluateBadges is deterministic — same state always returns same result", () => {
    const state = makeState({ crown_count: 2, scar_count: 3, survival_streak: 2 });
    const r1 = evaluateBadges(state).map((b) => b.id);
    const r2 = evaluateBadges(state).map((b) => b.id);
    expect(r1).toEqual(r2);
  });
});

describe("diffBadges", () => {
  it("returns newly earned badges on state transition", () => {
    const before = makeState({ crown_count: 0 });
    const after = makeState({ crown_count: 1 });
    const diff = diffBadges(before, after);
    expect(diff).toContain("first_blood");
  });

  it("returns empty array when no new badges earned", () => {
    const state = makeState({ crown_count: 1 });
    const diff = diffBadges(state, state);
    expect(diff).toHaveLength(0);
  });

  it("does not include badges already earned before", () => {
    const before = makeState({ crown_count: 1 }); // already has first_blood
    const after = makeState({ crown_count: 2 });  // still has first_blood, no new triple-crowned yet
    const diff = diffBadges(before, after);
    expect(diff).not.toContain("first_blood");
  });
});

describe("pickShowcaseBadges", () => {
  it("returns at most n badges", () => {
    const state = makeState({ crown_count: 3, scar_count: 5, survival_streak: 3, corruption: 65, mood: "ghost" });
    const earned = evaluateBadges(state);
    const showcase = pickShowcaseBadges(earned, 3);
    expect(showcase.length).toBeLessThanOrEqual(3);
  });

  it("prefers higher rarity badges", () => {
    const state = makeState({ crown_count: 3, scar_count: 5, survival_streak: 3, corruption: 65 });
    const earned = evaluateBadges(state);
    const showcase = pickShowcaseBadges(earned, 3);
    // All picked should be at least rare
    const rarities = showcase.map((b) => b.rarity);
    expect(rarities.every((r) => ["rare", "epic", "mythic"].includes(r))).toBe(true);
  });
});
