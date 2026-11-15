import mongoose from 'mongoose';
import { Logger } from '@robo/logger';

// @robo/db: Robtic Ticket's MongoDB (mongoose 8: mongoose 9's bson crashes on Bun 1.3). One connection per process.

export async function connectDatabase(uri: string): Promise<void> {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15_000 });
    Logger.database(`MongoDB connected (${mongoose.connection.name})`);
}

export const disconnectDatabase = () => mongoose.disconnect();

export { mongoose };

export * from './models';
export * from './repositories';
