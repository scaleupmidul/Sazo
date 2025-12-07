import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './db.js';

import Product from './models/Product.js';
import Settings from './models/Settings.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import messageRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';

import { MOCK_PRODUCTS_DATA, DEFAULT_SETTINGS_DATA } from './data/seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// --- Performance Optimization ---
// Enable Gzip compression for all responses
app.use(compression());

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Database Connection & Seeding ---
let isSeedingComplete = false;
const initializeDatabase = async () => {
    if (isSeedingComplete) return;

    try {
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            console.log('No settings found, seeding...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(DEFAULT_SETTINGS_DATA.adminPassword, salt);
            await Settings.create({ ...DEFAULT_SETTINGS_DATA, adminPassword: hashedPassword });
        }

        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log('No products found, seeding...');
            const productsToSeed = MOCK_PRODUCTS_DATA.map(({ id, ...rest }) => rest);
            await Product.insertMany(productsToSeed);
        }
        
        isSeedingComplete = true;
    } catch (error) {
        console.error('Error during database initialization:', error);
    }
};

const dbConnectionMiddleware = async (req, res, next) => {
    try {
        await connectDB();
        await initializeDatabase();
        next();
    } catch (error) {
        console.error("Database error:", error);
        res.status(503).json({ message: "Service Unavailable" });
    }
};

// --- API Routes ---
app.use('/api', dbConnectionMiddleware);

app.get('/api/page-data/home', async (req, res) => {
    try {
        const settings = await Settings.findOne().select('-adminPassword');
        
        // OPTIMIZATION: Only fetch the first image for the cards to reduce payload size.
        // We use projection { images: { $slice: 1 } } which returns the doc with only the first image.
        const products = await Product.find(
            { $or: [{ isNewArrival: true }, { isTrending: true }] },
            { images: { $slice: 1 } }
        ).sort({ displayOrder: 1, createdAt: -1 });

        if (!settings) return res.status(404).json({ message: 'Settings not found' });
        
        const settingsObj = settings.toObject();
        delete settingsObj._id;
        delete settingsObj.__v;

        res.json({ settings: settingsObj, products });
    } catch (error) {
        console.error("Home data error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);

// --- Serve Static Frontend (Production) ---
const distPath = path.join(__dirname, '../dist');

// Serve static files with aggressive caching (1 year) to improve speed index
app.use(express.static(distPath, { 
    maxAge: '1y',
    etag: false
}));

// Handle React Routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await connectDB();
        await initializeDatabase();
        console.log("Database initialized on startup.");
    } catch (e) {
        console.error("Startup DB connection failed:", e);
    }
});

export default app;
