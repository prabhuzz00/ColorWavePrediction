import { apiRequest } from "./queryClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  mobile: string;
}

export interface BetRequest {
  username: string;
  period: number;
  amount: number;
  direction: 'up' | 'down';
  gameType?: string;
}

export interface RechargeRequest {
  username: string;
  amount: number;
  upi: string;
  utr: string;
}

export interface WithdrawalRequest {
  username: string;
  amount: number;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
}

export const api = {
  // Auth
  login: async (data: LoginRequest) => {
    const response = await apiRequest('POST', '/api/auth/login', data);
    return response.json();
  },

  register: async (data: RegisterRequest) => {
    const response = await apiRequest('POST', '/api/auth/register', data);
    return response.json();
  },

  // Game
  getGameInfo: async (username: string, gameType: string = 'FastParity') => {
    const response = await apiRequest('GET', `/api/game/info?user=${username}&per=${gameType}`);
    return response.json();
  },

  placeBet: async (data: BetRequest) => {
    const response = await apiRequest('POST', '/api/game/bet', data);
    return response.json();
  },

  getGameResults: async (gameType: string = 'FastParity', limit: number = 20) => {
    const response = await apiRequest('GET', `/api/game/results?gameType=${gameType}&limit=${limit}`);
    return response.json();
  },

  getChartData: async (gameType: string = 'FastParity', limit: number = 720) => {
    const response = await apiRequest('GET', `/api/game/chart?gameType=${gameType}&limit=${limit}`);
    return response.json();
  },

  // Financial
  recharge: async (data: RechargeRequest) => {
    const response = await apiRequest('POST', '/api/recharge', data);
    return response.json();
  },

  withdraw: async (data: WithdrawalRequest) => {
    const response = await apiRequest('POST', '/api/withdraw', data);
    return response.json();
  },

  // History
  getRechargeHistory: async (username: string, limit: number = 50) => {
    const response = await apiRequest('GET', `/api/recharge/history/${username}?limit=${limit}`);
    return response.json();
  },

  getWithdrawalHistory: async (username: string, limit: number = 50) => {
    const response = await apiRequest('GET', `/api/withdraw/history/${username}?limit=${limit}`);
    return response.json();
  },

  getTransactionHistory: async (username: string, limit: number = 50) => {
    const response = await apiRequest('GET', `/api/transactions/${username}?limit=${limit}`);
    return response.json();
  },

  getBetHistory: async (username: string, limit: number = 50) => {
    const response = await apiRequest('GET', `/api/bets/${username}?limit=${limit}`);
    return response.json();
  },
};
