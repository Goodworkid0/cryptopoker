'use client';

import { useWallet } from '@/hooks/useWallet';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function OnChainWalletPage() {
  const wallet = useWallet();
  const [depositAmount, setDepositAmount] = useState('1000');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClaim = async () => {
    setIsClaiming(true);
    setMessage(null);
    
    const success = await wallet.claimFaucet();
    
    if (success) {
      setMessage({ type: 'success', text: '🎉 Successfully claimed 10,000 PKC!' });
    } else {
      setMessage({ type: 'error', text: wallet.error || 'Failed to claim' });
    }
    
    setIsClaiming(false);
  };

  const handleDeposit = async () => {
    setIsDepositing(true);
    setMessage(null);
    
    const success = await wallet.depositToVault(depositAmount);
    
    if (success) {
      setMessage({ type: 'success', text: `✅ Deposited ${depositAmount} PKC to game vault!` });
    } else {
      setMessage({ type: 'error', text: wallet.error || 'Failed to deposit' });
    }
    
    setIsDepositing(false);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="text-[#ffd700]">PKC</span> On-Chain Wallet
            </h1>
            <p className="text-gray-400">
              Connect MetaMask • Claim Faucet • Deposit to Play
            </p>
          </div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-[#2a3142] text-gray-300 rounded-lg hover:bg-[#3a4152] transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* Connection Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-6 mb-6"
        >
          {!wallet.isConnected ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🦊</div>
              <h2 className="text-xl font-bold mb-2">Connect MetaMask</h2>
              <p className="text-gray-400 mb-4">
                Connect your wallet to access the PKC faucet and deposit to play
              </p>
              <button
                onClick={wallet.connect}
                disabled={wallet.isConnecting}
                className="px-8 py-3 bg-gradient-to-r from-[#f6851b] to-[#e2761b] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
              
              <div className="mt-6 p-4 bg-[#0a0e17] rounded-lg text-left">
                <h3 className="text-sm font-bold text-[#00ff88] mb-2">📋 Setup for Local Testing:</h3>
                <ol className="text-xs text-gray-400 space-y-1">
                  <li>1. Install MetaMask extension</li>
                  <li>2. Add network: RPC <code className="text-[#00ff88]">http://127.0.0.1:8545</code> ChainID <code className="text-[#00ff88]">31337</code></li>
                  <li>3. Import test account with this private key:</li>
                </ol>
                <code className="block mt-2 p-2 bg-black/50 rounded text-[10px] text-[#00ff88] break-all select-all">
                  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
                </code>
                <p className="text-xs text-yellow-500 mt-2">⚠️ Test key only - has 10,000 ETH on localhost</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center">
                    <span className="text-black font-bold">
                      {wallet.address?.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-sm">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Chain ID: {wallet.chainId} 
                      {wallet.chainId === 31337 && <span className="text-[#00ff88]"> ✓ Localhost</span>}
                      {wallet.chainId !== 31337 && <span className="text-yellow-500"> ⚠️ Wrong network</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={wallet.disconnect}
                  className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                >
                  Disconnect
                </button>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0a0e17] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">ETH Balance</div>
                  <div className="text-2xl font-bold">{formatBalance(wallet.ethBalance)}</div>
                  <div className="text-xs text-gray-500">For gas fees</div>
                </div>
                <div className="bg-[#0a0e17] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">PKC Balance</div>
                  <div className="text-2xl font-bold text-[#ffd700]">{formatBalance(wallet.pkcBalance)}</div>
                  <div className="text-xs text-gray-500">PokerChip Token</div>
                </div>
              </div>

              {/* Network buttons */}
              <div className="flex gap-2">
                <button
                  onClick={wallet.switchToLocalhost}
                  className="flex-1 py-2 text-sm bg-[#2a3142] text-gray-300 rounded-lg hover:bg-[#3a4152]"
                >
                  🔗 Switch to Localhost
                </button>
                <button
                  onClick={wallet.addPKCToken}
                  className="flex-1 py-2 text-sm bg-[#2a3142] text-gray-300 rounded-lg hover:bg-[#3a4152]"
                >
                  ➕ Add PKC to MetaMask
                </button>
                <button
                  onClick={() => wallet.refreshBalances()}
                  className="py-2 px-3 text-sm bg-[#2a3142] text-gray-300 rounded-lg hover:bg-[#3a4152]"
                >
                  🔄
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {wallet.isConnected && (
          <>
            {/* Faucet Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#1a1f2e] to-[#0a0e17] border border-[#00ff88]/30 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🚰</span>
                <div>
                  <h2 className="text-xl font-bold">PKC Faucet</h2>
                  <p className="text-gray-400 text-sm">Claim free test tokens (on-chain)</p>
                </div>
              </div>
              
              <div className="bg-[#0a0e17] rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Claim Amount</span>
                  <span className="text-[#00ff88] font-bold text-xl">10,000 PKC</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">Cooldown</span>
                  <span className="text-gray-300">24 hours</span>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={isClaiming || wallet.chainId !== 31337}
                className="w-full py-4 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? '⏳ Claiming...' : '🎁 Claim 10,000 PKC'}
              </button>
              
              {wallet.chainId !== 31337 && (
                <p className="text-yellow-500 text-xs mt-2 text-center">
                  ⚠️ Switch to Localhost network (ChainID: 31337) to use faucet
                </p>
              )}
            </motion.div>

            {/* Deposit Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🏦</span>
                <div>
                  <h2 className="text-xl font-bold">Deposit to PokerVault</h2>
                  <p className="text-gray-400 text-sm">Lock PKC in smart contract to play</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Amount (PKC)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#2a3142] rounded-lg px-4 py-3 text-white text-lg pr-16"
                    placeholder="1000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ffd700] font-medium">PKC</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Min: 100 PKC • Max: 1,000,000 PKC
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {['100', '1000', '5000', '10000'].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      depositAmount === amount 
                        ? 'bg-[#ffd700] text-black' 
                        : 'bg-[#2a3142] text-gray-300 hover:bg-[#3a4152]'
                    }`}
                  >
                    {parseInt(amount).toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || parseFloat(wallet.pkcBalance) < parseFloat(depositAmount)}
                className="w-full py-4 bg-gradient-to-r from-[#ffd700] to-[#f0c000] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositing ? '⏳ Depositing...' : `💰 Deposit ${parseInt(depositAmount || '0').toLocaleString()} PKC`}
              </button>
              
              {parseFloat(wallet.pkcBalance) < parseFloat(depositAmount) && (
                <p className="text-red-400 text-xs mt-2 text-center">
                  Insufficient PKC balance. Claim from faucet first!
                </p>
              )}
            </motion.div>
          </>
        )}

        {/* Contract Info */}
        <div className="mt-8 p-4 bg-[#1a1f2e] rounded-xl border border-[#2a3142]">
          <h3 className="text-sm font-bold text-gray-400 mb-3">📜 Smart Contract Addresses (Localhost)</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">PKC Token:</span>
              <span className="text-[#00ff88]">0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Faucet:</span>
              <span className="text-[#00ff88]">0x5FC8d32690cc91D4c39d9d3abcBD16989F875707</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">PokerVault:</span>
              <span className="text-[#00ff88]">0x0165878A594ca255338adfa4d48449f69242Eb8F</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>🔧 Local Hardhat Network - All tokens are for testing only</p>
          <p className="mt-1">No real money involved • 100% Free</p>
        </div>
      </div>
    </div>
  );
}
