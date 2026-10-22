// Contract addresses and ABIs for PKC Token System

// Local Hardhat Network (chainId: 31337)
export const CONTRACTS = {
  localhost: {
    chainId: 31337,
    PKCToken: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    Faucet: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    PokerVault: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  },
  baseSepolia: {
    chainId: 84532,
    PKCToken: '', // Deploy later
    Faucet: '',
    PokerVault: '',
  },
};

// Get contracts for current network
export function getContracts(chainId: number) {
  if (chainId === 31337) return CONTRACTS.localhost;
  if (chainId === 84532) return CONTRACTS.baseSepolia;
  return CONTRACTS.localhost; // Default to localhost
}

// PKC Token ABI (minimal for frontend)
export const PKC_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// Faucet ABI
export const FAUCET_ABI = [
  'function claim() external',
  'function canClaim(address user) view returns (bool canClaimNow, uint256 timeRemaining)',
  'function claimAmount() view returns (uint256)',
  'function cooldownPeriod() view returns (uint256)',
  'function lastClaimTime(address) view returns (uint256)',
  'function faucetBalance() view returns (uint256)',
  'event Claimed(address indexed user, uint256 amount, uint256 timestamp)',
];

// PokerVault ABI
export const POKER_VAULT_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount, uint256 nonce, uint256 expiry, bytes signature) external',
  'function userDeposits(address) view returns (uint256)',
  'function userWithdrawals(address) view returns (uint256)',
  'function withdrawalNonces(address) view returns (uint256)',
  'function getUserStats(address user) view returns (uint256 deposited, uint256 withdrawn, uint256 currentNonce)',
  'function vaultBalance() view returns (uint256)',
  'function minDeposit() view returns (uint256)',
  'function maxDeposit() view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount, uint256 timestamp)',
  'event Withdrawn(address indexed user, uint256 amount, uint256 nonce, uint256 timestamp)',
];

// Hardhat localhost network config for MetaMask
export const LOCALHOST_NETWORK = {
  chainId: '0x7A69', // 31337 in hex
  chainName: 'Hardhat Localhost',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: [],
};

// PKC Token config for adding to MetaMask
export const PKC_TOKEN_CONFIG = {
  type: 'ERC20',
  options: {
    address: CONTRACTS.localhost.PKCToken,
    symbol: 'PKC',
    decimals: 18,
    image: '', // Add logo URL later
  },
};
