/**
 * relativeTime utility tests
 * Run with: npx jest src/__tests__/time.test.ts
 */
import { relativeTime } from "@degenborn/shared";

describe("relativeTime", () => {
  const NOW = Math.floor(Date.now() / 1000);

  it("returns 'just now' for < 60s ago", () => {
    expect(relativeTime(NOW - 30)).toBe("just now");
  });

  it("returns minutes ago for < 1h", () => {
    expect(relativeTime(NOW - 300)).toBe("5m ago");
  });

  it("returns hours ago for < 24h", () => {
    expect(relativeTime(NOW - 7200)).toBe("2h ago");
  });

  it("returns days ago for < 30d", () => {
    expect(relativeTime(NOW - 86400 * 3)).toBe("3d ago");
  });

  it("returns locale date string for >= 30d", () => {
    const ts = NOW - 86400 * 60;
    const result = relativeTime(ts);
    // Should be a valid locale date, not a relative string
    expect(result).not.toMatch(/ago/);
    expect(result.length).toBeGreaterThan(0);
  });
});
