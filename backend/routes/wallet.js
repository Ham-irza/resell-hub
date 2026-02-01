const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendWithdrawalRequestEmail } = require('../utils/emailService'); // <--- ADDED EMAIL IMPORT

// @route   GET api/wallet/history
// @desc    Get all transactions for the logged-in user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/wallet/withdraw
// @desc    Submit a withdrawal request
// @access  Private
router.post('/withdraw', auth, async (req, res) => {
  const { amount, bankName, accountNumber, accountTitle } = req.body;

  try {
    // 1. Get User to check balance
    const user = await User.findById(req.user.id);

    // 2. Validation
    if (amount < 1000) {
      return res.status(400).json({ msg: 'Minimum withdrawal is PKR 1,000' });
    }
    if (user.walletBalance < amount) {
      return res.status(400).json({ msg: 'Insufficient wallet balance' });
    }

    // 3. Deduct Balance IMMEDIATELY (Prevent double-spending)
    user.walletBalance -= amount;
    await user.save();

    // 4. Create Transaction Record
    const newTx = new Transaction({
      user: req.user.id,
      type: 'withdrawal',
      amount: amount,
      status: 'pending', // Waiting for Admin
      bankDetails: {
        bankName,
        accountNumber,
        accountTitle
      },
      description: `Withdrawal to ${bankName}`
    });

    await newTx.save();

    // --- 5. SEND EMAIL ALERT ---
    // Notifies Admin that someone requested money
    sendWithdrawalRequestEmail(user.name, amount, bankName);

    res.json({ msg: 'Withdrawal requested successfully', balance: user.walletBalance });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;