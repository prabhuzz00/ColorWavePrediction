import {
  UserModel,
  BetModel,
  GameResultModel,
  RechargeModel,
  WithdrawalModel,
  TransactionModel,
  ChartDataModel,
  PeriodModel
} from './models';
import type {
  User,
  InsertUser,
  Bet,
  InsertBet,
  GameResult,
  Recharge,
  InsertRecharge,
  Withdrawal,
  InsertWithdrawal,
  Transaction,
  ChartData,
  Period
} from '@shared/schema';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(username: string, amount: number): Promise<void>;
  updateUserToken(username: string, token: string): Promise<void>;

  placeBet(bet: InsertBet): Promise<Bet>;
  getBetsByPeriod(period: number, gameType?: string): Promise<Bet[]>;
  getBetsByUser(username: string, limit?: number): Promise<Bet[]>;
  updateBetResult(id: string, result: string, price?: number): Promise<void>;

  getCurrentPeriod(gameType: string): Promise<Period | undefined>;
  updatePeriod(gameType: string, period: number, nxt?: number): Promise<void>;
  createGameResult(result: Omit<GameResult, 'id' | 'createdAt'>): Promise<GameResult>;
  getGameResults(gameType: string, limit?: number): Promise<GameResult[]>;

  createRecharge(recharge: InsertRecharge): Promise<Recharge>;
  getRechargesByUser(username: string, limit?: number): Promise<Recharge[]>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawalsByUser(username: string, limit?: number): Promise<Withdrawal[]>;
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  getTransactionsByUser(username: string, limit?: number): Promise<Transaction[]>;

  getChartData(gameType: string, limit?: number): Promise<ChartData[]>;
  addChartData(data: Omit<ChartData, 'id'>): Promise<ChartData>;

  getAllRecharges(): Promise<Recharge[]>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  getRechargeById(id: string): Promise<Recharge | undefined>;
  updateRechargeStatus(id: string, status: string): Promise<void>;
  updateWithdrawalStatus(id: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return (await UserModel.findById(id).lean()) as any;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return (await UserModel.findOne({ username }).lean()) as any;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const usercode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const doc = await UserModel.create({ ...insertUser, usercode });
    return doc.toJSON() as any;
  }

  async updateUserBalance(username: string, amount: number): Promise<void> {
    await UserModel.updateOne({ username }, { balance: amount });
  }

  async updateUserToken(username: string, token: string): Promise<void> {
    await UserModel.updateOne({ username }, { token });
  }

  async placeBet(bet: InsertBet): Promise<Bet> {
    const doc = await BetModel.create(bet);
    return doc.toJSON() as any;
  }

  async getBetsByPeriod(period: number, gameType = 'FastParity'): Promise<Bet[]> {
    return (await BetModel.find({ period, gameType }).sort({ createdAt: -1 }).lean()) as any;
  }

  async getBetsByUser(username: string, limit = 50): Promise<Bet[]> {
    return (await BetModel.find({ username }).sort({ createdAt: -1 }).limit(limit).lean()) as any;
  }

  async updateBetResult(id: string, result: string, price?: number): Promise<void> {
    const update: any = { result };
    if (price !== undefined) update.price = price;
    await BetModel.updateOne({ _id: id }, update);
  }

  async getCurrentPeriod(gameType: string): Promise<Period | undefined> {
    return (await PeriodModel.findOne({ gameType }).lean()) as any;
  }

  async updatePeriod(gameType: string, period: number, nxt = 11): Promise<void> {
    await PeriodModel.updateOne(
      { gameType },
      { period, nxt, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async createGameResult(result: Omit<GameResult, 'id' | 'createdAt'>): Promise<GameResult> {
    const doc = await GameResultModel.create(result);
    return doc.toJSON() as any;
  }

  async getGameResults(gameType: string, limit = 20): Promise<GameResult[]> {
    return (await GameResultModel.find({ gameType }).sort({ createdAt: -1 }).limit(limit).lean()) as any;
  }

  async createRecharge(recharge: InsertRecharge): Promise<Recharge> {
    const doc = await RechargeModel.create(recharge);
    return doc.toJSON() as any;
  }

  async getRechargesByUser(username: string, limit = 50): Promise<Recharge[]> {
    return (await RechargeModel.find({ username }).sort({ createdAt: -1 }).limit(limit).lean()) as any;
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const doc = await WithdrawalModel.create(withdrawal);
    return doc.toJSON() as any;
  }

  async getWithdrawalsByUser(username: string, limit = 50): Promise<Withdrawal[]> {
    return (await WithdrawalModel.find({ username }).sort({ createdAt: -1 }).limit(limit).lean()) as any;
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const doc = await TransactionModel.create(transaction);
    return doc.toJSON() as any;
  }

  async getTransactionsByUser(username: string, limit = 50): Promise<Transaction[]> {
    return (await TransactionModel.find({ username }).sort({ createdAt: -1 }).limit(limit).lean()) as any;
  }

  async getChartData(gameType: string, limit = 20): Promise<ChartData[]> {
    return (await ChartDataModel.find({ gameType }).sort({ timestamp: -1 }).limit(limit).lean()) as any;
  }

  async addChartData(data: Omit<ChartData, 'id'>): Promise<ChartData> {
    const doc = await ChartDataModel.create(data);
    return doc.toJSON() as any;
  }

  async getAllRecharges(): Promise<Recharge[]> {
    return (await RechargeModel.find().sort({ createdAt: -1 }).lean()) as any;
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return (await WithdrawalModel.find().sort({ createdAt: -1 }).lean()) as any;
  }

  async getRechargeById(id: string): Promise<Recharge | undefined> {
    return (await RechargeModel.findById(id).lean()) as any;
  }

  async updateRechargeStatus(id: string, status: string): Promise<void> {
    await RechargeModel.updateOne({ _id: id }, { status });
  }

  async updateWithdrawalStatus(id: string, status: string): Promise<void> {
    await WithdrawalModel.updateOne({ _id: id }, { status });
  }
}

export const storage = new DatabaseStorage();
