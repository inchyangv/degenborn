import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DegenBorn — Your wallet, reborn as a monster",
  description:
    "DegenBorn turns your Four.meme trading history into an evolving on-chain monster persona. Connect, awaken, evolve.",
  openGraph: {
    title: "DegenBorn — Your wallet, reborn as a monster",
    description:
      "Your wallet tells a story. DegenBorn makes it a monster. Connect your wallet, discover your archetype, mint your Soul Core.",
    type: "website",
    siteName: "DegenBorn",
  },
  twitter: {
    card: "summary_large_image",
    title: "DegenBorn — Your wallet, reborn as a monster",
    description: "What kind of monster are you? Find out on DegenBorn × Four.meme",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
