export interface User {
  id: number;
  username: string;
  balance: number;
  bonus: number;
  usercode: string;
}

export interface GameInfo {
  balance: number;
  period: number;
  total1: number;
  rech: number;
  trans: number;
}

export interface ChartDataPoint {
  period: number;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface GameResult {
  id: number;
  period: number;
  ans: number;
  num: number;
  color: string;
  color2?: string;
  gameType: string;
  createdAt: string;
}

export interface Bet {
  id: number;
  username: string;
  period: number;
  amount: number;
  ans: string;
  status: string;
  result?: string;
  price?: number;
  number?: number;
  color?: string;
  gameType: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  username: string;
  reason: string;
  amount: number;
  type: string;
  createdAt: string;
}

export interface Recharge {
  id: number;
  username: string;
  amount: number;
  status: string;
  upi?: string;
  utr?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: number;
  username: string;
  amount: number;
  status: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  createdAt: string;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  bet?: any;
}

export interface PeriodInfo {
  current: number;
  next: number;
  countdown: number;
  bettingActive: boolean;
}
