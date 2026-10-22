// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PKC Token (PokerChip)
 * @notice Utility token for CryptoPoker platform
 * @dev ERC-20 token with fixed supply of 100,000,000 PKC
 * 
 * TOKENOMICS (100M Total Supply @ $0.01/PKC = $1M FDV):
 * ┌─────────────────────┬──────┬────────────┬───────────┐
 * │ Allocation          │  %   │ PKC Amount │ USD Value │
 * ├─────────────────────┼──────┼────────────┼───────────┤
 * │ 🎮 Game Rewards     │ 35%  │ 35,000,000 │ $350,000  │
 * │ 💧 Liquidity Pool   │ 25%  │ 25,000,000 │ $250,000  │
 * │ 👥 Team (2yr vest)  │ 15%  │ 15,000,000 │ $150,000  │
 * │ 📢 Marketing        │ 10%  │ 10,000,000 │ $100,000  │
 * │ 🎁 Faucet/Airdrop   │ 10%  │ 10,000,000 │ $100,000  │
 * │ 🏦 Reserve          │  5%  │  5,000,000 │  $50,000  │
 * └─────────────────────┴──────┴────────────┴───────────┘
 */
contract PKCToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    
    // Total supply: 100 million tokens with 18 decimals
    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18;
    
    // Allocation percentages (in basis points, 10000 = 100%)
    uint256 public constant GAME_REWARDS_BPS = 3500;    // 35%
    uint256 public constant LIQUIDITY_BPS = 2500;       // 25%
    uint256 public constant TEAM_BPS = 1500;            // 15%
    uint256 public constant MARKETING_BPS = 1000;       // 10%
    uint256 public constant FAUCET_BPS = 1000;          // 10%
    uint256 public constant RESERVE_BPS = 500;          // 5%
    
    // Wallet addresses for allocations
    address public gameRewardsWallet;
    address public liquidityWallet;
    address public teamWallet;
    address public marketingWallet;
    address public faucetWallet;
    address public reserveWallet;
    
    // Events
    event AllocationDistributed(
        address indexed gameRewards,
        address indexed liquidity,
        address indexed team,
        address marketing,
        address faucet,
        address reserve
    );

    /**
     * @notice Constructor - mints total supply to deployer
     * @dev Call distributeAllocations() after deployment to distribute tokens
     */
    constructor() 
        ERC20("PokerChip", "PKC") 
        ERC20Permit("PokerChip")
        Ownable(msg.sender)
    {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @notice Distribute tokens to allocation wallets
     * @dev Can only be called once by owner
     * @param _gameRewards Address for game rewards pool
     * @param _liquidity Address for liquidity pool
     * @param _team Address for team allocation (should be vesting contract)
     * @param _marketing Address for marketing wallet
     * @param _faucet Address for faucet/airdrop wallet
     * @param _reserve Address for reserve wallet
     */
    function distributeAllocations(
        address _gameRewards,
        address _liquidity,
        address _team,
        address _marketing,
        address _faucet,
        address _reserve
    ) external onlyOwner {
        require(gameRewardsWallet == address(0), "Already distributed");
        require(_gameRewards != address(0), "Invalid game rewards address");
        require(_liquidity != address(0), "Invalid liquidity address");
        require(_team != address(0), "Invalid team address");
        require(_marketing != address(0), "Invalid marketing address");
        require(_faucet != address(0), "Invalid faucet address");
        require(_reserve != address(0), "Invalid reserve address");
        
        // Store wallet addresses
        gameRewardsWallet = _gameRewards;
        liquidityWallet = _liquidity;
        teamWallet = _team;
        marketingWallet = _marketing;
        faucetWallet = _faucet;
        reserveWallet = _reserve;
        
        // Calculate amounts
        uint256 gameRewardsAmount = (TOTAL_SUPPLY * GAME_REWARDS_BPS) / 10000;
        uint256 liquidityAmount = (TOTAL_SUPPLY * LIQUIDITY_BPS) / 10000;
        uint256 teamAmount = (TOTAL_SUPPLY * TEAM_BPS) / 10000;
        uint256 marketingAmount = (TOTAL_SUPPLY * MARKETING_BPS) / 10000;
        uint256 faucetAmount = (TOTAL_SUPPLY * FAUCET_BPS) / 10000;
        uint256 reserveAmount = (TOTAL_SUPPLY * RESERVE_BPS) / 10000;
        
        // Transfer allocations
        _transfer(msg.sender, _gameRewards, gameRewardsAmount);
        _transfer(msg.sender, _liquidity, liquidityAmount);
        _transfer(msg.sender, _team, teamAmount);
        _transfer(msg.sender, _marketing, marketingAmount);
        _transfer(msg.sender, _faucet, faucetAmount);
        _transfer(msg.sender, _reserve, reserveAmount);
        
        emit AllocationDistributed(
            _gameRewards,
            _liquidity,
            _team,
            _marketing,
            _faucet,
            _reserve
        );
    }
    
    /**
     * @notice Get allocation amount for a given percentage
     * @param bps Basis points (10000 = 100%)
     * @return Amount of tokens
     */
    function getAllocationAmount(uint256 bps) public pure returns (uint256) {
        return (TOTAL_SUPPLY * bps) / 10000;
    }
}
