import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be set.');
}

export function connectDB() {
  return mongoose.connect(process.env.MONGODB_URI as string);
}
