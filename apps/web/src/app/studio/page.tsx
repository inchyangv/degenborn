/**
 * T-MEME-01 — /studio page.
 *
 * Meme Template Studio. URL: /studio?wallet=0x...
 * Loads wallet data and renders MemeTemplateStudio.
 */
import type { Metadata } from "next";
import StudioView from "./StudioView";

interface Props {
  searchParams: Promise<{ wallet?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const wallet = params.wallet ?? "";
  const short = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "DegenBorn";
  return {
    title: `${short} Meme Studio — DegenBorn`,
    description: "Build memes with your DegenBorn soul. 10 templates, your character, your words.",
  };
}

export default async function StudioPage({ searchParams }: Props) {
  const params = await searchParams;
  const wallet = params.wallet ?? "0x0000000000000000000000000000000000000000";
  return <StudioView wallet={wallet} />;
}
