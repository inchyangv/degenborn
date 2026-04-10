/**
 * Trait overlay renderer.
 *
 * Composites active trait layers on top of a base character image
 * without re-running AI generation. Uses HTML Canvas.
 *
 * Architecture:
 *  base_image + [ordered trait layers] → composited PNG
 *
 * Coordinate system:
 *  All trait assets are 512×512 PNG sprites with transparent backgrounds.
 *  They overlay at full size on top of the base image.
 *  Anchor coordinates ensure traits land on the correct body region.
 */

import type { TraitId, CharacterState } from "@degenborn/shared";
import { TRAIT_DEFINITIONS } from "@degenborn/shared";

/** Render order: aura → body → head → accessory → eyes (bottom to top) */
const RENDER_ORDER: Array<typeof TRAIT_DEFINITIONS[TraitId]["category"]> = [
  "aura",
  "body",
  "head",
  "accessory",
  "eyes",
];

export interface OverlayResult {
  data_url: string;   // PNG data URL for display
  traits_rendered: TraitId[];
}

/**
 * Composite base image + trait overlays into a single PNG.
 * Runs entirely client-side in a Canvas element.
 *
 * @param baseImageUrl  URL or data URL of the genesis character image
 * @param activeTraits  List of TraitId to overlay (order is handled internally)
 * @param size          Output canvas size in pixels (default 512)
 */
export async function renderOverlay(
  baseImageUrl: string,
  activeTraits: TraitId[],
  size = 512,
): Promise<OverlayResult> {
  // Create off-screen canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Draw base image
  await drawImage(ctx, baseImageUrl, 0, 0, size, size);

  // Sort traits by render order
  const sorted = sortTraitsByLayer(activeTraits);

  for (const traitId of sorted) {
    const def = TRAIT_DEFINITIONS[traitId];
    if (!def) continue;

    const assetUrl = `/${def.asset_path}`;
    try {
      await drawImage(ctx, assetUrl, 0, 0, size, size);
    } catch {
      // Trait asset missing — skip silently (placeholder will serve)
      console.warn(`[overlay] Missing trait asset: ${assetUrl}`);
    }
  }

  return {
    data_url: canvas.toDataURL("image/png"),
    traits_rendered: sorted,
  };
}

/**
 * Export the current composited canvas as a PNG blob for download.
 */
export function exportCanvasAsPng(canvas: HTMLCanvasElement, filename = "degenborn.png"): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Build an overlay preview URL for a given state.
 * Returns the base image URL when no traits are active (no canvas needed).
 */
export function getPreviewUrl(baseImageUrl: string, state: CharacterState): string {
  if (state.active_traits.length === 0) return baseImageUrl;
  // Full compositing is async — return base for SSR/initial render
  return baseImageUrl;
}

/** Sort trait list by visual render order */
function sortTraitsByLayer(traits: TraitId[]): TraitId[] {
  return [...traits].sort((a, b) => {
    const layerA = RENDER_ORDER.indexOf(TRAIT_DEFINITIONS[a]?.category ?? "body");
    const layerB = RENDER_ORDER.indexOf(TRAIT_DEFINITIONS[b]?.category ?? "body");
    return layerA - layerB;
  });
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h);
      resolve();
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
