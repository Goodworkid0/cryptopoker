import { expect } from "chai";
import { ethers } from "hardhat";
import { PKCToken, Faucet, PokerVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PKC Token System", function () {
  let pkcToken: PKCToken;
  let faucet: Faucet;
  let pokerVault: PokerVault;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let backendSigner: SignerWithAddress;

  const TOTAL_SUPPLY = ethers.parseEther("100000000"); // 100M
  const FAUCET_AMOUNT = ethers.parseEther("10000"); // 10K

  beforeEach(async function () {
    [owner, user1, user2, backendSigner] = await ethers.getSigners();

    // Deploy PKC Token
    const PKCToken = await ethers.getContractFactory("PKCToken");
    pkcToken = await PKCToken.deploy();
    await pkcToken.waitForDeployment();

    // Deploy Faucet
    const Faucet = await ethers.getContractFactory("Faucet");
    faucet = await Faucet.deploy(await pkcToken.getAddress());
    await faucet.waitForDeployment();

    // Deploy PokerVault
    const PokerVault = await ethers.getContractFactory("PokerVault");
    pokerVault = await PokerVault.deploy(
      await pkcToken.getAddress(),
      backendSigner.address
    );
    await pokerVault.waitForDeployment();
  });

  describe("PKC Token", function () {
    it("Should have correct name and symbol", async function () {
      expect(await pkcToken.name()).to.equal("PokerChip");
      expect(await pkcToken.symbol()).to.equal("PKC");
    });

    it("Should mint total supply to deployer", async function () {
      expect(await pkcToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should distribute allocations correctly", async function () {
      await pkcToken.distributeAllocations(
        user1.address, // gameRewards
        user1.address, // liquidity
        user1.address, // team
        user1.address, // marketing
        await faucet.getAddress(), // faucet
        user1.address  // reserve
      );

      // Faucet should have 10% = 10M PKC
      const faucetBalance = await pkcToken.balanceOf(await faucet.getAddress());
      expect(faucetBalance).to.equal(ethers.parseEther("10000000"));

      // User1 should have 90% = 90M PKC
      const user1Balance = await pkcToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(ethers.parseEther("90000000"));
    });

    it("Should not allow double distribution", async function () {
      await pkcToken.distributeAllocations(
        user1.address, user1.address, user1.address,
        user1.address, user1.address, user1.address
      );

      await expect(
        pkcToken.distributeAllocations(
          user2.address, user2.address, user2.address,
          user2.address, user2.address, user2.address
        )
      ).to.be.revertedWith("Already distributed");
    });
  });

  describe("Faucet", function () {
    beforeEach(async function () {
      // Fund faucet with tokens
      await pkcToken.transfer(await faucet.getAddress(), ethers.parseEther("100000"));
    });

    it("Should allow first time claim", async function () {
      await faucet.connect(user1).claim();
      expect(await pkcToken.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("Should not allow claim within cooldown", async function () {
      await faucet.connect(user1).claim();
      
      await expect(faucet.connect(user1).claim()).to.be.reverted;
    });

    it("Should report correct canClaim status", async function () {
      let [canClaim, timeRemaining] = await faucet.canClaim(user1.address);
      expect(canClaim).to.be.true;
      expect(timeRemaining).to.equal(0);

      await faucet.connect(user1).claim();

      [canClaim, timeRemaining] = await faucet.canClaim(user1.address);
      expect(canClaim).to.be.false;
      expect(timeRemaining).to.be.greaterThan(0);
    });
  });

  describe("PokerVault", function () {
    const DEPOSIT_AMOUNT = ethers.parseEther("1000");

    beforeEach(async function () {
      // Give user1 some tokens
      await pkcToken.transfer(user1.address, ethers.parseEther("10000"));
    });

    it("Should accept deposits", async function () {
      await pkcToken.connect(user1).approve(await pokerVault.getAddress(), DEPOSIT_AMOUNT);
      await pokerVault.connect(user1).deposit(DEPOSIT_AMOUNT);

      expect(await pokerVault.userDeposits(user1.address)).to.equal(DEPOSIT_AMOUNT);
      expect(await pokerVault.totalDeposited()).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should reject deposits below minimum", async function () {
      const smallAmount = ethers.parseEther("10"); // Below 100 PKC minimum
      await pkcToken.connect(user1).approve(await pokerVault.getAddress(), smallAmount);
      
      await expect(pokerVault.connect(user1).deposit(smallAmount)).to.be.reverted;
    });

    it("Should allow withdrawal with valid signature", async function () {
      // Deposit first
      await pkcToken.connect(user1).approve(await pokerVault.getAddress(), DEPOSIT_AMOUNT);
      await pokerVault.connect(user1).deposit(DEPOSIT_AMOUNT);

      // Create withdrawal signature
      const nonce = 1;
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const chainId = (await ethers.provider.getNetwork()).chainId;
      
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256", "uint256", "address", "uint256"],
        [user1.address, DEPOSIT_AMOUNT, nonce, expiry, await pokerVault.getAddress(), chainId]
      );
      
      const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));

      // Withdraw
      await pokerVault.connect(user1).withdraw(DEPOSIT_AMOUNT, nonce, expiry, signature);

      expect(await pkcToken.balanceOf(user1.address)).to.equal(ethers.parseEther("10000"));
    });

    it("Should reject withdrawal with invalid signature", async function () {
      await pkcToken.connect(user1).approve(await pokerVault.getAddress(), DEPOSIT_AMOUNT);
      await pokerVault.connect(user1).deposit(DEPOSIT_AMOUNT);

      const nonce = 1;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      
      // Sign with wrong signer
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256", "uint256", "address", "uint256"],
        [user1.address, DEPOSIT_AMOUNT, nonce, expiry, await pokerVault.getAddress(), 31337]
      );
      
      const badSignature = await user2.signMessage(ethers.getBytes(messageHash));

      await expect(
        pokerVault.connect(user1).withdraw(DEPOSIT_AMOUNT, nonce, expiry, badSignature)
      ).to.be.reverted;
    });
  });
});
