import { create } from 'zustand';
import { authApi } from './api';

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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },
  
  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
    
  setLoading: (loading) => set({ isLoading: loading }),
  
  checkAuth: async () => {
    try {
      const { data } = await authApi.checkSession();
      if (data.authenticated && data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

interface GameState {
  currentTable: string | null;
  isPlaying: boolean;
  setCurrentTable: (tableId: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentTable: null,
  isPlaying: false,
  setCurrentTable: (tableId) => set({ currentTable: tableId }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
