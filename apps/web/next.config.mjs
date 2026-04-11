/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@degenborn/shared",
    "@degenborn/scoring",
    "@degenborn/archetype",
    "@degenborn/data-adapter",
  ],
};

export default nextConfig;
