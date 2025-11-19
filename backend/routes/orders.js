
import express from 'express';
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get single order by ID (supports Mongo _id or custom orderId)
// @route   GET /api/orders/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let order;
    // If ID is 5-7 digits, assume it's the numeric orderId
    if (/^\d{5,7}$/.test(req.params.id)) {
        order = await Order.findOne({ orderId: req.params.id });
    } else {
        // Otherwise try standard Mongo ID
        order = await Order.findById(req.params.id);
    }
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    // This catches invalid ObjectId formats and other potential errors
    res.status(404).json({ message: 'Order not found' });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { customerDetails, cartItems, total, paymentInfo } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    // Generate a unique 5-7 digit numeric Order ID
    let uniqueId;
    let isUnique = false;
    // Retry loop to ensure uniqueness (collision very unlikely but safe to have)
    while (!isUnique) {
        // Generate random number between 10000 and 9999999
        uniqueId = Math.floor(10000 + Math.random() * 9989999).toString();
        const existing = await Order.findOne({ orderId: uniqueId });
        if (!existing) {
            isUnique = true;
        }
    }

    const newOrderData = {
        orderId: uniqueId,
        customerName: customerDetails?.name,
        phone: customerDetails?.phone,
        address: customerDetails?.address,
        city: customerDetails?.city || '', // Default to empty string if missing
        cartItems: cartItems,
        total: total,
        paymentMethod: paymentInfo?.paymentMethod,
        paymentDetails: paymentInfo?.paymentDetails,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
    };
    const order = new Order(newOrderData);
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ 
        message: 'Error creating order. Please check your information.', 
        error: error.message 
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
  try {
    // Use findById because Admin operations use the system ID from the list
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating order status', error });
  }
});

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
