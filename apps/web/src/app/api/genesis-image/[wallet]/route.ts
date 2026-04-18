import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getAppUrl } from "@/lib/runtime-env";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";

/**
 * Compatibility route for genesis image URLs used in metadata/mint payloads.
 * Redirects to OG image endpoint, which is always available in production.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
) {
  const wallet = canonicalizeWallet(params.wallet);
  if (!isWalletInputSupported(wallet) || !isAddress(wallet)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const target = new URL(`/api/og/${wallet}`, getAppUrl());
  return NextResponse.redirect(target, { status: 307 });
}
