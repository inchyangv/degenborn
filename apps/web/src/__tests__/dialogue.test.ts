/**
 * Character dialogue unit tests
 * Run with: npx jest src/__tests__/dialogue.test.ts
 */
import {
  pickDialogue,
  deriveDialogueEvent,
  getCharacterDialogue,
  DIALOGUE_BANK,
} from "@degenborn/shared";
import type { CharacterState, ArchetypeId } from "@degenborn/shared";

const ARCHETYPES: ArchetypeId[] = [
  "mad_gambler",
  "ice_whale",
  "rug_necromancer",
  "diamond_cultist",
  "sniper_jester",
  "ghost_bagholder",
];

const EVENT_TYPES = ["first_win", "big_loss", "rug_event", "recovery", "level_up", "idle"] as const;

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

describe("DIALOGUE_BANK", () => {
  it("all 6 archetypes have dialogue", () => {
    for (const archetype of ARCHETYPES) {
      expect(DIALOGUE_BANK[archetype]).toBeDefined();
    }
  });

  it("all 6 event types are covered for every archetype", () => {
    for (const archetype of ARCHETYPES) {
      for (const event of EVENT_TYPES) {
        const lines = DIALOGUE_BANK[archetype][event];
        expect(lines).toBeDefined();
        expect(lines.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("every dialogue line has non-empty en and ko", () => {
    for (const archetype of ARCHETYPES) {
      for (const event of EVENT_TYPES) {
        for (const line of DIALOGUE_BANK[archetype][event]) {
          expect(line.en.length).toBeGreaterThan(0);
          expect(line.ko.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("pickDialogue", () => {
  it("returns a DialogueLine for any valid archetype + event", () => {
    const result = pickDialogue("rug_necromancer", "big_loss", 0);
    expect(typeof result.en).toBe("string");
    expect(typeof result.ko).toBe("string");
    expect(result.en.length).toBeGreaterThan(0);
  });

  it("is deterministic — same seed always returns same line", () => {
    const a = pickDialogue("mad_gambler", "first_win", 42);
    const b = pickDialogue("mad_gambler", "first_win", 42);
    expect(a.en).toBe(b.en);
    expect(a.ko).toBe(b.ko);
  });

  it("different seeds return different lines (for bank size > 1)", () => {
    const results = new Set<string>();
    for (let seed = 0; seed < 10; seed++) {
      results.add(pickDialogue("ice_whale", "idle", seed).en);
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("deriveDialogueEvent", () => {
  it("revenge mood → recovery event", () => {
    expect(deriveDialogueEvent(makeState({ mood: "revenge" }))).toBe("recovery");
  });

  it("euphoria mood → first_win event", () => {
    expect(deriveDialogueEvent(makeState({ mood: "euphoria" }))).toBe("first_win");
  });

  it("despair mood → big_loss event", () => {
    expect(deriveDialogueEvent(makeState({ mood: "despair" }))).toBe("big_loss");
  });

  it("ghost mood → rug_event", () => {
    expect(deriveDialogueEvent(makeState({ mood: "ghost" }))).toBe("rug_event");
  });

  it("neutral + level >= 5 → level_up event", () => {
    expect(deriveDialogueEvent(makeState({ level: 5 }))).toBe("level_up");
  });

  it("default → idle", () => {
    expect(deriveDialogueEvent(makeState())).toBe("idle");
  });
});

describe("getCharacterDialogue", () => {
  it("returns a line for every archetype in every mood", () => {
    const moods = ["neutral", "euphoria", "despair", "revenge", "greed", "ghost"] as const;
    for (const archetype of ARCHETYPES) {
      for (const mood of moods) {
        const result = getCharacterDialogue(makeState({ archetype, mood }));
        expect(result.en.length).toBeGreaterThan(0);
        expect(result.ko.length).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic — same state always returns same line", () => {
    const state = makeState({ archetype: "sniper_jester", mood: "euphoria", crown_count: 2 });
    const a = getCharacterDialogue(state);
    const b = getCharacterDialogue(state);
    expect(a.en).toBe(b.en);
  });
});
