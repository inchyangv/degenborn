"use client";

import Link from "next/link";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { bscTestnet } from "wagmi/chains";

export default function GlobalNav() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== bscTestnet.id && chainId !== 56;

  return (
    <>
      {/* Wrong network toast — M-15 */}
      {isWrongChain && (
        <div className="w-full bg-yellow-900/60 border-b border-yellow-600/40 px-4 py-2 flex items-center justify-between text-xs">
          <span className="text-yellow-300 font-mono">
            ⚠ Wrong network. Switch to BNB Smart Chain (testnet).
          </span>
          <button
            onClick={() => switchChain({ chainId: bscTestnet.id })}
            className="px-3 py-1 bg-yellow-600 text-black font-bold rounded hover:bg-yellow-500 transition-colors"
          >
            Switch
          </button>
        </div>
      )}

      {/* Global nav bar — D-05 */}
      <nav className="w-full border-b border-[var(--degen-border)] px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-[var(--neon-green)] font-mono font-black text-sm tracking-wider hover:brightness-125 transition-all">
          DEGENBORN
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link href="/replay" className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono uppercase tracking-wider">
            Replay
          </Link>
          <Link href="/gallery" className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono uppercase tracking-wider">
            Gallery
          </Link>
        </div>

        {/* Wallet chip */}
        {isConnected && address ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--degen-muted)] rounded-full border border-[var(--degen-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)]" />
              <span className="text-xs font-mono text-gray-400">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <span className="text-[10px] text-gray-600">
                {chainId === 56 ? "BSC" : chainId === bscTestnet.id ? "testnet" : "?"}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-24" />
        )}
      </nav>
    </>
  );
}
