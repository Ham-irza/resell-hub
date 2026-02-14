const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get ONLY the logged-in user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // 🔒 SECURITY CHECK:
    // We filter by "user: req.user.id". 
    // "req.user.id" comes from the JWT Token, which cannot be faked.
    // This guarantees User A only sees User A's data.
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20);
      
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/mark-read
// @desc    Mark all notifications as read for the logged-in user
// @access  Private
router.put('/mark-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false }, // Filter: Only my unread ones
      { $set: { isRead: true } }            // Action: Mark read
    );
    res.json({ msg: 'Notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;