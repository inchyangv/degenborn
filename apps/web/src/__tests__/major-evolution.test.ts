import { checkEvolutionTrigger, buildEvolutionPrompt } from "../lib/major-evolution";
import { createInitialState } from "../lib/state-machine";
import type { CharacterState } from "@degenborn/shared";

const WALLET = "0xtest";

function makeState(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    ...createInitialState(WALLET, "rug_necromancer"),
    ...overrides,
  };
}

describe("Major Evolution", () => {
  it("no rerender when state barely changes", () => {
    const before = makeState({ level: 1, prestige: 10 });
    const after = makeState({ level: 1, prestige: 15 });
    const result = checkEvolutionTrigger(before, after);
    expect(result.should_rerender).toBe(false);
  });

  it("triggers rerender on level crossing threshold 3", () => {
    const before = makeState({ level: 2 });
    const after = makeState({ level: 3 });
    const result = checkEvolutionTrigger(before, after);
    expect(result.should_rerender).toBe(true);
    expect(result.trigger).toBe("level_up_3");
  });

  it("triggers rerender on level crossing threshold 5", () => {
    const before = makeState({ level: 4 });
    const after = makeState({ level: 5 });
    const result = checkEvolutionTrigger(before, after);
    expect(result.should_rerender).toBe(true);
    expect(result.trigger).toBe("level_up_5");
  });

  it("triggers rerender on prestige surge past 70", () => {
    const before = makeState({ prestige: 65 });
    const after = makeState({ prestige: 72 });
    const result = checkEvolutionTrigger(before, after);
    expect(result.should_rerender).toBe(true);
    expect(result.trigger).toBe("prestige_surge");
  });

  it("triggers rerender on rug ascension: corruption >= 60 + survival_streak >= 3", () => {
    const before = makeState({ corruption: 50, survival_streak: 3 });
    const after = makeState({ corruption: 62, survival_streak: 3 });
    const result = checkEvolutionTrigger(before, after);
    expect(result.should_rerender).toBe(true);
    expect(result.trigger).toBe("rug_ascension");
  });

  it("triggers rerender on scarred comeback: scar_count >= 3 + revenge mood", () => {
    const before = makeState({ mood: "despair", scar_count: 3 });
    const after = makeState({ mood: "revenge", scar_count: 3 });
    const result = checkEvolutionTrigger(before, after);
    expect(result.should_rerender).toBe(true);
    expect(result.trigger).toBe("scarred_comeback");
  });

  it("evolved_seed is deterministic for same state+trigger", () => {
    const before = makeState({ level: 4 });
    const after = makeState({ level: 5 });
    const r1 = checkEvolutionTrigger(before, after);
    const r2 = checkEvolutionTrigger(before, after);
    expect(r1.evolved_seed).toBe(r2.evolved_seed);
  });

  it("buildEvolutionPrompt contains archetype and trigger modifier", () => {
    const state = makeState({ prestige: 75, corruption: 30 });
    const dna = { wallet_address: WALLET, aggression: 50, conviction: 50, chaos: 80, luck: 40, survival: 90, computed_at: 0, event_count: 10 };
    const prompt = buildEvolutionPrompt("rug_necromancer", dna, state, "prestige_surge");
    expect(prompt).toContain("rug necromancer");
    expect(prompt).toContain("golden");
  });

  it("does not trigger on same level / same prestige", () => {
    const before = makeState({ level: 5, prestige: 70, corruption: 60, survival_streak: 3, mood: "revenge", scar_count: 3 });
    const after = { ...before }; // identical state
    const result = checkEvolutionTrigger(before, after);
    expect(result.should_rerender).toBe(false);
  });
});
