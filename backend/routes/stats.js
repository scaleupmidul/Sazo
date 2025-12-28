
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// @desc    Get dashboard statistics (revenue, counts, recent items)
// @route   GET /api/stats
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        // Run light counting queries in parallel
        const [totalProducts, totalOrders, onlineTransactionsCount] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({ paymentMethod: 'Online' })
        ]);
        
        // Aggregate total revenue efficiently using database engine
        const revenueAgg = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // Fetch only specific fields for recent lists to reduce payload size
        const recentOrders = await Order.find()
            .select('orderId id customerName total status date createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentPayments = await Order.find({ paymentMethod: 'Online' })
            .select('orderId id customerName paymentDetails total date createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalProducts,
            totalOrders,
            totalRevenue,
            onlineTransactionsCount,
            recentOrders,
            recentPayments
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

export default router;
