'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { 
  getContracts, 
  PKC_TOKEN_ABI, 
  FAUCET_ABI, 
  POKER_VAULT_ABI,
  LOCALHOST_NETWORK,
  PKC_TOKEN_CONFIG,
} from '@/lib/contracts';

interface WalletState {
  address: string | null;
  chainId: number | null;
  ethBalance: string;
  pkcBalance: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    ethBalance: '0',
    pkcBalance: '0',
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setState(s => ({ ...s, address: null, isConnected: false }));
    } else {
      setState(s => ({ ...s, address: accounts[0] }));
      refreshBalances(accounts[0]);
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    setState(s => ({ ...s, chainId }));
    if (state.address) {
      refreshBalances(state.address);
    }
  };

  const checkConnection = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const address = accounts[0].address;
        const network = await provider.getNetwork();
        setProvider(provider);
        setState(s => ({ 
          ...s, 
          address, 
          chainId: Number(network.chainId),
          isConnected: true 
        }));
        refreshBalances(address);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState(s => ({ ...s, error: 'MetaMask not installed' }));
      return;
    }

    setState(s => ({ ...s, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setState(s => ({
        ...s,
        address: accounts[0],
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
      }));

      refreshBalances(accounts[0]);
    } catch (error: any) {
      setState(s => ({ 
        ...s, 
        isConnecting: false, 
        error: error.message || 'Failed to connect' 
      }));
    }
  };

  const disconnect = () => {
    setState({
      address: null,
      chainId: null,
      ethBalance: '0',
      pkcBalance: '0',
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    setProvider(null);
  };

  const switchToLocalhost = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LOCALHOST_NETWORK.chainId }],
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [LOCALHOST_NETWORK],
        });
      }
    }
  };

  const addPKCToken = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: PKC_TOKEN_CONFIG,
      });
    } catch (error) {
      console.error('Error adding PKC token:', error);
    }
  };

  const refreshBalances = async (address: string) => {
    if (!provider) return;

    try {
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const contracts = getContracts(chainId);

      // ETH Balance
      const ethBalance = await provider.getBalance(address);
      
      // PKC Balance
      const pkcContract = new Contract(contracts.PKCToken, PKC_TOKEN_ABI, provider);
      const pkcBalance = await pkcContract.balanceOf(address);

      setState(s => ({
        ...s,
        ethBalance: formatEther(ethBalance),
        pkcBalance: formatEther(pkcBalance),
      }));
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  const claimFaucet = async (): Promise<boolean> => {
    if (!provider || !state.address) return false;

    try {
      const signer = await provider.getSigner();
      const contracts = getContracts(state.chainId || 31337);
      const faucet = new Contract(contracts.Faucet, FAUCET_ABI, signer);

      // Check if can claim
      const [canClaimNow, timeRemaining] = await faucet.canClaim(state.address);
      if (!canClaimNow) {
        const hours = Math.floor(Number(timeRemaining) / 3600);
        const minutes = Math.floor((Number(timeRemaining) % 3600) / 60);
        throw new Error(`Cooldown active. Try again in ${hours}h ${minutes}m`);
      }

      const tx = await faucet.claim();
      await tx.wait();
      
      await refreshBalances(state.address);
      return true;
    } catch (error: any) {
      console.error('Faucet claim error:', error);
      setState(s => ({ ...s, error: error.message }));
      return false;
    }
  };

  const depositToVault = async (amount: string): Promise<boolean> => {
    if (!provider || !state.address) return false;

    try {
      const signer = await provider.getSigner();
      const contracts = getContracts(state.chainId || 31337);
      
      const pkcToken = new Contract(contracts.PKCToken, PKC_TOKEN_ABI, signer);
      const vault = new Contract(contracts.PokerVault, POKER_VAULT_ABI, signer);
      
      const amountWei = parseEther(amount);

      // Approve vault to spend tokens
      const approveTx = await pkcToken.approve(contracts.PokerVault, amountWei);
      await approveTx.wait();

      // Deposit
      const depositTx = await vault.deposit(amountWei);
      await depositTx.wait();

      await refreshBalances(state.address);
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      setState(s => ({ ...s, error: error.message }));
      return false;
    }
  };

  return {
    ...state,
    connect,
    disconnect,
    switchToLocalhost,
    addPKCToken,
    refreshBalances: () => state.address && refreshBalances(state.address),
    claimFaucet,
    depositToVault,
  };
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
