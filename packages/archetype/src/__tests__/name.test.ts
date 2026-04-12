import { generateCharacterName } from "../name";
import type { ArchetypeId } from "@degenborn/shared";

const ARCHETYPES: ArchetypeId[] = [
  "mad_gambler",
  "ice_whale",
  "rug_necromancer",
  "diamond_cultist",
  "sniper_jester",
  "ghost_bagholder",
];

const WALLET_A = "0xDeadBeef1234567890abcdef1234567890AbCdEf";
const WALLET_B = "0x1111111111111111111111111111111111111111";
const WALLET_C = "0xaabbccddee0011223344556677889900aabbccdd";

describe("generateCharacterName", () => {
  // --- Determinism ---
  it("same wallet + archetype always returns the same name", () => {
    for (const archetype of ARCHETYPES) {
      const r1 = generateCharacterName(WALLET_A, archetype);
      const r2 = generateCharacterName(WALLET_A, archetype);
      expect(r1.name).toBe(r2.name);
      expect(r1.title).toBe(r2.title);
      expect(r1.full).toBe(r2.full);
    }
  });

  it("wallet address comparison is case-insensitive", () => {
    const upper = generateCharacterName(WALLET_A.toUpperCase(), "rug_necromancer");
    const lower = generateCharacterName(WALLET_A.toLowerCase(), "rug_necromancer");
    expect(upper.name).toBe(lower.name);
  });

  // --- Name pool coverage: 6 archetypes × minimum 40 names ---
  it("each archetype has a pool of at least 40 unique names", () => {
    // Generate names for 100 synthetic wallets per archetype
    for (const archetype of ARCHETYPES) {
      const generated = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const wallet = `0x${i.toString(16).padStart(40, "0")}`;
        const { name } = generateCharacterName(wallet, archetype);
        generated.add(name);
      }
      expect(generated.size).toBeGreaterThanOrEqual(40);
    }
  });

  // --- Title reflects state ---
  it("default title when no state is passed", () => {
    const { title } = generateCharacterName(WALLET_A, "mad_gambler");
    expect(title).toBe("All-In");
  });

  it("title is Crowned when crown_count >= 1", () => {
    const { title } = generateCharacterName(WALLET_A, "mad_gambler", { crown_count: 1 });
    expect(title).toBe("Crowned");
  });

  it("title is Twice-Rugged when scar_count >= 3", () => {
    const { title } = generateCharacterName(WALLET_A, "rug_necromancer", { scar_count: 3 });
    expect(title).toBe("Twice-Rugged");
  });

  it("title is Unflinching when survival_streak >= 5", () => {
    const { title } = generateCharacterName(WALLET_A, "ice_whale", { survival_streak: 5 });
    expect(title).toBe("Unflinching");
  });

  it("title is Thrice-Crowned when crown_count >= 3", () => {
    const { title } = generateCharacterName(WALLET_B, "sniper_jester", { crown_count: 3 });
    expect(title).toBe("Thrice-Crowned");
  });

  it("title is Corrupted when corruption >= 60", () => {
    const { title } = generateCharacterName(WALLET_C, "rug_necromancer", { corruption: 65 });
    expect(title).toBe("Corrupted");
  });

  // --- Full form ---
  it("full is exactly `{name} the {title}`", () => {
    const result = generateCharacterName(WALLET_A, "ghost_bagholder");
    expect(result.full).toBe(`${result.name} the ${result.title}`);
  });

  // --- Name is stable, title changes ---
  it("name does not change when state changes — only title does", () => {
    const base = generateCharacterName(WALLET_A, "diamond_cultist");
    const withScars = generateCharacterName(WALLET_A, "diamond_cultist", { scar_count: 3 });
    expect(base.name).toBe(withScars.name);
    expect(base.title).not.toBe(withScars.title);
  });

  // --- Different wallets get different names (for same archetype) ---
  it("different wallets produce different names for the same archetype", () => {
    const r1 = generateCharacterName(WALLET_A, "rug_necromancer");
    const r2 = generateCharacterName(WALLET_B, "rug_necromancer");
    const r3 = generateCharacterName(WALLET_C, "rug_necromancer");
    // At least 2 of 3 should differ (pool is 50, collision rate is low)
    const names = [r1.name, r2.name, r3.name];
    const unique = new Set(names);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });
});
