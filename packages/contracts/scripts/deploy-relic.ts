import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const Factory = await ethers.getContractFactory("SnapshotRelic");
  const relic = await Factory.deploy();
  await relic.waitForDeployment();

  const address = await relic.getAddress();
  console.log("SnapshotRelic deployed to:", address);
  console.log("Set SNAPSHOT_RELIC_ADDRESS=" + address + " in your .env");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
