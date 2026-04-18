import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";

export const runtime = "nodejs";

/**
 * GET /api/widget/[wallet]/image
 *
 * Uses the stable report-card OG renderer as the widget image source.
 * This avoids duplicated image composition code and keeps the embed path
 * alive in production even when richer card variants change.
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
