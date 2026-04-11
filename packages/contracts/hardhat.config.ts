import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as fs from "fs";
import * as path from "path";

// Load .env.deployer if present (takes priority over env vars for PRIVATE_KEY)
const deployerEnvPath = path.join(__dirname, ".env.deployer");
if (fs.existsSync(deployerEnvPath)) {
  for (const line of fs.readFileSync(deployerEnvPath, "utf-8").split("\n")) {
    const [key, ...valueParts] = line.split("=");
    if (key && !key.startsWith("#")) {
      process.env[key.trim()] ??= valueParts.join("=").trim();
    }
  }
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {},
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 97,
    },
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC ?? "https://bsc-dataseed.binance.org/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY ?? "",
      bsc: process.env.BSCSCAN_API_KEY ?? "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
