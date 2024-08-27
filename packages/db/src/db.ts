import mongoose from 'mongoose';

const connectToDatabase = async (uri: string) => {
  try {
    
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectToDatabase;