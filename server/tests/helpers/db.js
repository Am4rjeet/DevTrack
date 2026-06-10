import mongoose from 'mongoose';

const connectTestDB = async () => {
  if (mongoose.connection.readyState === 1) return true;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    return true;
  } catch {
    return false;
  }
};

const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export { connectTestDB, disconnectTestDB };
