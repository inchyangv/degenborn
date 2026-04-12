import type { Metadata } from "next";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";
import PublicMonsterView from "./PublicMonsterView";
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
    title: `${short} — DegenBorn Soul Core`,
    description: `View the on-chain monster persona for ${short} on DegenBorn × Four.meme`,
    openGraph: {
      title: `${short}'s Soul Core — DegenBorn`,
      description: `See what kind of monster ${short} is.`,
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${short} DegenBorn Soul Core` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${short}'s DegenBorn Soul Core`,
      images: [ogImage],
    },
  };
}

export default async function MonsterPermalinkPage({ params }: Props) {
  const { wallet } = await params;
  return <PublicMonsterView wallet={wallet} />;
}
