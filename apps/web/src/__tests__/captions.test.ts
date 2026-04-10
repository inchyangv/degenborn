/**
 * Caption bank + pickCaption unit tests
 * Run with: npx jest src/__tests__/captions.test.ts
 */
import { pickCaption, CAPTION_BANK, CAPTION_CROWN, CAPTION_SCAR } from "@degenborn/shared";
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

describe("CAPTION_BANK", () => {
  it("has entries for all 6 archetypes", () => {
    const archetypes = ["mad_gambler", "ice_whale", "rug_necromancer", "diamond_cultist", "sniper_jester", "ghost_bagholder"];
    for (const a of archetypes) {
      expect(CAPTION_BANK[a]).toBeDefined();
      expect(CAPTION_BANK[a]!.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("all captions are non-empty strings", () => {
    for (const [archetype, captions] of Object.entries(CAPTION_BANK)) {
      for (const c of captions) {
        expect(typeof c).toBe("string");
        expect(c.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("pickCaption", () => {
  it("returns a string for any archetype", () => {
    const state = makeState();
    const caption = pickCaption("rug_necromancer", state);
    expect(typeof caption).toBe("string");
    expect(caption.length).toBeGreaterThan(0);
  });

  it("returns a crown caption when crown_count >= 1 and no scar", () => {
    const state = makeState({ crown_count: 1, scar_count: 0 });
    const caption = pickCaption("rug_necromancer", state);
    expect(CAPTION_CROWN).toContain(caption);
  });

  it("returns a scar caption when scar_count >= 1 and no crown", () => {
    const state = makeState({ crown_count: 0, scar_count: 1 });
    const caption = pickCaption("rug_necromancer", state);
    expect(CAPTION_SCAR).toContain(caption);
  });

  it("is deterministic — same state always returns same caption", () => {
    const state = makeState({ level: 3, crown_count: 0, scar_count: 0 });
    const c1 = pickCaption("mad_gambler", state);
    const c2 = pickCaption("mad_gambler", state);
    expect(c1).toBe(c2);
  });

  it("falls back gracefully for unknown archetype", () => {
    const state = makeState();
    const caption = pickCaption("unknown_archetype", state);
    expect(typeof caption).toBe("string");
    expect(caption.length).toBeGreaterThan(0);
  });
});
