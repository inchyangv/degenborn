/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@degenborn/shared",
    "@degenborn/scoring",
    "@degenborn/archetype",
    "@degenborn/data-adapter",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // Optional deps pulled by wallet SDKs in browser bundles.
      // We do not use these modules in this app runtime.
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
