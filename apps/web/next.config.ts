import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@degenborn/shared", "@degenborn/scoring", "@degenborn/archetype", "@degenborn/data-adapter"],
};

export default nextConfig;
