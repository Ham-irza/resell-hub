const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendWithdrawalApprovedEmail } = require('../utils/emailService'); // <--- ADDED IMPORT

// @route   GET api/admin/stats
// @desc    Get Global Dashboard Stats
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Aggregate Financials
    const transactions = await Transaction.find({});
    
    const totalDeposited = transactions
      .filter(t => t.type === 'deposit')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPayouts = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'approved')
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      totalUsers,
      totalDeposited,
      pendingWithdrawals,
      totalPayouts
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/withdrawals
// @desc    Get all withdrawal requests
router.get('/withdrawals', [auth, admin], async (req, res) => {
  try {
    // Populate user details (name) to show in the table
    const withdrawals = await Transaction.find({ type: 'withdrawal' })
      .populate('user', 'name')
      .sort({ createdAt: -1 }); // Newest first

    res.json(withdrawals);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/withdrawals/:id
// @desc    Approve or Reject a withdrawal
router.put('/withdrawals/:id', [auth, admin], async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });
    if (tx.status !== 'pending') return res.status(400).json({ msg: 'Transaction already processed' });

    tx.status = status;
    await tx.save();

    // IF APPROVED: Send Email to User
    if (status === 'approved') {
      const user = await User.findById(tx.user);
      if (user) {
        // Send email notification
        sendWithdrawalApprovedEmail(user.email, user.name, tx.amount);
      }
    }

    // IF REJECTED: Refund the money back to user wallet
    if (status === 'rejected') {
      const user = await User.findById(tx.user);
      user.walletBalance += tx.amount;
      await user.save();
    }

    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/stats
// @desc    Get Global Dashboard Stats + ALL Activity
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // 1. Calculate Totals
    const allTransactions = await Transaction.find({});
    
    const totalDeposited = allTransactions
      .filter(t => t.type === 'deposit')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingWithdrawals = allTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPayouts = allTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'approved')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Fetch ALL Transactions (Sorted Newest First)
    // REMOVED .limit(5)
    const recentTransactions = await Transaction.find({})
      .sort({ createdAt: -1 }) 
      .populate('user', 'name'); 

    res.json({
      totalUsers,
      totalDeposited,
      pendingWithdrawals,
      totalPayouts,
      recentTransactions 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/transactions
// @desc    Get full transaction history sorted by date
router.get('/transactions', [auth, admin], async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 }) // Latest first
      .populate('user', 'name email'); // Get user details
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;