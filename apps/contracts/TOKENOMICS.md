# PKC Token (PokerChip) - Tokenomics

## Overview

**PKC** is the utility token for the CryptoPoker platform. It's designed for gaming utility, not as a store of value.

## Token Details

| Property | Value |
|----------|-------|
| Name | PokerChip |
| Symbol | PKC |
| Decimals | 18 |
| Total Supply | 100,000,000 PKC |
| Initial Price | $0.01 |
| Fully Diluted Value | $1,000,000 |

## Allocation

```
┌─────────────────────────────────────────────────────────────────┐
│                    PKC Token Distribution                        │
├─────────────────────┬──────┬────────────┬───────────────────────┤
│ Allocation          │  %   │   Amount   │ Purpose               │
├─────────────────────┼──────┼────────────┼───────────────────────┤
│ 🎮 Game Rewards     │ 35%  │ 35,000,000 │ Rake back, bonuses    │
│ 💧 Liquidity Pool   │ 25%  │ 25,000,000 │ DEX trading pairs     │
│ 👥 Team             │ 15%  │ 15,000,000 │ 2-year vesting        │
│ 📢 Marketing        │ 10%  │ 10,000,000 │ Promotions, ads       │
│ 🎁 Faucet/Airdrop   │ 10%  │ 10,000,000 │ New user onboarding   │
│ 🏦 Reserve          │  5%  │  5,000,000 │ Emergency fund        │
└─────────────────────┴──────┴────────────┴───────────────────────┘
```

## Utility

### 1. Game Buy-ins
- All poker tables accept PKC
- Tournaments require PKC entry
- Cash games use PKC stacks

### 2. Rewards
- Rake back paid in PKC
- Tournament prizes in PKC
- Achievement rewards

### 3. Staking (Future)
- Stake PKC to earn platform revenue share
- VIP benefits for stakers

## Smart Contracts

### PKCToken.sol
- Standard ERC-20 implementation
- Fixed supply (no minting)
- Burnable (deflationary potential)
- Permit support for gasless approvals

### PokerVault.sol
- Bridge between on-chain and in-game balances
- Deposit: PKC → In-game balance
- Withdraw: In-game balance → PKC
- Backend signature required for withdrawals (security)

### Faucet.sol
- Dispenses 10,000 PKC to new users
- 24-hour cooldown between claims
- For testnet onboarding

## Token Flow

```
┌──────────────┐     Deposit      ┌──────────────┐
│              │ ───────────────► │              │
│  User Wallet │                  │  PokerVault  │
│              │ ◄─────────────── │              │
└──────────────┘     Withdraw     └──────────────┘
                                         │
                                         │ Backend syncs
                                         ▼
                                  ┌──────────────┐
                                  │              │
                                  │  In-Game     │
                                  │  Balance     │
                                  │              │
                                  └──────────────┘
```

## Price Mechanics

### Why $0.01 per PKC?

1. **Easy Math**: $10 = 1,000 PKC, $100 = 10,000 PKC
2. **Psychology**: Players prefer whole numbers
3. **Growth Room**: If platform succeeds, price can grow organically
4. **Low Barrier**: New players can start with small amounts

### Stake Sizes at $0.01/PKC

| Stakes | Blinds (PKC) | Buy-in (PKC) | USD Value |
|--------|--------------|--------------|-----------|
| Micro  | 10/20        | 2,000        | $20       |
| Low    | 50/100       | 10,000       | $100      |
| Mid    | 250/500      | 50,000       | $500      |
| High   | 1,000/2,000  | 200,000      | $2,000    |

## Security

1. **No Admin Mint**: Fixed supply, owner cannot create new tokens
2. **Withdrawal Signatures**: Backend must sign all withdrawals
3. **Reentrancy Guards**: All sensitive functions protected
4. **Pausable**: Emergency stop for vault operations
5. **Time-locked Team Tokens**: 2-year vesting for team allocation

## Deployment

### Testnet (Base Sepolia)
- Free to test
- Faucet available
- Full functionality

### Mainnet (Future)
- Base L2 (low fees)
- Liquidity on Uniswap
- Verified contracts

## Roadmap

- [x] Token contract design
- [x] Vault contract design
- [x] Faucet for testing
- [ ] Deploy to Base Sepolia
- [ ] Frontend wallet integration
- [ ] Backend deposit/withdraw handling
- [ ] Mainnet deployment
- [ ] DEX liquidity
