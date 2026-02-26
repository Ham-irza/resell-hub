const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get ONLY the logged-in user's notifications (referrals and auto-sell completions)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Only fetch notifications related to referrals or auto-sell completions
    const notifications = await Notification.find({ 
      user: req.user.id,
      type: { $in: ['referral', 'autosell_complete'] }
    })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20);
      
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/mark-read
// @desc    Mark all notifications as read for the logged-in user (only referral and autosell_complete)
// @access  Private
router.put('/mark-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        user: req.user.id, 
        isRead: false,
        type: { $in: ['referral', 'autosell_complete'] }
      },
      { $set: { isRead: true } }
    );
    res.json({ msg: 'Notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
