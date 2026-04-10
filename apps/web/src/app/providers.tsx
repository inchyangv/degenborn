"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { useState } from "react";

const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "" }),
  ],
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
