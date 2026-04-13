/**
 * T5-02: Image permanent storage adapter.
 *
 * Strategy: conditional two-tier storage.
 *  - When BLOB_READ_WRITE_TOKEN is set → copy image to Vercel Blob for permanent URL
 *  - Otherwise → return the source URL as-is (OpenAI URLs expire in ~1h but work for demo)
 *
 * Usage:
 *   import { persistImageUrl } from "@/lib/image-store";
 *   const stableUrl = await persistImageUrl(openaiUrl, `genesis/${wallet}.png`);
 *
 * Environment variables:
 *   BLOB_READ_WRITE_TOKEN   — Vercel Blob token (from dashboard → Storage → Blob)
 */

const isBlobEnabled = (): boolean => !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Persist an image URL to permanent storage.
 *
 * If Vercel Blob is configured:
 *   - Fetch the image bytes from `sourceUrl`
 *   - Upload to Vercel Blob under `pathname`
 *   - Return the stable Blob URL
 *
 * Otherwise:
 *   - Return `sourceUrl` unchanged (works for demo, expires for OpenAI URLs)
 */
export async function persistImageUrl(
  sourceUrl: string,
  pathname: string,
): Promise<string> {
  if (!isBlobEnabled()) return sourceUrl;

  try {
    const { put } = await import("@vercel/blob");

    // Fetch the image bytes from the source URL
    const resp = await fetch(sourceUrl);
    if (!resp.ok) {
      console.warn("[image-store] Failed to fetch source image:", resp.status);
      return sourceUrl;
    }
    const buffer = await resp.arrayBuffer();
    const contentType = resp.headers.get("content-type") ?? "image/png";

    const result = await put(pathname, buffer, {
      access: "public",
      contentType,
    });

    return result.url;
  } catch (err) {
    console.error("[image-store] Blob upload failed:", (err as Error).message);
    return sourceUrl; // graceful fallback — never break flow
  }
}

/**
 * Persist an OG / share card image (pre-rendered PNG buffer) to permanent storage.
 * Used by /api/share and /api/og routes.
 * Accepts a Node.js Buffer or a base64-encoded data URL string.
 */
export async function persistRenderedImage(
  data: Buffer | string,
  pathname: string,
  contentType = "image/png",
): Promise<string | null> {
  if (!isBlobEnabled()) return null;

  try {
    const { put } = await import("@vercel/blob");
    let blobData: Blob;

    if (typeof data === "string" && data.startsWith("data:")) {
      // data URL → Blob
      const base64 = data.split(",")[1] ?? "";
      const bin = Buffer.from(base64, "base64");
      blobData = new Blob([bin] as unknown as BlobPart[], { type: contentType });
    } else {
      const buf = data as Buffer;
      blobData = new Blob([buf] as unknown as BlobPart[], { type: contentType });
    }

    const result = await put(pathname, blobData, {
      access: "public",
      contentType,
    });
    return result.url;
  } catch (err) {
    console.error("[image-store] Blob upload failed:", (err as Error).message);
    return null;
  }
}

/** Returns true when Vercel Blob is configured. */
export function isImageStoreEnabled(): boolean {
  return isBlobEnabled();
}
