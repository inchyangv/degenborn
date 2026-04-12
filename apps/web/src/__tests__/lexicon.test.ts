/**
 * Degen Lexicon unit tests
 * Verifies that banned patterns are detected and clean text passes.
 * Run with: npx jest src/__tests__/lexicon.test.ts
 */
import { checkLexicon, sanitizeLexicon } from "@degenborn/shared";

describe("checkLexicon", () => {
  const CLEAN_INPUTS = [
    "Rugged three times. Still here. wagmi.",
    "I am ngmi and I cope. Based.",
    "Diamond hands never fold. gm ser.",
    "Rekt again. The flatline hits different. gn.",
    "We ape in. We survive. That's the arc.",
    "Chaos +80. Survival +91. The necromancer returns.",
    "Conviction is the last thing left. hold.",
    "The rug couldn't kill what the rug already broke.",
    "Paper hands sold the bottom. I held.",
    "Every scar is a scar I kept. fren.",
  ];

  const DIRTY_INPUTS: { text: string }[] = [
    { text: "Sell signal detected — act now." },
    { text: "Buy signal spotted on the chart." },
    { text: "Guaranteed returns if you hold this." },
    { text: "This will moon by end of week." },
    { text: "Invest in this project today." },
    { text: "My financial advice is to hold forever." },
    { text: "Price target is 10x by Q4." },
    { text: "Not financial advice but this will pump." },
    { text: "10x guaranteed if you ape in now." },
    { text: "Guaranteed profit on every trade, ser." },
  ];

  it("passes 10 clean degen-culture inputs", () => {
    for (const text of CLEAN_INPUTS) {
      const result = checkLexicon(text);
      expect(result.ok).toBe(true);
      expect(result.violations).toHaveLength(0);
    }
  });

  it("flags each of 10 dirty inputs", () => {
    for (const { text } of DIRTY_INPUTS) {
      const result = checkLexicon(text);
      expect(result.ok).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    }
  });

  it("returns violations array listing the matched phrases", () => {
    const result = checkLexicon("guaranteed returns on every trade");
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => /guaranteed/i.test(v))).toBe(true);
  });

  it("empty string is always clean", () => {
    const result = checkLexicon("");
    expect(result.ok).toBe(true);
  });
});

describe("sanitizeLexicon", () => {
  it("replaces banned phrases with ***", () => {
    const text = "This will moon — guaranteed returns incoming.";
    const sanitized = sanitizeLexicon(text);
    expect(sanitized).not.toContain("will moon");
    expect(sanitized).not.toContain("guaranteed returns");
    expect(sanitized).toContain("***");
  });

  it("leaves clean text unchanged", () => {
    const text = "Rugged again. wagmi. gm ser.";
    expect(sanitizeLexicon(text)).toBe(text);
  });
});
