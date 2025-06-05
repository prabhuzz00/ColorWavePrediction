import { pgTable, text, serial, integer, boolean, timestamp, varchar, real, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 15 }),
  balance: real("balance").default(0),
  bonus: real("bonus").default(0),
  usercode: varchar("usercode", { length: 20 }).unique(),
  refcode: varchar("refcode", { length: 20 }),
  refcode1: varchar("refcode1", { length: 20 }),
  refcode2: varchar("refcode2", { length: 20 }),
  status: boolean("status").default(false),
  token: varchar("token", { length: 64 }),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Current periods for different games
export const periods = pgTable("periods", {
  id: serial("id").primaryKey(),
  gameType: varchar("game_type", { length: 20 }).notNull(),
  period: integer("period").notNull(),
  nxt: integer("nxt").default(11),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Betting records
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  period: integer("period").notNull(),
  amount: real("amount").notNull(),
  ans: varchar("ans", { length: 10 }).notNull(), // 'red', 'green', or number
  status: varchar("status", { length: 20 }).default("pending"),
  result: varchar("result", { length: 10 }),
  price: real("price"),
  number: integer("number"),
  color: varchar("color", { length: 10 }),
  color2: varchar("color2", { length: 10 }),
  gameType: varchar("game_type", { length: 20 }).default("FastParity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Game results
export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  period: integer("period").notNull(),
  ans: integer("ans").notNull(),
  num: real("num").notNull(),
  color: varchar("color", { length: 10 }).notNull(),
  color2: varchar("color2", { length: 10 }),
  gameType: varchar("game_type", { length: 20 }).default("FastParity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recharge records
export const recharges = pgTable("recharges", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  amount: real("amount").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  upi: varchar("upi", { length: 100 }),
  utr: varchar("utr", { length: 50 }),
  rand: varchar("rand", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawal records
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  amount: real("amount").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  accountNumber: varchar("account_number", { length: 20 }),
  ifscCode: varchar("ifsc_code", { length: 15 }),
  accountHolder: varchar("account_holder", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaction history
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  amount: real("amount").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'add' or 'subtract'
  createdAt: timestamp("created_at").defaultNow(),
});

// Chart data for candlestick simulation
export const chartData = pgTable("chart_data", {
  id: serial("id").primaryKey(),
  period: integer("period").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  gameType: varchar("game_type", { length: 20 }).default("FastParity"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  mobile: true,
});

export const insertBetSchema = createInsertSchema(bets).pick({
  username: true,
  period: true,
  amount: true,
  ans: true,
  gameType: true,
});

export const insertRechargeSchema = createInsertSchema(recharges).pick({
  username: true,
  amount: true,
  upi: true,
  utr: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).pick({
  username: true,
  amount: true,
  accountNumber: true,
  ifscCode: true,
  accountHolder: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type GameResult = typeof gameResults.$inferSelect;
export type Recharge = typeof recharges.$inferSelect;
export type InsertRecharge = z.infer<typeof insertRechargeSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type ChartData = typeof chartData.$inferSelect;
export type Period = typeof periods.$inferSelect;
