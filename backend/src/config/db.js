import mongoose from 'mongoose';
import { env } from './env.js';
import '../../models/Admin.js';
import '../../models/Announcement.js';
import '../../models/Club.js';
import '../../models/ClubRequest.js';
import '../../models/Event.js';
import '../../models/EventRegistration.js';
import '../../models/Notification.js';
import '../../models/Post.js';
import '../../models/Report.js';
import '../../models/Student.js';

let connectionPromise;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri, {
        dbName: env.databaseName,
      })
      .then(async () => {
        await Promise.all(
          mongoose.modelNames().map((modelName) => mongoose.model(modelName).init())
        );

        console.log(`MongoDB connected to ${env.databaseName}`);
        return mongoose.connection.db;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}

export function getDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected');
  }

  return mongoose.connection.db;
}

export async function closeDatabaseConnection() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  connectionPromise = undefined;
}
