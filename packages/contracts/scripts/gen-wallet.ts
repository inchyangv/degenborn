import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("=== DEPLOYER WALLET ===");
  console.log("Address:     ", wallet.address);
  console.log("Private Key: ", wallet.privateKey);
  console.log("Mnemonic:    ", wallet.mnemonic?.phrase ?? "n/a");
  console.log("");
  console.log("⚠ Fund this address with BSC Testnet BNB before deploying.");
  console.log("  Faucet: https://testnet.bnbchain.org/faucet-smart");
  console.log("");

  // Write to .env.deployer (gitignored)
  const envPath = path.join(__dirname, "..", ".env.deployer");
  fs.writeFileSync(
    envPath,
    `# Auto-generated deployer wallet — DO NOT COMMIT\nPRIVATE_KEY=${wallet.privateKey}\nDEPLOYER_ADDRESS=${wallet.address}\n`,
    "utf-8",
  );
  console.log(`Private key saved to: ${envPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
