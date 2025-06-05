import mongoose, { Schema } from 'mongoose';

const baseOptions = {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: any) => { ret.id = ret._id.toString(); delete ret._id; }
  }
};

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobile: String,
  balance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  usercode: { type: String, unique: true },
  refcode: String,
  refcode1: String,
  refcode2: String,
  status: { type: Boolean, default: false },
  token: String,
  ip: String
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, ...baseOptions });

const PeriodSchema = new Schema({
  gameType: { type: String, required: true },
  period: { type: Number, required: true },
  nxt: { type: Number, default: 11 },
  updatedAt: { type: Date, default: Date.now }
}, baseOptions);

const BetSchema = new Schema({
  username: { type: String, required: true },
  period: { type: Number, required: true },
  amount: { type: Number, required: true },
  ans: { type: String, required: true },
  status: { type: String, default: 'pending' },
  result: String,
  price: Number,
  number: Number,
  color: String,
  color2: String,
  gameType: { type: String, default: 'FastParity' }
}, { timestamps: { createdAt: 'createdAt' }, ...baseOptions });

const GameResultSchema = new Schema({
  period: { type: Number, required: true },
  ans: { type: Number, required: true },
  num: { type: Number, required: true },
  color: { type: String, required: true },
  color2: String,
  gameType: { type: String, default: 'FastParity' }
}, { timestamps: { createdAt: 'createdAt' }, ...baseOptions });

const RechargeSchema = new Schema({
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  upi: String,
  utr: String,
  rand: String
}, { timestamps: { createdAt: 'createdAt' }, ...baseOptions });

const WithdrawalSchema = new Schema({
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  accountNumber: String,
  ifscCode: String,
  accountHolder: String
}, { timestamps: { createdAt: 'createdAt' }, ...baseOptions });

const TransactionSchema = new Schema({
  username: { type: String, required: true },
  reason: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true }
}, { timestamps: { createdAt: 'createdAt' }, ...baseOptions });

const ChartDataSchema = new Schema({
  period: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  gameType: { type: String, default: 'FastParity' }
}, baseOptions);

export const UserModel = mongoose.model('User', UserSchema);
export const PeriodModel = mongoose.model('Period', PeriodSchema);
export const BetModel = mongoose.model('Bet', BetSchema);
export const GameResultModel = mongoose.model('GameResult', GameResultSchema);
export const RechargeModel = mongoose.model('Recharge', RechargeSchema);
export const WithdrawalModel = mongoose.model('Withdrawal', WithdrawalSchema);
export const TransactionModel = mongoose.model('Transaction', TransactionSchema);
export const ChartDataModel = mongoose.model('ChartData', ChartDataSchema);
