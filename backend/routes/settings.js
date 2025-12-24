import express from 'express';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if(settings) {
        // Create a temporary object, remove password, then send
        const settingsObj = settings.toObject();
        delete settingsObj.adminPassword;
        delete settingsObj._id;
        delete settingsObj.__v;
        res.json(settingsObj);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings) {
      const { adminPassword, ...updateData } = req.body;
      
      Object.assign(settings, updateData);

      // If a new password is provided, hash it before saving
      if (adminPassword) {
        const salt = await bcrypt.genSalt(10);
        settings.adminPassword = await bcrypt.hash(adminPassword, salt);
      }

      const updatedSettings = await settings.save();
      const settingsObj = updatedSettings.toObject();
      delete settingsObj.adminPassword;
      delete settingsObj._id;
      delete settingsObj.__v;
      res.json(settingsObj);
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating settings', error });
  }
});

export default router;
