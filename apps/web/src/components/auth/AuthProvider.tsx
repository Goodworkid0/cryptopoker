'use client';

import { useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email?: string;
  walletAddress?: string;
  avatar?: string;
  level: number;
  experience: number;
  vipTier: string;
  wallet?: {
    balance: string;
    lockedBalance: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

// Protected routes that require authentication (will redirect to login)
const protectedRoutes = ['/profile', '/wallet', '/settings', '/table'];
// Auth routes that should redirect to /lobbies if already authenticated
const authRoutes = ['/login', '/register'];
// Routes with guest views (no redirect, shows guest preview instead)
// '/lobbies', '/tournaments', '/rewards', '/leaderboard' - handled by page components

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check session on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
      // Redirect to login if trying to access protected route without auth
      router.push('/login');
    } else if (isAuthRoute && isAuthenticated) {
      // Redirect to lobbies if already authenticated and trying to access auth routes
      router.push('/lobbies');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
