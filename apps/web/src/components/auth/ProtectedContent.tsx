'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { Lock, LogIn, UserPlus, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ProtectedContentProps {
  children: ReactNode;
  title?: string;
  description?: string;
  features?: string[];
}

export function ProtectedContent({ 
  children, 
  title = 'Login Required',
  description = 'Sign in to access this feature and unlock exclusive benefits.',
  features = []
}: ProtectedContentProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] text-center px-4"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center mb-6">
        <Lock className="w-12 h-12 text-accent-primary" />
      </div>
      
      <h2 className="text-3xl font-display font-bold mb-3">
        <span className="text-gradient">{title}</span>
      </h2>
      
      <p className="text-text-secondary max-w-md mb-8">
        {description}
      </p>

      {features.length > 0 && (
        <div className="grid gap-3 mb-8 max-w-sm w-full">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-background-secondary/50 rounded-lg px-4 py-3 text-left"
            >
              <Sparkles className="w-5 h-5 text-accent-gold flex-shrink-0" />
              <span className="text-text-primary text-sm">{feature}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/login" className="btn-primary flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Sign In
        </Link>
        <Link href="/register" className="btn-secondary flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Create Account
        </Link>
      </div>
    </motion.div>
  );
}
