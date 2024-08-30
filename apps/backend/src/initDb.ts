
import { connectToDatabase } from '@myorg/db';

export const initializeDatabase = async () => {
    try {
        await connectToDatabase('mongodb://localhost:27017/testChess');
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit process with failure
    }
};
