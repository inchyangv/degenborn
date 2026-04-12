"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { useState } from "react";

const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
const isBrowser = typeof window !== "undefined";

const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors: isBrowser
    ? [
        injected(),
        // Only add WalletConnect when a real project ID is configured — the placeholder "demo"
        // causes rate-limit failures on WalletConnect relay during live presentations.
        ...(wcProjectId && wcProjectId !== "your_walletconnect_project_id"
          ? [walletConnect({ projectId: wcProjectId })]
          : []),
      ]
    : [],
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC ?? "https://bsc-dataseed.binance.org/"),
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545/"),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
