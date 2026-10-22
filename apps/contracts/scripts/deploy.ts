import { ethers, network } from "hardhat";

/**
 * PKC Token Deployment Script
 * 
 * Tokenomics: 100,000,000 PKC @ $0.01 = $1M FDV
 * 
 * Allocations:
 * - Game Rewards: 35% (35M PKC)
 * - Liquidity: 25% (25M PKC)
 * - Team: 15% (15M PKC) - 2 year vesting
 * - Marketing: 10% (10M PKC)
 * - Faucet/Airdrop: 10% (10M PKC)
 * - Reserve: 5% (5M PKC)
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("═══════════════════════════════════════════════════════════");
  console.log("   🎰 CryptoPoker - PKC Token Deployment");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("───────────────────────────────────────────────────────────");

  // 1. Deploy PKC Token
  console.log("\n📝 Deploying PKC Token...");
  const PKCToken = await ethers.getContractFactory("PKCToken");
  const pkcToken = await PKCToken.deploy();
  await pkcToken.waitForDeployment();
  
  const pkcAddress = await pkcToken.getAddress();
  console.log(`✅ PKC Token deployed: ${pkcAddress}`);
  
  // 2. Deploy Faucet
  console.log("\n📝 Deploying Faucet...");
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(pkcAddress);
  await faucet.waitForDeployment();
  
  const faucetAddress = await faucet.getAddress();
  console.log(`✅ Faucet deployed: ${faucetAddress}`);
  
  // 3. Deploy PokerVault
  console.log("\n📝 Deploying PokerVault...");
  const PokerVault = await ethers.getContractFactory("PokerVault");
  // Using deployer as backend signer for now (change in production!)
  const pokerVault = await PokerVault.deploy(pkcAddress, deployer.address);
  await pokerVault.waitForDeployment();
  
  const vaultAddress = await pokerVault.getAddress();
  console.log(`✅ PokerVault deployed: ${vaultAddress}`);
  
  // 4. Distribute allocations
  console.log("\n📦 Distributing token allocations...");
  
  // For testnet, we'll use deployer address for all allocations
  // In production, use proper multisig wallets!
  const tx = await pkcToken.distributeAllocations(
    deployer.address,  // gameRewards → will transfer to game contracts
    deployer.address,  // liquidity → will add to DEX
    deployer.address,  // team → should be vesting contract
    deployer.address,  // marketing
    faucetAddress,     // faucet → goes directly to faucet contract!
    deployer.address   // reserve
  );
  await tx.wait();
  console.log("✅ Allocations distributed!");
  
  // Check balances
  const deployerBalance = await pkcToken.balanceOf(deployer.address);
  const faucetBalance = await pkcToken.balanceOf(faucetAddress);
  
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("   📊 Deployment Summary");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`PKC Token:    ${pkcAddress}`);
  console.log(`Faucet:       ${faucetAddress}`);
  console.log(`PokerVault:   ${vaultAddress}`);
  console.log("───────────────────────────────────────────────────────────");
  console.log(`Deployer PKC: ${ethers.formatEther(deployerBalance)} PKC`);
  console.log(`Faucet PKC:   ${ethers.formatEther(faucetBalance)} PKC`);
  console.log("═══════════════════════════════════════════════════════════");
  
  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    contracts: {
      PKCToken: pkcAddress,
      Faucet: faucetAddress,
      PokerVault: vaultAddress,
    },
    deployedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    `./deployments-${network.name}.json`,
    JSON.stringify(addresses, null, 2)
  );
  console.log(`\n💾 Addresses saved to deployments-${network.name}.json`);
  
  // Verification commands
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n📋 Verification Commands:");
    console.log(`npx hardhat verify --network ${network.name} ${pkcAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${faucetAddress} "${pkcAddress}"`);
    console.log(`npx hardhat verify --network ${network.name} ${vaultAddress} "${pkcAddress}" "${deployer.address}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
