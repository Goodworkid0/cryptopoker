'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Spade, Mail, Lock, User, Eye, EyeOff, Wallet } from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    username: '',
    email: '',
    password: '',
  });

  const router = useRouter();
  const { login } = useAuthStore();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data } = await authApi.login({
          emailOrUsername: formData.emailOrUsername,
          password: formData.password,
        });
        login(data.user);
      } else {
        const { data } = await authApi.register({
          username: formData.username,
          email: formData.email || undefined,
          password: formData.password,
        });
        login(data.user);
      }
      router.push('/poker');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!address) return;
    
    setLoading(true);
    setError('');

    try {
      // Get nonce
      const { data: nonceData } = await authApi.getNonce(address);
      
      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to CryptoPoker',
        uri: window.location.origin,
        version: '1',
        chainId: 137,
        nonce: nonceData.nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      const { data } = await authApi.walletLogin({
        message: message.prepareMessage(),
        signature,
      });

      login(data.user);
      router.push('/poker');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign in with wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-poker flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
            <Spade className="w-7 h-7 text-background-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-gradient">
            CryptoPoker
          </span>
        </Link>

        {/* Card */}
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-text-secondary text-center mb-8">
            {isLogin ? 'Sign in to continue playing' : 'Join the crypto poker revolution'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Wallet Login */}
          <div className="mb-6 space-y-3">
            {isConnected ? (
              <button
                onClick={handleWalletLogin}
                disabled={loading}
                className="btn btn-primary w-full justify-center"
              >
                <Wallet className="w-5 h-5" />
                {loading ? 'Signing in...' : `Sign in with ${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </button>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="btn btn-primary w-full justify-center group"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            )}
            
            {/* Supported wallets info */}
            {!isConnected && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="text-xs text-text-muted">Supported:</span>
                {['MetaMask', 'Coinbase', 'WalletConnect', 'Rainbow', 'Trust', 'Phantom', 'Ledger', 'OKX', 'Brave'].map((wallet) => (
                  <span key={wallet} className="text-xs text-text-secondary bg-background-secondary px-2 py-0.5 rounded">
                    {wallet}
                  </span>
                ))}
                <span className="text-xs text-accent-primary">+more</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-secondary" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background-card text-text-muted">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    className="input pl-12"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                {isLogin ? 'Email or Username' : 'Email (optional)'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={isLogin ? 'text' : 'email'}
                  className="input pl-12"
                  placeholder={isLogin ? 'Enter email or username' : 'Enter email'}
                  value={isLogin ? formData.emailOrUsername : formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [isLogin ? 'emailOrUsername' : 'email']: e.target.value,
                    })
                  }
                  required={isLogin}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-12 pr-12"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-accent-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-text-secondary">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-accent-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-text-muted text-sm">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-accent-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
