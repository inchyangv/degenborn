import type { Metadata } from "next";
import { ARCHETYPE_COLORS, ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";
import { getProfileStore } from "@/lib/profile-store";
import ChallengeClient from "./ChallengeClient";

interface Props {
  params: { wallet: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wallet = params.wallet.toLowerCase();
  const profile = getProfileStore(wallet);
  const archetypeRaw = profile?.archetype ?? "unknown";
  const archetypeProfile = archetypeRaw !== "unknown" ? ARCHETYPE_PROFILES[archetypeRaw as ArchetypeId] : null;
  const color = (ARCHETYPE_COLORS as Record<string, string>)[archetypeRaw] ?? "#9945ff";
  const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  const title = archetypeProfile
    ? `⚔ ${archetypeProfile.name} is challenging you — DegenBorn`
    : `⚔ A degen is challenging you — DegenBorn`;

  const description = archetypeProfile
    ? `${short} (${archetypeProfile.name}) wants to know: what kind of degen are YOU?`
    : `${short} is calling you out. Connect your wallet and reveal your true degen DNA.`;

  const ogUrl = `/api/og/challenge/${wallet}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function ChallengePage({ params }: Props) {
  const wallet = params.wallet.toLowerCase();
  const profile = getProfileStore(wallet);
  const archetype = (profile?.archetype ?? "unknown") as ArchetypeId;

  return <ChallengeClient wallet={wallet} archetype={archetype} dna={profile?.dna ?? null} />;
}
