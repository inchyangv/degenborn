import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DegenBorn — Your Wallet, Your Monster",
  description:
    "DegenBorn transforms your Four.meme trading history into an evolving on-chain monster persona.",
  openGraph: {
    title: "DegenBorn",
    description: "What kind of monster are you?",
    type: "website",
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
