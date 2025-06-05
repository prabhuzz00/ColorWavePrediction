import {
  users,
  bets,
  gameResults,
  recharges,
  withdrawals,
  transactions,
  chartData,
  periods,
  type User,
  type InsertUser,
  type Bet,
  type InsertBet,
  type GameResult,
  type Recharge,
  type InsertRecharge,
  type Withdrawal,
  type InsertWithdrawal,
  type Transaction,
  type ChartData,
  type Period,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(username: string, amount: number): Promise<void>;
  updateUserToken(username: string, token: string): Promise<void>;

  // Betting operations
  placeBet(bet: InsertBet): Promise<Bet>;
  getBetsByPeriod(period: number, gameType?: string): Promise<Bet[]>;
  getBetsByUser(username: string, limit?: number): Promise<Bet[]>;
  updateBetResult(id: number, result: string, price?: number): Promise<void>;

  // Game operations
  getCurrentPeriod(gameType: string): Promise<Period | undefined>;
  updatePeriod(gameType: string, period: number, nxt?: number): Promise<void>;
  createGameResult(result: Omit<GameResult, "id" | "createdAt">): Promise<GameResult>;
  getGameResults(gameType: string, limit?: number): Promise<GameResult[]>;

  // Financial operations
  createRecharge(recharge: InsertRecharge): Promise<Recharge>;
  getRechargesByUser(username: string, limit?: number): Promise<Recharge[]>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawalsByUser(username: string, limit?: number): Promise<Withdrawal[]>;
  createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction>;
  getTransactionsByUser(username: string, limit?: number): Promise<Transaction[]>;

  // Chart operations
  getChartData(gameType: string, limit?: number): Promise<ChartData[]>;
  addChartData(data: Omit<ChartData, "id">): Promise<ChartData>;

  // Admin operations
  getAllRecharges(): Promise<Recharge[]>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  getRechargeById(id: number): Promise<Recharge | undefined>;
  updateRechargeStatus(id: number, status: string): Promise<void>;
  updateWithdrawalStatus(id: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Generate usercode
    const usercode = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, usercode })
      .returning();
    return user;
  }

  async updateUserBalance(username: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ balance: amount })
      .where(eq(users.username, username));
  }

  async updateUserToken(username: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ token })
      .where(eq(users.username, username));
  }

  // Betting operations
  async placeBet(bet: InsertBet): Promise<Bet> {
    const [newBet] = await db.insert(bets).values(bet).returning();
    return newBet;
  }

  async getBetsByPeriod(period: number, gameType = "FastParity"): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(and(eq(bets.period, period), eq(bets.gameType, gameType)))
      .orderBy(desc(bets.createdAt));
  }

  async getBetsByUser(username: string, limit = 50): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(eq(bets.username, username))
      .orderBy(desc(bets.createdAt))
      .limit(limit);
  }

  async updateBetResult(id: number, result: string, price?: number): Promise<void> {
    const updateData: any = { result };
    if (price !== undefined) {
      updateData.price = price;
    }
    
    await db.update(bets).set(updateData).where(eq(bets.id, id));
  }

  // Game operations
  async getCurrentPeriod(gameType: string): Promise<Period | undefined> {
    const [period] = await db
      .select()
      .from(periods)
      .where(eq(periods.gameType, gameType));
    return period || undefined;
  }

  async updatePeriod(gameType: string, period: number, nxt = 11): Promise<void> {
    const existing = await this.getCurrentPeriod(gameType);
    
    if (existing) {
      await db
        .update(periods)
        .set({ period, nxt, updatedAt: new Date() })
        .where(eq(periods.gameType, gameType));
    } else {
      await db.insert(periods).values({ gameType, period, nxt });
    }
  }

  async createGameResult(result: Omit<GameResult, "id" | "createdAt">): Promise<GameResult> {
    const [newResult] = await db.insert(gameResults).values(result).returning();
    return newResult;
  }

  async getGameResults(gameType: string, limit = 20): Promise<GameResult[]> {
    return db
      .select()
      .from(gameResults)
      .where(eq(gameResults.gameType, gameType))
      .orderBy(desc(gameResults.createdAt))
      .limit(limit);
  }

  // Financial operations
  async createRecharge(recharge: InsertRecharge): Promise<Recharge> {
    const [newRecharge] = await db.insert(recharges).values(recharge).returning();
    return newRecharge;
  }

  async getRechargesByUser(username: string, limit = 50): Promise<Recharge[]> {
    return db
      .select()
      .from(recharges)
      .where(eq(recharges.username, username))
      .orderBy(desc(recharges.createdAt))
      .limit(limit);
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db.insert(withdrawals).values(withdrawal).returning();
    return newWithdrawal;
  }

  async getWithdrawalsByUser(username: string, limit = 50): Promise<Withdrawal[]> {
    return db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.username, username))
      .orderBy(desc(withdrawals.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionsByUser(username: string, limit = 50): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.username, username))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Chart operations
  async getChartData(gameType: string, limit = 20): Promise<ChartData[]> {
    return db
      .select()
      .from(chartData)
      .where(eq(chartData.gameType, gameType))
      .orderBy(desc(chartData.timestamp))
      .limit(limit);
  }

  async addChartData(data: Omit<ChartData, "id">): Promise<ChartData> {
    const [newData] = await db.insert(chartData).values(data).returning();
    return newData;
  }

  // Admin operations
  async getAllRecharges(): Promise<Recharge[]> {
    return await db.select().from(recharges).orderBy(desc(recharges.createdAt));
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
  }

  async getRechargeById(id: number): Promise<Recharge | undefined> {
    const [recharge] = await db.select().from(recharges).where(eq(recharges.id, id));
    return recharge;
  }

  async updateRechargeStatus(id: number, status: string): Promise<void> {
    await db.update(recharges)
      .set({ status })
      .where(eq(recharges.id, id));
  }

  async updateWithdrawalStatus(id: number, status: string): Promise<void> {
    await db.update(withdrawals)
      .set({ status })
      .where(eq(withdrawals.id, id));
  }
}

export const storage = new DatabaseStorage();
