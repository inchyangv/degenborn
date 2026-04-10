/**
 * State machine unit tests — run with: npx jest src/__tests__/state-machine.test.ts
 */
import {
  createInitialState,
  applyStateEvent,
  computeActiveTraits,
} from "../lib/state-machine";
import type { StateEvent } from "@degenborn/shared";

const WALLET = "0xtest";
const NOW = 1712000000;

function makeEvent(type: StateEvent["type"]): StateEvent {
  return { type, wallet_address: WALLET, timestamp: NOW };
}

describe("State Machine", () => {
  it("createInitialState returns neutral level-1 state", () => {
    const s = createInitialState(WALLET, "rug_necromancer");
    expect(s.level).toBe(1);
    expect(s.mood).toBe("neutral");
    expect(s.corruption).toBe(0);
    expect(s.crown_count).toBe(0);
    expect(s.scar_count).toBe(0);
    expect(s.active_traits).toEqual([]);
  });

  it("win_streak_3 → crown_count+1, mood=euphoria", () => {
    const state = createInitialState(WALLET, "mad_gambler");
    const { state_after, traits_added } = applyStateEvent(state, makeEvent("win_streak_3"));
    expect(state_after.crown_count).toBe(1);
    expect(state_after.mood).toBe("euphoria");
    expect(traits_added).toContain("crown");
  });

  it("big_loss → scar_count+1, mood=despair", () => {
    const state = createInitialState(WALLET, "ice_whale");
    const { state_after, traits_added } = applyStateEvent(state, makeEvent("big_loss"));
    expect(state_after.scar_count).toBe(1);
    expect(state_after.mood).toBe("despair");
    expect(traits_added).toContain("bandage");
    expect(traits_added).toContain("tears");
  });

  it("rug_exposure → corruption+20", () => {
    const state = createInitialState(WALLET, "diamond_cultist");
    const { state_after } = applyStateEvent(state, makeEvent("rug_exposure"));
    expect(state_after.corruption).toBe(20);
    expect(state_after.scar_count).toBe(1);
  });

  it("zombie_eyes appears at corruption >= 50", () => {
    let state = createInitialState(WALLET, "rug_necromancer");
    // Apply 3 rug events to reach corruption 60
    for (let i = 0; i < 3; i++) {
      const { state_after } = applyStateEvent(state, makeEvent("rug_exposure"));
      state = state_after;
    }
    expect(state.corruption).toBe(60);
    expect(state.active_traits).toContain("zombie_eyes");
  });

  it("loss_recovery → survival_streak+1, mood=revenge", () => {
    const state = createInitialState(WALLET, "sniper_jester");
    const { state_after, traits_added } = applyStateEvent(state, makeEvent("loss_recovery"));
    expect(state_after.survival_streak).toBe(1);
    expect(state_after.mood).toBe("revenge");
    expect(traits_added).toContain("revenge_aura");
  });

  it("state transitions are deterministic", () => {
    const base = createInitialState(WALLET, "ghost_bagholder");
    const event = makeEvent("win_streak_3");
    const r1 = applyStateEvent(base, event);
    const r2 = applyStateEvent(base, event);
    expect(JSON.stringify(r1.state_after)).toEqual(JSON.stringify(r2.state_after));
  });

  it("invalid event type does not throw", () => {
    const state = createInitialState(WALLET, "rug_necromancer");
    // Feed an unknown event type — should not throw
    expect(() => {
      applyStateEvent(state, { type: "nonexistent_event" as any, wallet_address: WALLET, timestamp: NOW });
    }).not.toThrow();
  });

  it("computeActiveTraits: crown at crown_count=1, gold_chain at crown_count=3", () => {
    const state = createInitialState(WALLET, "mad_gambler");
    state.crown_count = 1;
    expect(computeActiveTraits(state)).toContain("crown");
    state.crown_count = 3;
    expect(computeActiveTraits(state)).toContain("gold_chain");
  });

  it("skull_ring at survival_streak=5", () => {
    const state = createInitialState(WALLET, "rug_necromancer");
    state.survival_streak = 5;
    expect(computeActiveTraits(state)).toContain("skull_ring");
  });

  it("all 5+ minimum event types change state", () => {
    const events: StateEvent["type"][] = [
      "win_streak_3", "big_loss", "rug_exposure", "loss_recovery", "sustained_profit",
    ];
    for (const eventType of events) {
      const state = createInitialState(WALLET, "mad_gambler");
      const before = JSON.stringify(state);
      const { state_after } = applyStateEvent(state, makeEvent(eventType));
      expect(JSON.stringify(state_after)).not.toEqual(before);
    }
  });
});
