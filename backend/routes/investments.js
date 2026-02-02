const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// --- CONFIGURATION ---
const PLAN_RATES = {
  "Starter": { dailyItems: 1, profitPerItem: 67 }, // ~2000/month
  "Growth": { dailyItems: 1.5, profitPerItem: 111 }, // ~5000/month (Average 1.5 items)
  "Premium": { dailyItems: 2, profitPerItem: 167 } // ~10000/month
};

// @route   GET api/investments/active
// @desc    Get the current active investment (and simulate sales if a day has passed)
// @access  Private
router.get('/active', auth, async (req, res) => {
    try {
        let investment = await Investment.findOne({ 
            user: req.user.id, 
            status: 'active' 
        });

        if (!investment) {
            return res.json(null);
        }

        // --- SIMULATION LOGIC: "Catch Up" Mechanism ---
        const now = new Date();
        const lastUpdate = new Date(investment.lastProcessedDate);

        // Reset times to Midnight (00:00:00) to compare calendar days only
        const todayMidnight = new Date(now.setHours(0,0,0,0));
        const lastMidnight = new Date(lastUpdate.setHours(0,0,0,0));

        // Calculate difference in days (milliseconds -> days)
        const diffTime = Math.abs(todayMidnight - lastMidnight);
        const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        // If at least 1 day has passed, simulate sales for those days
        if (daysPassed > 0 && investment.itemsSold < investment.totalStock) {
            
            // 1. Determine Sales Range based on Plan
            let minSales = 1;
            let maxSales = 1;

            if (investment.plan.name === 'Growth') { maxSales = 2; }
            if (investment.plan.name === 'Premium') { minSales = 2; maxSales = 3; }

            // 2. Calculate Profit Per Item
            // Logic: Total Profit = Price * (ReturnRate / 100). 
            // Profit Per Item = Total Profit / Total Stock
            const rate = parseFloat(investment.plan.returnRate); // Extract "4" from "4%"
            const totalExpectedProfit = investment.plan.price * (rate / 100);
            const profitPerItem = totalExpectedProfit / investment.totalStock;

            // 3. Loop through missed days
            for (let i = 0; i < daysPassed; i++) {
                // Stop if stock is empty
                if (investment.itemsSold >= investment.totalStock) break;

                // Randomize sales for this day
                const dailyCount = Math.floor(Math.random() * (maxSales - minSales + 1)) + minSales;
                
                // Add to total (ensure we don't oversell)
                const remainingStock = investment.totalStock - investment.itemsSold;
                const actualSales = Math.min(dailyCount, remainingStock);

                investment.itemsSold += actualSales;
                investment.accumulatedReturn += (actualSales * profitPerItem);
            }

            // 4. Check if Plan is Completed
            if (investment.itemsSold >= investment.totalStock) {
                investment.status = 'completed';
                // OPTIONAL: Auto-credit wallet when completed?
                // const user = await User.findById(req.user.id);
                // user.walletBalance += (investment.plan.price + investment.accumulatedReturn);
                // await user.save();
            }

            // 5. Save the Update
            investment.lastProcessedDate = new Date(); // Set to Now
            await investment.save();
        }
        // ---------------------------------------------------------

        res.json(investment);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/investments/buy
// @desc    Purchase a new plan
// @access  Private
router.post('/buy', auth, async (req, res) => {
    const { planName } = req.body;
  
    // Map plan names to Prices and Stock
    const PLAN_DETAILS = {
        "Starter": { price: 50000, stock: 30 },
        "Growth": { price: 100000, stock: 45 },
        "Premium": { price: 200000, stock: 60 }
    };

    const selectedPlan = PLAN_DETAILS[planName];

    if (!selectedPlan) {
        return res.status(400).json({ msg: "Invalid plan selected" });
    }

    try {
        const user = await User.findById(req.user.id);

        // Check if user already has an active plan
        const existing = await Investment.findOne({ user: req.user.id, status: 'active' });
        if (existing) {
            return res.status(400).json({ msg: "You already have an active plan" });
        }

        // Create Investment
        const newInvestment = new Investment({
            user: req.user.id,
            plan: planName,
            amountInvested: selectedPlan.price,
            totalStock: selectedPlan.stock,
            itemsSold: 0,
            accumulatedReturn: 0,
            startDate: new Date(), // Important for the math later
            status: 'active'
        });

        await newInvestment.save();

        // Create Transaction Record
        const newTx = new Transaction({
            user: req.user.id,
            type: 'deposit',
            amount: selectedPlan.price,
            description: `Purchased ${planName} Plan`,
            status: 'approved'
        });
        await newTx.save();

        res.json(newInvestment);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;