"use client";

import type { CharacterState, ArchetypeId, TraitId } from "@degenborn/shared";
import { TRAIT_DEFINITIONS, TRAIT_EMOJI } from "@degenborn/shared";
import { useEffect, useState } from "react";

interface Props {
  archetype: ArchetypeId;
  state: CharacterState;
  wallet: string;
  size?: number;
  showTraitBadges?: boolean;
  /** Optional override for the base image URL (e.g., DALL-E genesis image) — T3-05 */
  genesisImageUrl?: string | null;
}

// Module-level cache: key = baseUrl + sorted traits + size → composited data URL
const OVERLAY_CACHE = new Map<string, string>();

function buildCacheKey(baseUrl: string, traits: string[], size: number): string {
  return `${baseUrl}|${traits.slice().sort().join(",")}|${size}`;
}

export default function CharacterDisplay({
  archetype,
  state,
  wallet,
  size = 320,
  showTraitBadges = true,
  genesisImageUrl,
}: Props) {
  const defaultBase = `/archetypes/${archetype}_placeholder.svg`;
  const baseImageUrl = genesisImageUrl ?? defaultBase;

  const [displayUrl, setDisplayUrl] = useState<string>(baseImageUrl);
  const [composited, setComposited] = useState(false);

  // T3-05: Composite traits onto base image (client-side only)
  // Re-runs when base image or traits change
  useEffect(() => {
    // Update display immediately to new base when genesisImageUrl changes
    if (state.active_traits.length === 0) {
      setDisplayUrl(baseImageUrl);
      setComposited(false);
      return;
    }
    if (typeof window === "undefined") return;

    const cacheKey = buildCacheKey(baseImageUrl, state.active_traits, size);
    const cached = OVERLAY_CACHE.get(cacheKey);
    if (cached) {
      setDisplayUrl(cached);
      setComposited(true);
      return;
    }

    const composite = async () => {
      try {
        const { renderOverlay } = await import("@/lib/overlay-renderer");
        const result = await renderOverlay(baseImageUrl, state.active_traits as TraitId[], size);
        OVERLAY_CACHE.set(cacheKey, result.data_url);
        setDisplayUrl(result.data_url);
        setComposited(true);
      } catch {
        // Silently keep base image — overlay assets missing in dev is expected
        setDisplayUrl(baseImageUrl);
      }
    };
    composite();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseImageUrl, state.active_traits.join(","), size]);

  const moodColors: Record<string, string> = {
    neutral: "border-gray-600",
    euphoria: "border-yellow-400",
    despair: "border-blue-900",
    revenge: "border-red-500",
    greed: "border-green-400",
    ghost: "border-gray-400",
  };

  const borderColor = moodColors[state.mood] ?? "border-gray-600";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Base + composited image */}
      <div
        className={`w-full h-full rounded-2xl overflow-hidden border-2 ${borderColor} transition-colors duration-500`}
      >
        <img
          src={displayUrl}
          alt={[
            archetype.replace(/_/g, " "),
            `level ${state.level}`,
            state.active_traits.length > 0
              ? `traits: ${state.active_traits.map((t) => TRAIT_DEFINITIONS[t as TraitId]?.label ?? t).join(", ")}`
              : "no traits yet",
            `mood: ${state.mood}`,
          ].join(", ")}
          className="w-full h-full object-cover"
        />

        {/* Mood overlay */}
        {state.mood !== "neutral" && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: getMoodGradient(state.mood),
              opacity: 0.15,
            }}
          />
        )}
      </div>

      {/* Level badge */}
      <div className="absolute top-2 left-2 bg-black/70 rounded-full px-2 py-0.5 text-xs font-mono text-yellow-400">
        Lv.{state.level}
      </div>

      {/* Corruption bar */}
      {state.corruption > 0 && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${state.corruption}%` }}
            />
          </div>
        </div>
      )}

      {/* Active trait badges */}
      {showTraitBadges && state.active_traits.length > 0 && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {state.active_traits.slice(0, 4).map((traitId) => (
            <div
              key={traitId}
              title={TRAIT_DEFINITIONS[traitId as TraitId]?.label ?? traitId}
              className="w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-sm"
            >
              {TRAIT_EMOJI[traitId as TraitId] ?? "✦"}
            </div>
          ))}
          {state.active_traits.length > 4 && (
            <div className="w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-xs text-gray-400">
              +{state.active_traits.length - 4}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getMoodGradient(mood: string): string {
  switch (mood) {
    case "euphoria": return "radial-gradient(circle, #ffd700, transparent)";
    case "despair": return "radial-gradient(circle, #1e3a5f, transparent)";
    case "revenge": return "radial-gradient(circle, #7f1d1d, transparent)";
    case "greed": return "radial-gradient(circle, #14532d, transparent)";
    case "ghost": return "radial-gradient(circle, #374151, transparent)";
    default: return "none";
  }
}
