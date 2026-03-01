import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import connectMongo from './config/mongo.js';

// Import Routes
import reportRoutes from './routes/reportRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- REGISTER ROUTES ---
// This connects the prefix '/api/reports' to the routes defined in reportRoutes.ts
app.use('/api/reports', reportRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('✅ Server is running and API is ready!');
});

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('🛢️  Connected to PostgreSQL via Prisma!');
        await connectMongo();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();