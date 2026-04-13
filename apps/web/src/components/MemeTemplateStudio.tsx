"use client";

/**
 * T-MEME-01 — Meme Template Studio component.
 *
 * 10 SVG templates, character overlay, text auto-pick + manual override.
 * 1-click copy to clipboard + download PNG.
 */

import { useState, useRef, useCallback } from "react";
import type { ArchetypeId, CharacterState } from "@degenborn/shared";
import {
  ARCHETYPE_COLORS,
  ARCHETYPE_PROFILES,
  pickDialogue,
  DIALOGUE_BANK,
} from "@degenborn/shared";
import type { DialogueEventType } from "@degenborn/shared";
import { MEME_TEMPLATES } from "@/lib/meme-templates";
import type { MemeTemplate } from "@/lib/meme-templates";

interface Props {
  wallet: string;
  archetype: ArchetypeId;
  state: CharacterState;
  /** base64 data URL of the character portrait (from CharacterDisplay) */
  characterDataUrl?: string;
}

const EVENT_TYPES: DialogueEventType[] = [
  "first_win",
  "big_loss",
  "rug_event",
  "recovery",
  "level_up",
  "idle",
];

function getAutoTexts(
  template: MemeTemplate,
  archetype: ArchetypeId,
  state: CharacterState,
): Record<string, string> {
  const seed = state.crown_count + state.scar_count + state.level;
  const out: Record<string, string> = {};
  for (const slot of template.textSlots) {
    if (slot.autoEvent) {
      out[slot.id] = pickDialogue(archetype, slot.autoEvent, seed).en;
    } else {
      out[slot.id] = "";
    }
  }
  return out;
}

export default function MemeTemplateStudio({ wallet, archetype, state, characterDataUrl }: Props) {
  const color = ARCHETYPE_COLORS[archetype] ?? "#9945ff";
  const profile = ARCHETYPE_PROFILES[archetype];

  const [selectedId, setSelectedId] = useState<string>(MEME_TEMPLATES[0]!.id);
  const [texts, setTexts] = useState<Record<string, Record<string, string>>>({});
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const template = MEME_TEMPLATES.find((t) => t.id === selectedId) ?? MEME_TEMPLATES[0]!;

  // Get or init texts for this template
  const getTexts = useCallback(
    (tmpl: MemeTemplate): Record<string, string> => {
      return texts[tmpl.id] ?? getAutoTexts(tmpl, archetype, state);
    },
    [texts, archetype, state],
  );

  const setSlotText = (slotId: string, value: string) => {
    setTexts((prev) => ({
      ...prev,
      [template.id]: {
        ...getTexts(template),
        [slotId]: value,
      },
    }));
  };

  const currentTexts = getTexts(template);
  const svgContent = template.buildSvg(currentTexts, characterDataUrl);

  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

  /** Randomize all text slots from dialogue bank */
  const randomizeAll = () => {
    const randomSeed = Math.floor(Math.random() * 9999);
    const newTexts: Record<string, string> = {};
    for (const slot of template.textSlots) {
      if (slot.autoEvent) {
        newTexts[slot.id] = pickDialogue(archetype, slot.autoEvent as DialogueEventType, randomSeed + slot.id.length).en;
      }
    }
    setTexts((prev) => ({ ...prev, [template.id]: { ...getTexts(template), ...newTexts } }));
  };

  const shareToX = async () => {
    const caption = Object.values(currentTexts).filter(Boolean).join(" / ");
    const text = encodeURIComponent(
      `${caption ? `"${caption}" ` : ""}— ${profile.name} meme built on DegenBorn\n\n#DegenBorn #fourmeme`
    );
    const url = encodeURIComponent(`${window.location.origin}/m/${wallet}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
  };

  const downloadPng = async () => {
    setDownloading(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = svgDataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 500;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 600, 500);

      const link = document.createElement("a");
      const short = wallet.slice(0, 8);
      link.download = `degenborn_${short}_meme_${template.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    setCopying(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = svgDataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 500;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 600, 500);

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        }
      }, "image/png");
    } catch {
      // fallback: copy SVG text
      await navigator.clipboard.writeText(svgContent);
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  };

  // Sort templates: preferred archetypes first
  const sortedTemplates = [...MEME_TEMPLATES].sort((a, b) => {
    const aPrefers = a.preferredArchetypes.includes(archetype) ? -1 : 0;
    const bPrefers = b.preferredArchetypes.includes(archetype) ? -1 : 0;
    return aPrefers - bPrefers;
  });

  return (
    <div className="space-y-6">
      {/* Template picker — scrollable chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs tracking-widest uppercase opacity-50">Template</div>
          {template.textSlots.some((s) => s.autoEvent) && (
            <button
              onClick={randomizeAll}
              className="text-xs px-3 py-1 rounded-lg font-mono hover:opacity-80 transition-all"
              style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
            >
              🎲 Randomize
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {sortedTemplates.map((tmpl) => {
            const isPreferred = tmpl.preferredArchetypes.includes(archetype);
            const isSelected = tmpl.id === selectedId;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedId(tmpl.id)}
                className="text-xs px-3 py-1.5 rounded border transition-all"
                style={{
                  borderColor: isSelected ? color : `${color}44`,
                  background: isSelected ? `${color}22` : "transparent",
                  color: isSelected ? color : isPreferred ? "#ccc" : "#888",
                }}
              >
                {isPreferred && "★ "}{tmpl.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG preview — large */}
      <div
        ref={svgContainerRef}
        className="rounded-xl border-2 overflow-hidden"
        style={{ borderColor: `${color}55`, background: template.bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgDataUrl}
          alt={`${template.name} meme`}
          className="w-full"
          style={{ objectFit: "contain", display: "block" }}
        />
      </div>

      {/* Text slots */}
      {template.textSlots.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs tracking-widest uppercase opacity-50">Edit text</div>
          {template.textSlots.map((slot) => (
            <div key={slot.id} className="space-y-1">
              <label className="text-xs opacity-50">{slot.label}</label>
              <div className="flex gap-2 items-start">
                <input
                  type="text"
                  value={currentTexts[slot.id] ?? ""}
                  onChange={(e) => setSlotText(slot.id, e.target.value)}
                  maxLength={slot.maxChars * 2}
                  placeholder={`e.g. ${slot.autoEvent ? pickDialogue(archetype, slot.autoEvent as DialogueEventType, 42).en.slice(0, 30) : ""}...`}
                  className="flex-1 bg-transparent border rounded px-3 py-1.5 text-sm focus:outline-none"
                  style={{ borderColor: `${color}44` }}
                />
                {slot.autoEvent && (
                  <button
                    onClick={() =>
                      setSlotText(
                        slot.id,
                        pickDialogue(
                          archetype,
                          slot.autoEvent as DialogueEventType,
                          Math.floor(Math.random() * 100),
                        ).en,
                      )
                    }
                    className="text-xs px-2 py-1.5 rounded border shrink-0 opacity-50 hover:opacity-80"
                    style={{ borderColor: `${color}44`, color }}
                    title="Pick random dialogue"
                  >
                    🎲
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={shareToX}
          className="flex-1 min-w-[120px] py-2.5 text-sm font-black rounded-lg transition-all hover:brightness-110"
          style={{ background: color, color: "#000" }}
        >
          𝕏 Post to X
        </button>
        <button
          onClick={copyToClipboard}
          disabled={copying}
          className="flex-1 min-w-[110px] py-2.5 text-sm rounded-lg border font-medium transition-all"
          style={{ borderColor: color, color, background: copying ? `${color}22` : "transparent" }}
        >
          {copying ? "Copied! ✓" : "Copy Image"}
        </button>
        <button
          onClick={downloadPng}
          disabled={downloading}
          className="flex-1 min-w-[110px] py-2.5 text-sm rounded-lg border font-medium transition-all"
          style={{ borderColor: `${color}66`, color: `${color}99` }}
        >
          {downloading ? "Saving..." : "Download PNG"}
        </button>
      </div>

      <div className="text-xs opacity-30 text-center">
        {profile.name} · {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </div>
    </div>
  );
}
