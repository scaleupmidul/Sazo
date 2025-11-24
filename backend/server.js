import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

import connectDB from './db.js';

import Product from './models/Product.js';
import Settings from './models/Settings.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import messageRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';

import { MOCK_PRODUCTS_DATA, DEFAULT_SETTINGS_DATA } from './data/seedData.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// --- Database Connection Middleware ---
// Note: We removed the automatic seeding check (initializeDatabase) from the request path
// because it causes significant delay (6-7s) on cold starts by performing extra DB queries.
// Seeding should be done manually or via a separate script if needed.

const dbConnectionMiddleware = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(503).json({ message: "Service Unavailable: Could not connect to the database." });
    }
};

// Apply middleware to all API routes
app.use('/api', dbConnectionMiddleware);

// --- New Homepage Data Route ---
app.get('/api/page-data/home', async (req, res) => {
    try {
        // Fetch settings but exclude sensitive admin password
        const settings = await Settings.findOne().select('-adminPassword');
        // Fetch only products marked as new arrival or trending
        // Sort by displayOrder (ascending) then createdAt (descending)
        const products = await Product.find({ $or: [{ isNewArrival: true }, { isTrending: true }] })
            .sort({ displayOrder: 1, createdAt: -1 });

        if (!settings) {
            // Fallback if settings are missing (rare case if DB is empty)
            return res.json({ settings: DEFAULT_SETTINGS_DATA, products: [] });
        }
        
        const settingsObj = settings.toObject();
        delete settingsObj._id;
        delete settingsObj.__v;

        res.json({ settings: settingsObj, products });
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        res.status(500).json({ message: 'Server Error fetching homepage data' });
    }
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);

// The app.listen() is removed for Vercel deployment.
// Vercel handles starting the server in a serverless environment.
export default app;
