'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Spade, 
  Trophy, 
  Wallet, 
  User, 
  Menu, 
  X,
  Gift,
  TrendingUp,
  Settings,
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { clsx } from 'clsx';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/lobbies', label: 'Lobbies', icon: LayoutGrid },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/leaderboard', label: 'Leaderboard', icon: TrendingUp },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
              <Spade className="w-6 h-6 text-background-primary" />
            </div>
            <span className="text-xl font-display font-bold text-gradient">
              CryptoPoker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
                    isActive
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Balance */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-background-tertiary border border-border-secondary">
                  <div className="w-5 h-5 rounded-full bg-gradient-accent" />
                  <span className="font-mono font-semibold text-accent-primary">
                    {Number(user.wallet?.balance || 0).toLocaleString()} PKC
                  </span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-background-hover transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                      <User className="w-4 h-4 text-background-primary" />
                    </div>
                    <span className="hidden sm:block font-medium">{user.username}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-background-card border border-border-primary shadow-lg overflow-hidden"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-background-hover transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/wallet"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-background-hover transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
                        Wallet
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-background-hover transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <div className="border-t border-border-primary" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-background-hover transition-colors text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button onClick={openConnectModal} className="btn btn-secondary text-sm">
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
                <Link href="/login" className="btn btn-primary text-sm">
                  Login
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-background-hover"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border-primary bg-background-secondary"
        >
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-secondary hover:bg-background-hover'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
