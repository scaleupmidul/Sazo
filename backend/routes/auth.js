import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Settings from '../models/Settings.js';
import 'dotenv/config';

const router = express.Router();

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const settings = await Settings.findOne();
    if (!settings) {
        return res.status(404).json({ message: 'Admin account not configured' });
    }

    if (email.toLowerCase() === settings.adminEmail.toLowerCase() && (await bcrypt.compare(password, settings.adminPassword))) {
      res.json({
        token: jwt.sign({ id: settings._id }, process.env.JWT_SECRET, { expiresIn: '1d' }),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
