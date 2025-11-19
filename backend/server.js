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

// --- Database Connection & Seeding Middleware ---
let isSeedingComplete = false;
const initializeDatabase = async () => {
    if (isSeedingComplete) return;

    try {
        // Seed Settings
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            console.log('No settings found, seeding...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(DEFAULT_SETTINGS_DATA.adminPassword, salt);
            await Settings.create({ ...DEFAULT_SETTINGS_DATA, adminPassword: hashedPassword });
            console.log('Default settings seeded.');
        }

        // Seed Products
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log('No products found, seeding...');
            // Remove frontend-specific ID before inserting
            const productsToSeed = MOCK_PRODUCTS_DATA.map(({ id, ...rest }) => rest);
            await Product.insertMany(productsToSeed);
            console.log('Mock products seeded.');
        }
        
        isSeedingComplete = true; // Mark seeding as complete for this instance
    } catch (error) {
        console.error('Error during database initialization:', error);
        // We throw the error to be caught by the middleware handler
        throw new Error('Database initialization failed.');
    }
};

const dbConnectionMiddleware = async (req, res, next) => {
    try {
        await connectDB();
        await initializeDatabase();
        next();
    } catch (error) {
        console.error("Database connection or seeding failed:", error);
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
            return res.status(404).json({ message: 'Settings not found' });
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