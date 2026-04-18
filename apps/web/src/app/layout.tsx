import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import GlobalNav from "@/components/GlobalNav";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DegenBorn",
  },
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
    <html lang="en" className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} ${inter.variable} ${cormorant.variable}`}>
      <body>
        <Providers>
          <GlobalNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
