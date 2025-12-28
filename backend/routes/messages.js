import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all messages
// @route   GET /api/messages
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create new message
// @route   POST /api/messages
// @access  Public
router.post('/', async (req, res) => {
  try {
    const newMessageData = {
        ...req.body,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
    };
    const message = new ContactMessage(newMessageData);
    await message.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error sending message', error });
  }
});

// @desc    Update message read status
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (message) {
      message.isRead = req.body.isRead;
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating message', error });
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (message) {
      await message.deleteOne();
      res.json({ message: 'Message removed' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
