import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid - redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email?: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { emailOrUsername: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getNonce: (address: string) =>
    api.get(`/auth/nonce?address=${address}`),
  walletLogin: (data: { message: string; signature: string }) =>
    api.post('/auth/wallet', data),
  me: () => api.get('/auth/me'),
  checkSession: () => api.get('/auth/session'),
};

// User API
export const userApi = {
  getProfile: (username: string) => api.get(`/users/profile/${username}`),
  getStats: () => api.get('/users/stats'),
  updateProfile: (data: { username?: string; avatar?: string }) =>
    api.patch('/users/profile', data),
  getLeaderboard: (period?: string) =>
    api.get(`/users/leaderboard${period ? `?period=${period}` : ''}`),
};

// Wallet API
export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (page = 1, limit = 20) =>
    api.get(`/wallet/transactions?page=${page}&limit=${limit}`),
  getDepositInfo: () => api.get('/wallet/deposit'),
  requestWithdraw: (data: { amount: string; toAddress: string }) =>
    api.post('/wallet/withdraw', data),
  getStats: () => api.get('/wallet/stats'),
  claimFaucet: () => api.post('/wallet/faucet'),
};

// Tables API
export const tablesApi = {
  getAll: (filters?: { type?: string; status?: string }) =>
    api.get('/tables', { params: filters }),
  getById: (id: string) => api.get(`/tables/${id}`),
  create: (data: any) => api.post('/tables', data),
  join: (id: string, data: { buyIn: number; seatNumber: number }) =>
    api.post(`/tables/${id}/join`, data),
  leave: (id: string) => api.post(`/tables/${id}/leave`),
};
