const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// --- CONFIGURATION ---
// Hardcoded plans ensure the system works immediately without database seeding
const PLANS = {
  "Starter": { price: 50000, returnRate: 4, totalItems: 35, dailyItems: 1 },
  "Growth": { price: 100000, returnRate: 4.5, totalItems: 50, dailyItems: 2 },
  "Premium": { price: 200000, returnRate: 5, totalItems: 80, dailyItems: 3 }
};

// Mock Email Service (Replace with actual Nodemailer logic if needed)
const sendPurchaseEmail = (email, name, planName, price) => {
    console.log(`📧 EMAIL SENT to ${email}: Confirmed purchase of ${planName} for PKR ${price}`);
};

// @route   POST api/investments/buy
// @desc    Purchase a new investment plan
// @access  Private
router.post('/buy', auth, async (req, res) => {
  const { planName, cardDetails } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    // 1. VALIDATION: Check for existing active plan
    const existing = await Investment.findOne({ user: req.user.id, status: 'active' });
    if (existing) {
      return res.status(400).json({ msg: 'You already have an active investment. Please wait for the current cycle to finish.' });
    }

    // 2. VALIDATION: Check Plan Validity
    const planDetails = PLANS[planName];
    if (!planDetails) {
      return res.status(404).json({ msg: 'Invalid Plan Selected' });
    }

    // 3. PAYMENT PROCESSING (Bank Alfalah Simulation)
    // In a real app, you would validate 'cardDetails' with the Bank API here.
    if (!cardDetails || cardDetails.number.length < 10) {
        // Simple mock validation
        // return res.status(400).json({ msg: 'Invalid Card Details' });
    }
    console.log(`💳 PAYMENT PROCESSED: PKR ${planDetails.price} via Bank Alfalah Gateway.`);

    // 4. CREATE INVESTMENT RECORD
    const expectedProfit = (planDetails.price * planDetails.returnRate) / 100;
    
    const newInvestment = new Investment({
      user: req.user.id,
      plan: {
        name: planName,
        price: planDetails.price,
        returnPercentage: planDetails.returnRate,
        dailyItems: planDetails.dailyItems
      },
      investedAmount: planDetails.price,
      expectedProfit: expectedProfit,
      totalStock: planDetails.totalItems,
      itemsSold: 0,
      accumulatedReturn: 0,
      status: 'active',
      startDate: Date.now()
    });

    await newInvestment.save();

    // 5. LOG TRANSACTION (Deposit) - CRITICAL FOR ADMIN DASHBOARD
    await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount: planDetails.price,
      status: 'approved',
      description: `Purchased ${planName} Plan`
    });

    // 6. SEND NOTIFICATION (To User)
    await Notification.create({
      user: req.user.id,
      message: `✅ Investment Successful! Your ${planName} plan is active. Sales simulation started.`
    });

    // 7. REFERRAL COMMISSION LOGIC
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      
      if (referrer) {
        const commissionRate = 0.05; // 5% Commission
        const bonus = planDetails.price * commissionRate;

        // A. Update Referrer Wallet
        referrer.walletBalance = (referrer.walletBalance || 0) + bonus;
        await referrer.save();

        // B. Log Transaction (Commission) - Shows in Admin Dashboard
        await Transaction.create({
          user: referrer._id,
          type: 'referral_bonus',
          amount: bonus,
          status: 'approved',
          description: `Referral Commission from ${user.name}`
        });
        
        // C. Notify Referrer
        await Notification.create({
          user: referrer._id,
          message: `🎉 You earned PKR ${bonus.toLocaleString()} commission from ${user.name}'s purchase!`
        });
      }
    }

    // 8. EMAIL CONFIRMATION
    sendPurchaseEmail(user.email, user.name, planName, planDetails.price);

    res.json(newInvestment);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/investments/active
// @desc    Get the current active investment for the dashboard
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const investment = await Investment.findOne({ user: req.user.id, status: 'active' });
    // Returns null if no active plan exists (Frontend handles this by showing Plan Selection)
    res.json(investment); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/investments/history
// @desc    Get all past (completed) investments
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Investment.find({ user: req.user.id, status: 'completed' })
      .sort({ updatedAt: -1 }); // Show most recently completed first
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;