'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Clock,
  TrendingUp,
  Shield,
  AlertCircle,
  ChevronDown,
  QrCode,
  Send,
  Download
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { clsx } from 'clsx';

type TabType = 'overview' | 'deposit' | 'withdraw' | 'history';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'WIN' | 'LOSS' | 'BONUS' | 'TOURNAMENT';
  amount: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: Date;
  txHash?: string;
  description?: string;
}

export default function WalletPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-poker flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const balance = parseFloat(user.wallet?.balance || '0');
  const lockedBalance = parseFloat(user.wallet?.lockedBalance || '0');
  const depositAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const transactions: Transaction[] = [
    { id: '1', type: 'WIN', amount: '1500', status: 'COMPLETED', createdAt: new Date(Date.now() - 1000 * 60 * 30), description: 'Cash Game Win' },
    { id: '2', type: 'DEPOSIT', amount: '10000', status: 'COMPLETED', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), txHash: '0x123...abc' },
    { id: '3', type: 'TOURNAMENT', amount: '-500', status: 'COMPLETED', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), description: 'Daily Freeroll Entry' },
    { id: '4', type: 'BONUS', amount: '300', status: 'COMPLETED', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), description: 'Daily Login Bonus' },
    { id: '5', type: 'WITHDRAW', amount: '-5000', status: 'PENDING', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), txHash: '0x456...def' },
    { id: '6', type: 'LOSS', amount: '-2000', status: 'COMPLETED', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), description: 'Cash Game' },
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownLeft className="w-5 h-5" />;
      case 'WITHDRAW': return <ArrowUpRight className="w-5 h-5" />;
      case 'WIN': return <TrendingUp className="w-5 h-5" />;
      case 'LOSS': return <TrendingUp className="w-5 h-5 rotate-180" />;
      case 'BONUS': return <Shield className="w-5 h-5" />;
      case 'TOURNAMENT': return <RefreshCw className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getTransactionColor = (type: string, amount: string) => {
    if (amount.startsWith('-')) return 'text-red-400';
    return 'text-accent-primary';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-accent-primary/10 text-accent-primary';
      case 'PENDING': return 'bg-accent-gold/10 text-accent-gold';
      case 'FAILED': return 'bg-red-500/10 text-red-400';
      default: return 'bg-text-muted/10 text-text-muted';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  return (
    <div className="min-h-screen bg-gradient-poker flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-display font-bold mb-2">
              <span className="text-gradient">Wallet</span>
            </h1>
            <p className="text-text-secondary">
              Manage your PKC tokens and transactions
            </p>
          </motion.div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 border-accent-primary/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-accent-primary" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Available Balance</p>
                  <p className="text-3xl font-bold text-accent-primary">{balance.toLocaleString()} PKC</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className="btn-primary btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Withdraw
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-gold" />
                </div>
                <p className="text-text-muted text-sm">Locked in Games</p>
              </div>
              <p className="text-2xl font-bold">{lockedBalance.toLocaleString()} PKC</p>
              <p className="text-text-muted text-sm mt-1">Currently at tables</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-text-muted text-sm">Total Balance</p>
              </div>
              <p className="text-2xl font-bold">{(balance + lockedBalance).toLocaleString()} PKC</p>
              <p className="text-text-muted text-sm mt-1">≈ ${((balance + lockedBalance) * 0.01).toFixed(2)} USD</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: Wallet },
              { id: 'deposit', label: 'Deposit', icon: Download },
              { id: 'withdraw', label: 'Withdraw', icon: Send },
              { id: 'history', label: 'History', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-accent-primary text-background-primary'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-hover'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Recent Transactions */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Recent Transactions</h2>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-accent-primary text-sm hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center gap-4 p-3 bg-background-tertiary rounded-xl">
                        <div className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          getTransactionColor(tx.type, tx.amount) === 'text-accent-primary' 
                            ? 'bg-accent-primary/10' 
                            : 'bg-red-500/10'
                        )}>
                          <span className={getTransactionColor(tx.type, tx.amount)}>
                            {getTransactionIcon(tx.type)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}</p>
                          <p className="text-text-muted text-sm">{tx.description || tx.txHash?.slice(0, 10) + '...'}</p>
                        </div>
                        <div className="text-right">
                          <p className={clsx('font-bold', getTransactionColor(tx.type, tx.amount))}>
                            {tx.amount.startsWith('-') ? tx.amount : `+${tx.amount}`} PKC
                          </p>
                          <p className="text-text-muted text-sm">{formatDate(tx.createdAt)}</p>
                        </div>
                        <span className={clsx('text-xs px-2 py-1 rounded', getStatusColor(tx.status))}>
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'deposit' && (
              <motion.div
                key="deposit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Download className="w-5 h-5 text-accent-primary" />
                  Deposit PKC
                </h2>

                <div className="bg-background-tertiary rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-background-primary" />
                    </div>
                  </div>
                  <p className="text-center text-text-muted text-sm mb-4">
                    Scan QR code or copy address below
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-background-primary rounded-lg">
                    <span className="font-mono text-sm text-text-secondary truncate flex-1">
                      {depositAddress}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-2 hover:bg-background-hover rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-accent-primary" />
                      ) : (
                        <Copy className="w-5 h-5 text-text-muted" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-gold">Important</p>
                    <p className="text-text-secondary text-sm">
                      Only send PKC tokens to this address. Sending other tokens may result in permanent loss.
                      Minimum deposit: 100 PKC. Deposits are credited after 12 confirmations.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'withdraw' && (
              <motion.div
                key="withdraw"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-accent-primary" />
                  Withdraw PKC
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="input pr-16"
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">PKC</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setWithdrawAmount(amount.toString())}
                          className="px-3 py-1 bg-background-tertiary rounded-lg text-sm hover:bg-background-hover transition-colors"
                        >
                          {amount}
                        </button>
                      ))}
                      <button
                        onClick={() => setWithdrawAmount(balance.toString())}
                        className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-lg text-sm hover:bg-accent-primary/20 transition-colors"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Destination Address</label>
                    <input
                      type="text"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      className="input"
                      placeholder="0x..."
                    />
                  </div>

                  <div className="bg-background-tertiary rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Available Balance</span>
                      <span>{balance.toLocaleString()} PKC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Network Fee</span>
                      <span>~10 PKC</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border-primary">
                      <span className="text-text-muted">You'll Receive</span>
                      <span className="font-bold text-accent-primary">
                        {Math.max(0, parseFloat(withdrawAmount || '0') - 10).toLocaleString()} PKC
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-primary w-full"
                    disabled={!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) > balance}
                  >
                    Withdraw PKC
                  </button>

                  <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-accent-gold">Withdrawal Info</p>
                      <p className="text-text-secondary text-sm">
                        Minimum withdrawal: 100 PKC. Processing time: 1-24 hours.
                        Make sure the destination address is correct.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-primary" />
                  Transaction History
                </h2>
                
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 p-4 bg-background-tertiary rounded-xl">
                      <div className={clsx(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        getTransactionColor(tx.type, tx.amount) === 'text-accent-primary' 
                          ? 'bg-accent-primary/10' 
                          : 'bg-red-500/10'
                      )}>
                        <span className={getTransactionColor(tx.type, tx.amount)}>
                          {getTransactionIcon(tx.type)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}</p>
                          <span className={clsx('text-xs px-2 py-0.5 rounded', getStatusColor(tx.status))}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-text-muted text-sm">{tx.description || 'Transaction'}</p>
                        {tx.txHash && (
                          <a
                            href={`https://etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-primary text-xs hover:underline flex items-center gap-1 mt-1"
                          >
                            {tx.txHash} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={clsx('text-lg font-bold', getTransactionColor(tx.type, tx.amount))}>
                          {tx.amount.startsWith('-') ? tx.amount : `+${tx.amount}`} PKC
                        </p>
                        <p className="text-text-muted text-sm">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button className="btn-secondary">
                    Load More
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
