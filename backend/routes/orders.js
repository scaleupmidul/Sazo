
import express from 'express';
import nodemailer from 'nodemailer';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const sendOrderEmailToAdmin = async (order) => {
  const systemEmail = process.env.GMAIL_USER;
  const systemPass = process.env.GMAIL_PASS;
  if (!systemEmail || !systemPass) return false;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: systemEmail, pass: systemPass },
    pool: true
  });

  const productsSubtotal = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCharge = order.shippingCharge || 0;
  const grandTotal = order.total;

  const itemsHtml = order.cartItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;"><img src="${item.image}" width="50" style="border-radius: 4px;" /></td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
        <div style="font-size: 12px; color: #666;">Size: ${item.size} | Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">৳${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`).join('');

  const mailOptions = {
    from: `"SAZO | Order Desk" <${systemEmail}>`,
    to: systemEmail,
    subject: `🎉🎉🎉 New Order #${order.orderId}`,
    priority: 'high',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background: #db2777; padding: 20px; color: white; text-align: center;">
        <h1 style="margin:0;">New Order!</h1>
        <p style="margin:5px 0 0 0; opacity: 0.8;">ID: #${order.orderId}</p>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #db2777; border-bottom: 1px solid #eee; padding-bottom: 10px;">Customer Details</h3>
        <p style="line-height: 1.6;">
            <strong>Name:</strong> ${order.firstName}<br>
            <strong>Phone:</strong> ${order.phone}<br>
            <strong>Address:</strong> ${order.address}<br>
            <strong>City/District:</strong> ${order.city || 'N/A'}<br>
            <strong>Payment:</strong> ${order.paymentMethod === 'Online' ? 'Online Advance' : 'COD'}<br>
            ${order.note ? `<strong>Note:</strong> <i style="color: #666;">${order.note}</i>` : ''}
        </p>
        
        <h3 style="color: #db2777; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Order Items</h3>
        <table width="100%" cellspacing="0" cellpadding="0">${itemsHtml}</table>
        
        <div style="text-align: right; padding: 20px; background: #fdf2f8; margin-top: 20px; border-radius: 8px;">
          <div style="margin-bottom: 5px; color: #666; font-size: 14px;">
            Subtotal: ৳${productsSubtotal.toLocaleString()}
          </div>
          <div style="margin-bottom: 10px; color: #666; font-size: 14px;">
            Delivery Charge: ৳${shippingCharge.toLocaleString()}
          </div>
          <div style="font-size: 18px; font-weight: bold; color: #db2777; border-top: 1px solid #f9a8d4; pt: 10px; margin-top: 5px;">
            Total Payable: ৳${grandTotal.toLocaleString()}
          </div>
        </div>
      </div>
      <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #999; font-size: 12px;">
        SAZO Admin Portal &copy; 2026
      </div>
    </div>`
  };
  try { await transporter.sendMail(mailOptions); return true; } catch (e) { return false; }
};

// @desc    Get dashboard stats (Now with Real Unique Customer Count)
router.get('/stats', protect, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const onlineTransactions = await Order.countDocuments({ paymentMethod: 'Online' });
        const totalProducts = await Product.countDocuments();
        const outOfStockCount = await Product.countDocuments({ isOutOfStock: true });

        // Functional: Unique Customer Count based on Phone numbers
        const uniqueCustomers = await Order.distinct('phone');
        const customerCount = uniqueCustomers.length;

        // Aggregate for Category-wise Revenue
        const categoryResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$cartItems' },
            { $lookup: {
                from: 'products',
                let: { pId: '$cartItems.id' },
                pipeline: [
                    { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$pId"] } } },
                    { $project: { category: 1 } }
                ],
                as: 'productInfo'
            }},
            { $addFields: { 
                itemCategory: { $ifNull: [{ $arrayElemAt: ["$productInfo.category", 0] }, "Other"] } 
            }},
            { $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ['$cartItems.price', '$cartItems.quantity'] } },
                cosmeticsRevenue: { $sum: { $cond: [{ $eq: ["$itemCategory", "Cosmetics"] }, { $multiply: ['$cartItems.price', '$cartItems.quantity'] }, 0] } },
                fashionRevenue: { $sum: { $cond: [{ $ne: ["$itemCategory", "Cosmetics"] }, { $multiply: ['$cartItems.price', '$cartItems.quantity'] }, 0] } }
            }}
        ]);

        const cosmeticsOrders = await Order.countDocuments({ 'cartItems.name': { $regex: /cosmetic|beauty|serum|lip/i } });
        
        const stats = categoryResult[0] || { totalRevenue: 0, cosmeticsRevenue: 0, fashionRevenue: 0 };

        res.json({ 
            totalOrders, 
            onlineTransactions, 
            totalRevenue: stats.totalRevenue, 
            totalProducts,
            outOfStockCount,
            fashionRevenue: stats.fashionRevenue,
            cosmeticsRevenue: stats.cosmeticsRevenue,
            fashionOrders: totalOrders - cosmeticsOrders,
            cosmeticsOrders: cosmeticsOrders,
            customerCount: customerCount // Now sending real unique count
        });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Server Error' }); 
    }
});

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    let order;
    if (/^\d{5,7}$/.test(req.params.id)) { order = await Order.findOne({ orderId: req.params.id }); }
    else { order = await Order.findById(req.params.id); }
    if (order) res.json(order);
    else res.status(404).json({ message: 'Order not found' });
  } catch (error) { res.status(404).json({ message: 'Order not found' }); }
});

router.post('/', async (req, res) => {
  try {
    const { customerDetails, cartItems, total, paymentInfo, shippingCharge } = req.body;
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    let uniqueId;
    let isUnique = false;
    while (!isUnique) {
        uniqueId = Math.floor(10000 + Math.random() * 9989999).toString();
        const existing = await Order.findOne({ orderId: uniqueId });
        if (!existing) isUnique = true;
    }
    const order = new Order({
        orderId: uniqueId,
        firstName: customerDetails?.firstName,
        lastName: customerDetails?.lastName,
        email: customerDetails?.email,
        phone: customerDetails?.phone,
        address: customerDetails?.address,
        city: customerDetails?.city || '',
        note: customerDetails?.note || '',
        cartItems,
        total,
        shippingCharge,
        paymentMethod: paymentInfo?.paymentMethod,
        paymentDetails: paymentInfo?.paymentDetails,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
    });
    const createdOrder = await order.save();
    await sendOrderEmailToAdmin(createdOrder).catch(e => console.log("Silent email error:", e.message));
    res.status(201).json(createdOrder);
  } catch (error) { res.status(400).json({ message: 'Error creating order', error: error.message }); }
});

router.put('/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else { res.status(404).json({ message: 'Order not found' }); }
  } catch (error) { res.status(400).json({ message: 'Error updating order status' }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) { await order.deleteOne(); res.json({ message: 'Order removed' }); }
    else { res.status(404).json({ message: 'Order not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

export default router;
