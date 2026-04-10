import { classify } from "../classifier";
import type { PersonaDNA } from "@degenborn/shared";

const WALLET = "0xtest";

function makeDNA(overrides: Partial<PersonaDNA> = {}): PersonaDNA {
  return {
    wallet_address: WALLET,
    aggression: 50,
    conviction: 50,
    chaos: 50,
    luck: 50,
    survival: 50,
    computed_at: 0,
    event_count: 100,
    ...overrides,
  };
}

describe("classify", () => {
  it("returns exactly one archetype for any DNA", () => {
    const result = classify(makeDNA());
    expect(result.archetype).toBeDefined();
    expect(result.profile).toBeDefined();
  });

  it("classifies mad_gambler: high aggression + high chaos + low luck", () => {
    const dna = makeDNA({ aggression: 80, chaos: 75, luck: 20, conviction: 40, survival: 40 });
    const result = classify(dna);
    expect(result.archetype).toBe("mad_gambler");
  });

  it("classifies ice_whale: high conviction + high luck + high survival", () => {
    const dna = makeDNA({ conviction: 85, luck: 75, survival: 70, aggression: 20, chaos: 15 });
    const result = classify(dna);
    expect(result.archetype).toBe("ice_whale");
  });

  it("classifies rug_necromancer: high chaos + high survival", () => {
    const dna = makeDNA({ chaos: 80, survival: 75, conviction: 30, aggression: 40, luck: 30 });
    const result = classify(dna);
    expect(result.archetype).toBe("rug_necromancer");
  });

  it("classifies diamond_cultist: high conviction + low luck + high survival", () => {
    const dna = makeDNA({ conviction: 80, luck: 20, survival: 70, aggression: 30, chaos: 30 });
    const result = classify(dna);
    expect(result.archetype).toBe("diamond_cultist");
  });

  it("classifies sniper_jester: high aggression + high luck", () => {
    const dna = makeDNA({ aggression: 80, luck: 80, conviction: 20, chaos: 30, survival: 40 });
    const result = classify(dna);
    expect(result.archetype).toBe("sniper_jester");
  });

  it("classifies ghost_bagholder: high conviction + high chaos + low survival", () => {
    const dna = makeDNA({ conviction: 75, chaos: 70, survival: 15, aggression: 30, luck: 30 });
    const result = classify(dna);
    expect(result.archetype).toBe("ghost_bagholder");
  });

  it("every possible edge-case DNA resolves to exactly one archetype", () => {
    const edges = [
      makeDNA({ aggression: 0, conviction: 0, chaos: 0, luck: 0, survival: 0 }),
      makeDNA({ aggression: 100, conviction: 100, chaos: 100, luck: 100, survival: 100 }),
      makeDNA({ aggression: 50, conviction: 50, chaos: 50, luck: 50, survival: 50 }),
    ];
    for (const dna of edges) {
      const r = classify(dna);
      expect(r.archetype).toBeDefined();
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });
});
