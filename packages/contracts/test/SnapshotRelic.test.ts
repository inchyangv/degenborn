import { expect } from "chai";
import { ethers } from "hardhat";
import { SnapshotRelic } from "../typechain-types";

describe("SnapshotRelic", function () {
  let relic: SnapshotRelic;
  let owner: any;
  let wallet1: any;
  let wallet2: any;

  const MilestoneType = {
    FIRST_CROWNED_WIN: 0,
    RUG_SURVIVOR: 1,
    SEVEN_DAY_RESURRECTION: 2,
    CHAOS_ASCENSION: 3,
    DIAMOND_HANDS: 4,
    GHOST_AWAKENING: 5,
  };

  const TOKEN_URI = "ipfs://QmRelicTest";

  beforeEach(async function () {
    [owner, wallet1, wallet2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SnapshotRelic");
    relic = (await Factory.deploy()) as SnapshotRelic;
    await relic.waitForDeployment();
  });

  describe("Minting", function () {
    it("owner can mint a relic for a wallet", async function () {
      await relic.mint(wallet1.address, MilestoneType.FIRST_CROWNED_WIN, TOKEN_URI);
      expect(await relic.totalMinted()).to.equal(1);
      expect(await relic.ownerOf(1)).to.equal(wallet1.address);
    });

    it("emits RelicMinted event", async function () {
      await expect(relic.mint(wallet1.address, MilestoneType.RUG_SURVIVOR, TOKEN_URI))
        .to.emit(relic, "RelicMinted")
        .withArgs(wallet1.address, 1, MilestoneType.RUG_SURVIVOR, TOKEN_URI);
    });

    it("different milestone types can both be minted for same wallet", async function () {
      await relic.mint(wallet1.address, MilestoneType.FIRST_CROWNED_WIN, TOKEN_URI);
      await relic.mint(wallet1.address, MilestoneType.RUG_SURVIVOR, TOKEN_URI);
      expect(await relic.totalMinted()).to.equal(2);
    });

    it("reverts if same wallet tries to earn same milestone twice", async function () {
      await relic.mint(wallet1.address, MilestoneType.FIRST_CROWNED_WIN, TOKEN_URI);
      await expect(
        relic.mint(wallet1.address, MilestoneType.FIRST_CROWNED_WIN, TOKEN_URI),
      ).to.be.revertedWithCustomError(relic, "MilestoneAlreadyEarned");
    });

    it("different wallets can earn the same milestone", async function () {
      await relic.mint(wallet1.address, MilestoneType.CHAOS_ASCENSION, TOKEN_URI);
      await relic.mint(wallet2.address, MilestoneType.CHAOS_ASCENSION, TOKEN_URI);
      expect(await relic.totalMinted()).to.equal(2);
    });

    it("non-owner cannot mint", async function () {
      await expect(
        relic.connect(wallet1).mint(wallet1.address, MilestoneType.DIAMOND_HANDS, TOKEN_URI),
      ).to.be.revertedWithCustomError(relic, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transferability (unlike Soul Core)", function () {
    beforeEach(async function () {
      await relic.mint(wallet1.address, MilestoneType.GHOST_AWAKENING, TOKEN_URI);
    });

    it("allows transferFrom — relics are tradeable", async function () {
      await relic.connect(wallet1).transferFrom(wallet1.address, wallet2.address, 1);
      expect(await relic.ownerOf(1)).to.equal(wallet2.address);
    });

    it("earnerOf still returns original earner after transfer", async function () {
      await relic.connect(wallet1).transferFrom(wallet1.address, wallet2.address, 1);
      expect(await relic.earnerOf(1)).to.equal(wallet1.address);
    });
  });

  describe("Views", function () {
    beforeEach(async function () {
      await relic.mint(wallet1.address, MilestoneType.SEVEN_DAY_RESURRECTION, TOKEN_URI);
    });

    it("milestoneOf returns correct type", async function () {
      expect(await relic.milestoneOf(1)).to.equal(MilestoneType.SEVEN_DAY_RESURRECTION);
    });

    it("milestoneLabel returns human-readable name", async function () {
      expect(await relic.milestoneLabel(MilestoneType.SEVEN_DAY_RESURRECTION)).to.equal(
        "Seven-Day Resurrection",
      );
    });

    it("hasEarnedMilestone returns true after mint", async function () {
      expect(
        await relic.hasEarnedMilestone(wallet1.address, MilestoneType.SEVEN_DAY_RESURRECTION),
      ).to.be.true;
    });

    it("hasEarnedMilestone returns false for unearned milestone", async function () {
      expect(
        await relic.hasEarnedMilestone(wallet1.address, MilestoneType.DIAMOND_HANDS),
      ).to.be.false;
    });

    it("tokenURI matches what was set", async function () {
      expect(await relic.tokenURI(1)).to.equal(TOKEN_URI);
    });
  });

  describe("Soul Core vs Snapshot Relic distinction", function () {
    it("SnapshotRelic name and symbol are distinct from Soul Core", async function () {
      expect(await relic.name()).to.equal("DegenBorn Snapshot Relic");
      expect(await relic.symbol()).to.equal("RELIC");
    });

    it("all 6 milestone labels are defined", async function () {
      const expected = [
        "First Crowned Win",
        "Rug Survivor",
        "Seven-Day Resurrection",
        "Chaos Ascension",
        "Diamond Hands",
        "Ghost Awakening",
      ];
      for (let i = 0; i < 6; i++) {
        expect(await relic.milestoneLabel(i)).to.equal(expected[i]);
      }
    });
  });
});
