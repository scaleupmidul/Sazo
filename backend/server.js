
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import compression from 'compression';

import connectDB from './db.js';

import Product from './models/Product.js';
import Settings from './models/Settings.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import messageRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';
import statsRoutes from './routes/stats.js';

import { MOCK_PRODUCTS_DATA, DEFAULT_SETTINGS_DATA } from './data/seedData.js';

const app = express();

// Middlewares
app.use(cors());
// Gzip Compression: Reduces payload size by 70-80%, saving bandwidth and speeding up load times
app.use(compression());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// --- Database Connection Middleware ---
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
        // PERFORMANCE: Add Cache-Control header
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

        // PERFORMANCE: Use Promise.all to fetch Settings and Products in parallel
        // PERFORMANCE: Use .lean() to return plain JS objects instead of heavy Mongoose documents
        const [settings, products] = await Promise.all([
            Settings.findOne().select('-adminPassword').lean(),
            Product.find({ $or: [{ isNewArrival: true }, { isTrending: true }] })
                .sort({ displayOrder: 1, createdAt: -1 })
                .lean()
        ]);

        if (!settings) {
            return res.json({ settings: DEFAULT_SETTINGS_DATA, products: [] });
        }
        
        const transformId = (doc) => {
            if (!doc) return doc;
            const { _id, __v, ...rest } = doc;
            return { id: _id.toString(), ...rest };
        };

        const settingsObj = transformId(settings);
        
        // LITE MODE: Send only the first image for the listing page to save bandwidth
        const productsList = products.map(p => {
            const transformed = transformId(p);
            if (transformed.images && transformed.images.length > 1) {
                // Keep only the first image for the thumbnail
                transformed.images = [transformed.images[0]];
            }
            return transformed;
        });

        res.json({ settings: settingsObj, products: productsList });
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
app.use('/api/stats', statsRoutes);

export default app;
