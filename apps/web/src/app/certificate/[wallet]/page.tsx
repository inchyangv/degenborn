/**
 * T-CERT-01 — /certificate/[wallet] page.
 *
 * Soul Birth Certificate — vintage paper format, deterministic.
 * Loads wallet data via /api/analyze (same as PublicMonsterView) then renders.
 */
import type { Metadata } from "next";
import CertificateView from "./CertificateView";
import { getAppUrl } from "@/lib/runtime-env";

interface Props {
  params: Promise<{ wallet: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wallet } = await params;
  const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  const appUrl = getAppUrl();
  const ogImage = `${appUrl}/api/og/${wallet.toLowerCase()}`;

  return {
    title: `${short} — Soul Birth Certificate · DegenBorn`,
    description: `The official Soul Birth Certificate for ${short}. Issued by the DegenBorn Council × Four.meme.`,
    openGraph: {
      title: `${short}'s Soul Birth Certificate`,
      description: "Certified degen identity, issued on-chain.",
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${short}'s Soul Birth Certificate — DegenBorn`,
      images: [ogImage],
    },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { wallet } = await params;
  return <CertificateView wallet={wallet} />;
}
