import { scoreDNA } from "../engine";
import type { ActivityEvent } from "@degenborn/shared";

const WALLET = "0x1234567890abcdef1234567890abcdef12345678";

function makeEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id: Math.random().toString(36).slice(2),
    wallet_address: WALLET,
    event_type: "buy",
    token_address: "0xtoken1",
    value_usd: 100,
    pnl_delta: 0,
    timestamp: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

describe("scoreDNA", () => {
  it("returns zero DNA for empty event list", () => {
    const { dna } = scoreDNA(WALLET, []);
    expect(dna.aggression).toBe(0);
    expect(dna.conviction).toBe(0);
    expect(dna.chaos).toBe(0);
    expect(dna.luck).toBe(0);
    expect(dna.survival).toBe(0);
    expect(dna.event_count).toBe(0);
  });

  it("is deterministic — same events yield same scores", () => {
    const events: ActivityEvent[] = [
      makeEvent({ event_type: "buy", pnl_delta: 0, timestamp: 1000000, hold_duration_seconds: 3600 }),
      makeEvent({ event_type: "sell", pnl_delta: 200, timestamp: 1003600, hold_duration_seconds: 3600 }),
      makeEvent({ event_type: "buy", pnl_delta: 0, timestamp: 1010000, token_address: "0xtoken2" }),
      makeEvent({ event_type: "sell", pnl_delta: -100, timestamp: 1013600 }),
    ];

    const r1 = scoreDNA(WALLET, events);
    const r2 = scoreDNA(WALLET, events);

    expect(r1.dna.aggression).toBe(r2.dna.aggression);
    expect(r1.dna.conviction).toBe(r2.dna.conviction);
    expect(r1.dna.chaos).toBe(r2.dna.chaos);
    expect(r1.dna.luck).toBe(r2.dna.luck);
    expect(r1.dna.survival).toBe(r2.dna.survival);
  });

  it("high-frequency trader scores high aggression", () => {
    const base = 1_700_000_000;
    const events: ActivityEvent[] = [];
    for (let i = 0; i < 100; i++) {
      events.push(
        makeEvent({
          event_type: i % 2 === 0 ? "buy" : "sell",
          timestamp: base + i * 600,            // trade every 10 min
          hold_duration_seconds: 600,
          pnl_delta: i % 2 === 0 ? 0 : 50,
        }),
      );
    }
    const { dna } = scoreDNA(WALLET, events);
    expect(dna.aggression).toBeGreaterThan(50);
  });

  it("long-term holder scores high conviction", () => {
    const base = 1_700_000_000;
    const events: ActivityEvent[] = [
      makeEvent({ event_type: "buy", timestamp: base, token_address: "0xbig", hold_duration_seconds: 0 }),
      makeEvent({
        event_type: "sell",
        timestamp: base + 86400 * 30,
        token_address: "0xbig",
        hold_duration_seconds: 86400 * 30,
        pnl_delta: 5000,
      }),
    ];
    const { dna } = scoreDNA(WALLET, events);
    expect(dna.conviction).toBeGreaterThan(30);
  });

  it("multiple rug events score high chaos", () => {
    const events: ActivityEvent[] = [1, 2, 3, 4].map((i) =>
      makeEvent({ event_type: "rug", timestamp: 1_700_000_000 + i * 86400, pnl_delta: -1000 }),
    );
    const { dna } = scoreDNA(WALLET, events);
    expect(dna.chaos).toBeGreaterThan(40);
  });

  it("high profit rate scores high luck", () => {
    const base = 1_700_000_000;
    const events: ActivityEvent[] = [];
    for (let i = 0; i < 10; i++) {
      events.push(
        makeEvent({ event_type: "buy", timestamp: base + i * 3600 }),
        makeEvent({ event_type: "sell", timestamp: base + i * 3600 + 1800, pnl_delta: 300 }),
      );
    }
    const { dna } = scoreDNA(WALLET, events);
    expect(dna.luck).toBeGreaterThan(40);
  });

  it("recovery after losses scores high survival", () => {
    const base = 1_700_000_000;
    const events: ActivityEvent[] = [
      makeEvent({ event_type: "sell", pnl_delta: -1000, timestamp: base }),
      makeEvent({ event_type: "sell", pnl_delta: 500, timestamp: base + 86400 * 3 }),
      makeEvent({ event_type: "recovery", pnl_delta: 800, timestamp: base + 86400 * 5 }),
    ];
    const { dna } = scoreDNA(WALLET, events);
    expect(dna.survival).toBeGreaterThan(20);
  });

  it("all scores are between 0 and 100", () => {
    const events = Array.from({ length: 50 }, (_, i) =>
      makeEvent({
        event_type: i % 5 === 0 ? "rug" : i % 2 === 0 ? "buy" : "sell",
        pnl_delta: (i % 3 === 0 ? -1 : 1) * Math.random() * 2000,
        timestamp: 1_700_000_000 + i * 3600,
        hold_duration_seconds: Math.random() * 86400,
        token_address: `0xtoken${i % 5}`,
      }),
    );
    const { dna } = scoreDNA(WALLET, events);
    for (const field of ["aggression", "conviction", "chaos", "luck", "survival"] as const) {
      expect(dna[field]).toBeGreaterThanOrEqual(0);
      expect(dna[field]).toBeLessThanOrEqual(100);
    }
  });
});
