import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const SoulCoreFactory = await ethers.getContractFactory("SoulCore");
  const soulCore = await SoulCoreFactory.deploy();
  await soulCore.waitForDeployment();

  const address = await soulCore.getAddress();
  console.log("SoulCore deployed to:", address);
  console.log("Set SOUL_CORE_ADDRESS=" + address + " in your .env");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
