import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SoulCore from:", deployer.address);
  console.log("Network:", network.name);

  const SoulCoreFactory = await ethers.getContractFactory("SoulCore");
  const soulCore = await SoulCoreFactory.deploy();
  await soulCore.waitForDeployment();

  const address = await soulCore.getAddress();
  const deployTx = soulCore.deploymentTransaction();
  const blockNumber = deployTx ? (await deployTx.wait())?.blockNumber ?? 0 : 0;
  const txHash = deployTx?.hash ?? "";

  console.log("SoulCore deployed to:", address);
  console.log("Tx hash:", txHash);

  // Write deployment record so frontend can read it at build time
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);

  // Merge with existing record (e.g. if SnapshotRelic was already deployed)
  let existing: Record<string, unknown> = {};
  if (fs.existsSync(deploymentFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
    } catch { /* start fresh */ }
  }

  const record = {
    ...existing,
    SoulCore: address,
    soulCoreTxHash: txHash,
    soulCoreBlockNumber: blockNumber,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(record, null, 2));
  console.log(`Deployment record written to: ${deploymentFile}`);
  console.log(`\nAdd to your .env.local:\n  NEXT_PUBLIC_SOUL_CORE_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
