import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";

export const runtime = "nodejs";

/**
 * GET /api/og/[wallet]
 *
 * Stable redirect to the report-card OG renderer.
 * The report card is the production-safe fallback for all share surfaces.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { wallet: string } },
): Promise<NextResponse> {
  const walletLower = canonicalizeWallet(params.wallet);

  if (!isWalletInputSupported(walletLower)) {
    return new NextResponse("Invalid wallet address", { status: 400 });
  }

  return NextResponse.redirect(new URL(`/api/og/report/${walletLower}`, req.url), { status: 307 });
}
