"use client";

/**
 * T-COL-01 — Pokemon-style Trading Card
 *
 * Formats: 1:1 square (400×400) and 9:16 portrait (360×640).
 * Features:
 *   - Archetype-colored background gradient
 *   - Tier gem + label (top-left)
 *   - Character portrait (CharacterDisplay)
 *   - Name / title / tagline
 *   - DNA stat bars
 *   - Badge row
 *   - Dialogue quote
 *   - QR code to /m/[wallet]
 *   - Download PNG (html2canvas) + clipboard copy
 */

import type { PersonaDNA, ArchetypeResult, CharacterState } from "@degenborn/shared";
import {
  ARCHETYPE_COLORS,
  evaluateBadges,
  pickShowcaseBadges,
  computeTier,
  TIER_DEFINITIONS,
  pickCaption,
} from "@degenborn/shared";
import { useRef, useState, useEffect } from "react";
import CharacterDisplay from "./CharacterDisplay";

interface Props {
  dna: PersonaDNA;
  archetype: ArchetypeResult;
  state: CharacterState;
  wallet: string;
}

type CardFormat = "1:1" | "9:16";

export default function TradingCard({ dna, archetype, state, wallet }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<CardFormat>("1:1");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://degenborn.xyz";
  const shareUrl = `${appUrl}/m/${wallet.toLowerCase()}`;

  const archetypeColor = ARCHETYPE_COLORS[archetype.archetype] ?? "#9945ff";
  const tier = computeTier(dna);
  const tierDef = TIER_DEFINITIONS[tier];
  const earnedBadges = evaluateBadges(state);
  const showcaseBadges = pickShowcaseBadges(earnedBadges, 3);
  const quote = pickCaption(archetype.archetype, state);
  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  // Generate QR code on client
  useEffect(() => {
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(shareUrl, {
        width: 80,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      }).then(setQrDataUrl).catch(() => {});
    });
  }, [shareUrl]);

  const dnaAxes: [string, number, string][] = [
    ["AGG", dna.aggression, "#ff3d3d"],
    ["CON", dna.conviction, "#00d4ff"],
    ["CHA", dna.chaos, "#9945ff"],
    ["LCK", dna.luck, "#ffd700"],
    ["SRV", dna.survival, "#00ff88"],
  ];

  const is916 = format === "9:16";
  const cardWidth = is916 ? 360 : 400;
  const cardHeight = is916 ? 640 : 400;
  const charSize = is916 ? 160 : 130;

  const downloadCard = async () => {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement("a");
        link.download = `degenborn_${archetype.archetype}_${format.replace(":", "x")}_card.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (e) {
      console.error("Card download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Format toggle */}
      <div className="flex items-center gap-2 justify-center">
        <span className="text-xs text-gray-500 font-mono uppercase">Format:</span>
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {(["1:1", "9:16"] as CardFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-1.5 text-xs font-bold transition-all ${
                format === f
                  ? "text-black"
                  : "text-gray-400 hover:text-white"
              }`}
              style={format === f ? { backgroundColor: archetypeColor } : {}}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl"
          style={{
            width: cardWidth,
            height: cardHeight,
            background: `linear-gradient(160deg, ${archetypeColor}22 0%, #0a0a0f 50%, ${archetypeColor}11 100%)`,
            boxShadow: tierDef.borderStyle,
            border: `1.5px solid ${archetypeColor}66`,
            fontFamily: "monospace",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${archetypeColor}1a, transparent 60%)`,
            }}
          />

          {/* Tier badge — top left */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black z-20"
            style={{ background: `${tierDef.color}22`, border: `1px solid ${tierDef.color}88`, color: tierDef.color }}
          >
            {tierDef.gemIcon} {tierDef.label.toUpperCase()}
          </div>

          {/* DegenBorn watermark — top right */}
          <div className="absolute top-3 right-3 text-[9px] text-gray-700 font-mono z-20">
            DEGENBORN
          </div>

          {/* Portrait */}
          <div
            className="flex justify-center z-10 relative"
            style={{ paddingTop: is916 ? 48 : 40 }}
          >
            <CharacterDisplay
              archetype={archetype.archetype as any}
              state={state}
              wallet={wallet}
              size={charSize}
              showTraitBadges={false}
            />
          </div>

          {/* Name block */}
          <div className="text-center px-4 mt-2 z-10 relative">
            <div
              className="text-base font-black text-white leading-tight"
            >
              {archetype.profile.name}
            </div>
            <div
              className="text-[10px] font-mono uppercase tracking-widest mt-0.5"
              style={{ color: archetypeColor }}
            >
              {archetype.profile.tagline}
            </div>
            <div className="text-[10px] text-gray-600 font-mono mt-0.5">
              {shortWallet}
            </div>
          </div>

          {/* DNA bars */}
          <div className="px-4 mt-3 space-y-1 z-10 relative">
            {dnaAxes.map(([label, score, color]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[9px] text-gray-600 w-6 font-mono">{label}</span>
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${score}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-[9px] text-gray-500 w-5 text-right font-mono">{score}</span>
              </div>
            ))}
          </div>

          {/* Badge row */}
          {showcaseBadges.length > 0 && (
            <div className="flex justify-center gap-2 mt-2 z-10 relative">
              {showcaseBadges.map((badge) => (
                <span key={badge.id} title={badge.name} className="text-base">
                  {badge.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Quote */}
          <div
            className="mx-4 mt-2 p-2 rounded-lg text-[10px] text-gray-400 italic text-center z-10 relative"
            style={{ background: "#ffffff08", border: "1px solid #ffffff0f" }}
          >
            "{quote.length > 80 ? quote.slice(0, 78) + "…" : quote}"
          </div>

          {/* Bottom bar: level/mood + QR */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 pb-2 z-10">
            <div>
              <div className="text-[9px] text-gray-600 font-mono">
                Lv.{state.level} · {state.mood}
              </div>
              <div className="text-[9px] text-gray-700 font-mono">#DegenBorn · four.meme</div>
            </div>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR code"
                width={40}
                height={40}
                className="rounded"
                style={{ imageRendering: "pixelated" }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 max-w-sm mx-auto">
        <button
          onClick={copyLink}
          className="flex-1 py-2.5 border text-xs font-mono rounded-lg hover:opacity-80 transition-all"
          style={{ borderColor: archetypeColor, color: archetypeColor }}
        >
          {copied ? "Copied ✓" : "Copy Link"}
        </button>
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="flex-1 py-2.5 text-black text-xs font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          style={{ backgroundColor: archetypeColor }}
        >
          {downloading ? "Generating…" : "Download Card"}
        </button>
      </div>

      <div className="text-[10px] text-gray-700 text-center">
        QR links to your public Soul Core page.
      </div>
    </div>
  );
}
