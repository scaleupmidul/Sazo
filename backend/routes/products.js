
import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch paginated products for admin
// @route   GET /api/products/admin
// @access  Private/Admin
router.get('/admin', protect, async (req, res) => {
    try {
        const pageSize = 10; // Number of products per page
        const page = Number(req.query.page) || 1;
        const searchTerm = req.query.search ? {
            name: {
                $regex: req.query.search,
                $options: 'i' // case-insensitive
            }
        } : {};

        const count = await Product.countDocuments({ ...searchTerm });
        const products = await Product.find({ ...searchTerm })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc    Fetch all products (Lite Version for Shop Page)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    // LITE MODE: We don't need 5 images per product for the shop list.
    // Fetching all fields but will filter images in memory before sending.
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    const liteProducts = products.map(p => {
        // Convert _id to id
        const { _id, __v, ...rest } = p;
        const product = { id: _id.toString(), ...rest };
        
        // Only send the first image
        if (product.images && product.images.length > 1) {
            product.images = [product.images[0]];
        }
        return product;
    });

    res.json(liteProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Fetch single product details
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
  try {
    // The incoming product data from the form won't have an ID
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Exclude the 'id' field from the request body if it exists
      const { id, ...updateData } = req.body;
      Object.assign(product, updateData);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
