/**
 * T-COL-02 — computeTier unit tests
 * 5 boundary cases: one per tier
 */
import { computeTier } from "@degenborn/shared";

describe("computeTier", () => {
  it("returns common when no axis is extreme", () => {
    expect(
      computeTier({ aggression: 50, conviction: 50, chaos: 50, luck: 50, survival: 50 }),
    ).toBe("common");
  });

  it("returns uncommon when exactly 1 axis is extreme", () => {
    expect(
      computeTier({ aggression: 85, conviction: 50, chaos: 50, luck: 50, survival: 50 }),
    ).toBe("uncommon");
  });

  it("returns rare when 2 axes are extreme", () => {
    expect(
      computeTier({ aggression: 85, conviction: 15, chaos: 50, luck: 50, survival: 50 }),
    ).toBe("rare");
  });

  it("returns epic when 3 axes are extreme", () => {
    expect(
      computeTier({ aggression: 90, conviction: 10, chaos: 90, luck: 50, survival: 50 }),
    ).toBe("epic");
  });

  it("returns mythic when 4+ axes extreme AND stdDev >= 30", () => {
    // aggression=90, conviction=10, chaos=90, luck=10 → 4 extreme; stdDev is large
    expect(
      computeTier({ aggression: 90, conviction: 10, chaos: 90, luck: 10, survival: 50 }),
    ).toBe("mythic");
  });

  it("returns epic (not mythic) when 4 extreme but stdDev < 30", () => {
    // All extreme but uniform extremity → e.g. all 80. stdDev = 0
    expect(
      computeTier({ aggression: 80, conviction: 80, chaos: 80, luck: 80, survival: 50 }),
    ).toBe("epic");
  });

  it("returns rare when stdDev >= 25 with no extreme axes", () => {
    // 21,21,21,79,79 → extremeCount=0 (all between 21-79), stdDev≈28.4 ≥ 25 → rare
    const dna = { aggression: 21, conviction: 21, chaos: 21, luck: 79, survival: 79 };
    const axes = [21, 21, 21, 79, 79];
    const mean = axes.reduce((s, v) => s + v, 0) / 5;
    const std = Math.sqrt(axes.reduce((s, v) => s + (v - mean) ** 2, 0) / 5);
    expect(std).toBeGreaterThanOrEqual(25);
    expect(computeTier(dna)).toBe("rare");
  });
});
