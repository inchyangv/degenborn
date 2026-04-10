"use client";

interface Props {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = "" }: Props) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-[var(--degen-muted)] rounded"
          style={{ width: `${90 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-[var(--degen-muted)] rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 bg-[var(--degen-muted)] rounded w-20" />
            <div className="flex-1 h-2 bg-[var(--degen-muted)] rounded" />
            <div className="h-3 bg-[var(--degen-muted)] rounded w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WalletNotConnected() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
      <div className="text-4xl">🔌</div>
      <div className="text-white font-bold">Wallet not connected</div>
      <div className="text-gray-400 text-sm max-w-xs">
        Connect your wallet on the home page to see your monster persona.
      </div>
      <a
        href="/"
        className="px-6 py-2 border border-[var(--neon-green)] text-[var(--neon-green)] text-sm rounded-lg hover:bg-[var(--neon-green)] hover:text-black transition-all"
      >
        ← Go Home
      </a>
    </div>
  );
}

export function EmptyDataState({ message = "No data yet." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[150px] gap-2">
      <div className="text-2xl">🌑</div>
      <div className="text-gray-600 text-sm">{message}</div>
    </div>
  );
}

export function WrongNetwork() {
  return (
    <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4 text-center">
      <div className="text-yellow-400 font-bold mb-1">Wrong Network</div>
      <div className="text-yellow-600 text-sm">
        Switch to BNB Smart Chain (BSC) in your wallet.
      </div>
    </div>
  );
}

/** Hero area skeleton — matches the 50vh CharacterDisplay hero block */
export function HeroSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 animate-pulse" style={{ minHeight: "50vh" }}>
      <div className="w-64 h-64 bg-[var(--degen-muted)] rounded-2xl" />
      <div className="h-8 bg-[var(--degen-muted)] rounded w-48" />
      <div className="h-4 bg-[var(--degen-muted)] rounded w-32" />
    </div>
  );
}

/** DNA Panel skeleton */
export function DNAPanelSkeleton() {
  return (
    <div className="bg-[var(--degen-card)] border border-[var(--degen-border)] rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-[var(--degen-muted)] rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 bg-[var(--degen-muted)] rounded w-20" />
            <div className="flex-1 h-2 bg-[var(--degen-muted)] rounded" />
            <div className="h-3 bg-[var(--degen-muted)] rounded w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mutation diary skeleton */
export function DiarySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-[var(--degen-card)] border-l-4 border-[var(--degen-muted)] border-y border-r border-[var(--degen-border)] rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <div className="h-3 bg-[var(--degen-muted)] rounded w-24" />
            <div className="h-3 bg-[var(--degen-muted)] rounded w-16" />
          </div>
          <div className="h-4 bg-[var(--degen-muted)] rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
