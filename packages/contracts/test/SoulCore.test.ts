import { expect } from "chai";
import { ethers } from "hardhat";
import { SoulCore } from "../typechain-types";

describe("SoulCore", function () {
  let soulCore: SoulCore;
  let owner: any;
  let wallet1: any;
  let wallet2: any;

  const ARCHETYPE = "rug_necromancer";
  const DNA_HASH = ethers.keccak256(ethers.toUtf8Bytes("dna_test"));
  const STATE_HASH = ethers.keccak256(ethers.toUtf8Bytes("state_test"));
  const TOKEN_URI = "ipfs://QmTestCID1234";

  beforeEach(async function () {
    [owner, wallet1, wallet2] = await ethers.getSigners();
    const SoulCoreFactory = await ethers.getContractFactory("SoulCore");
    soulCore = (await SoulCoreFactory.deploy()) as SoulCore;
    await soulCore.waitForDeployment();
  });

  describe("Minting", function () {
    it("allows owner to mint a Soul Core", async function () {
      await soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI);
      expect(await soulCore.hasSoulCore(wallet1.address)).to.be.true;
      expect(await soulCore.tokenOfWallet(wallet1.address)).to.equal(1);
    });

    it("reverts if same wallet tries to mint twice", async function () {
      await soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI);
      await expect(
        soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI),
      ).to.be.revertedWithCustomError(soulCore, "AlreadyMinted");
    });

    it("allows different wallets to each mint one", async function () {
      await soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI);
      await soulCore.mint(wallet2.address, "mad_gambler", DNA_HASH, STATE_HASH, "ipfs://token2");
      expect(await soulCore.hasSoulCore(wallet1.address)).to.be.true;
      expect(await soulCore.hasSoulCore(wallet2.address)).to.be.true;
      expect(await soulCore.tokenOfWallet(wallet1.address)).to.equal(1);
      expect(await soulCore.tokenOfWallet(wallet2.address)).to.equal(2);
    });

    it("reverts if non-owner tries to mint", async function () {
      await expect(
        soulCore.connect(wallet1).mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI),
      ).to.be.revertedWithCustomError(soulCore, "OwnableUnauthorizedAccount");
    });

    it("emits SoulCoreCreated event", async function () {
      await expect(soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI))
        .to.emit(soulCore, "SoulCoreCreated")
        .withArgs(wallet1.address, 1, ARCHETYPE);
    });
  });

  describe("Transfer guard (Soulbound)", function () {
    beforeEach(async function () {
      await soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI);
    });

    it("blocks transferFrom", async function () {
      await expect(
        soulCore.connect(wallet1).transferFrom(wallet1.address, wallet2.address, 1),
      ).to.be.revertedWithCustomError(soulCore, "TransferForbidden");
    });

    it("blocks safeTransferFrom", async function () {
      await expect(
        soulCore
          .connect(wallet1)
          ["safeTransferFrom(address,address,uint256)"](wallet1.address, wallet2.address, 1),
      ).to.be.revertedWithCustomError(soulCore, "TransferForbidden");
    });
  });

  describe("State update", function () {
    beforeEach(async function () {
      await soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI);
    });

    it("owner can update state hash and tokenURI", async function () {
      const newStateHash = ethers.keccak256(ethers.toUtf8Bytes("new_state"));
      const newURI = "ipfs://QmNewCID5678";
      await soulCore.updateState(1, newStateHash, newURI);
      expect(await soulCore.stateHashOf(1)).to.equal(newStateHash);
      expect(await soulCore.tokenURI(1)).to.equal(newURI);
    });

    it("emits SoulCoreUpdated event on state update", async function () {
      const newStateHash = ethers.keccak256(ethers.toUtf8Bytes("new_state"));
      await expect(soulCore.updateState(1, newStateHash, "ipfs://new"))
        .to.emit(soulCore, "SoulCoreUpdated")
        .withArgs(1, newStateHash, "ipfs://new");
    });

    it("reverts if non-owner tries to update state", async function () {
      const newStateHash = ethers.keccak256(ethers.toUtf8Bytes("hacked"));
      await expect(
        soulCore.connect(wallet1).updateState(1, newStateHash, "http://evil.com"),
      ).to.be.revertedWithCustomError(soulCore, "OwnableUnauthorizedAccount");
    });
  });

  describe("Views", function () {
    it("hasSoulCore returns false for unminted wallet", async function () {
      expect(await soulCore.hasSoulCore(wallet2.address)).to.be.false;
    });

    it("tokenOfWallet returns 0 for unminted wallet", async function () {
      expect(await soulCore.tokenOfWallet(wallet2.address)).to.equal(0);
    });

    it("archetypeOf returns correct archetype", async function () {
      await soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI);
      expect(await soulCore.archetypeOf(1)).to.equal(ARCHETYPE);
    });

    it("totalMinted tracks correctly", async function () {
      expect(await soulCore.totalMinted()).to.equal(0);
      await soulCore.mint(wallet1.address, ARCHETYPE, DNA_HASH, STATE_HASH, TOKEN_URI);
      expect(await soulCore.totalMinted()).to.equal(1);
      await soulCore.mint(wallet2.address, "mad_gambler", DNA_HASH, STATE_HASH, "ipfs://x");
      expect(await soulCore.totalMinted()).to.equal(2);
    });
  });
});
