const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// --- 1. PLANS CONFIGURATION (Matches your Plan Model) ---
const PLANS = {
    "Starter": { 
        name: "Starter", 
        price: 50000, 
        returnPercentage: 4.0, 
        totalItems: 100,       
        dailyMinSales: 2,      
        dailyMaxSales: 5       
    },
    "Growth": { 
        name: "Growth", 
        price: 100000, 
        returnPercentage: 4.5, 
        totalItems: 250,       
        dailyMinSales: 5,
        dailyMaxSales: 10
    },
    "Premium": { 
        name: "Premium", 
        price: 200000, 
        returnPercentage: 5.0, 
        totalItems: 600,       
        dailyMinSales: 15,
        dailyMaxSales: 30
    }
};

// @route   GET api/investments/active
router.get('/active', auth, async (req, res) => {
    try {
        let investment = await Investment.findOne({ 
            user: req.user.id, 
            status: 'active' 
        });

        if (!investment) {
            return res.json(null);
        }

        // --- SIMULATION LOGIC ---
        const now = new Date();
        const lastUpdate = new Date(investment.lastProcessedDate || investment.startDate);
        const todayMidnight = new Date(now.setHours(0,0,0,0));
        const lastMidnight = new Date(lastUpdate.setHours(0,0,0,0));
        const diffTime = Math.abs(todayMidnight - lastMidnight);
        const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        // Get limits (Handle both naming conventions for safety)
        const stockLimit = investment.totalStock || investment.plan.totalItems || 100;

        if (daysPassed > 0 && investment.itemsSold < stockLimit) {
            
            // Handle naming mismatch for simulation
            const min = investment.plan.dailyMinSales || 1;
            // If strictly "dailySales" exists, use it as max, otherwise use dailyMaxSales
            const max = investment.plan.dailyMaxSales || investment.plan.dailySales || 2;
            const profitRate = investment.plan.returnPercentage || investment.plan.returnRate || 4.0;

            let newSales = 0;
            let newProfit = 0;

            for (let i = 0; i < daysPassed; i++) {
                if (investment.itemsSold + newSales >= stockLimit) break;

                const actualSales = Math.floor(Math.random() * (max - min + 1)) + min;
                const dailyProfit = (investment.plan.price * (profitRate / 100)) / 30;

                newSales += actualSales;
                newProfit += dailyProfit;
            }

            investment.itemsSold += newSales;
            investment.accumulatedReturn += newProfit;
            investment.lastProcessedDate = new Date();

            if (investment.itemsSold >= stockLimit) {
                investment.status = 'completed';
            }

            await investment.save();
        }

        res.json(investment);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/investments/buy
router.post('/buy', auth, async (req, res) => {
    try {
        const { planName } = req.body; 

        // 1. Validate the Plan Name
        const selectedPlan = PLANS[planName];
        if (!selectedPlan) {
            return res.status(400).json({ msg: "Invalid Plan Selected" });
        }

        // 2. Check if user already has an active plan
        const existing = await Investment.findOne({ user: req.user.id, status: 'active' });
        if (existing) {
            return res.status(400).json({ msg: "You already have an active plan" });
        }

        // 3. Create the Investment (CRITICAL MAPPING FIX)
        const newInvestment = new Investment({
            user: req.user.id,
            status: 'active',
            
            // MAP DATA: Translate "Plan Model" names to "Investment Schema" names
            plan: {
                name: selectedPlan.name,
                price: selectedPlan.price,
                
                // MAPPING 1: Schema wants 'dailySales', we give it the average or max
                dailySales: selectedPlan.dailyMaxSales, 
                
                // MAPPING 2: Schema wants 'returnRate', we give it 'returnPercentage'
                returnRate: selectedPlan.returnPercentage,
                
                // Keep these for future reference if schema allows
                dailyMinSales: selectedPlan.dailyMinSales,
                dailyMaxSales: selectedPlan.dailyMaxSales,
                totalItems: selectedPlan.totalItems
            },
            
            // Map totalItems to totalStock
            totalStock: selectedPlan.totalItems,
            
            startDate: new Date(),
            lastProcessedDate: new Date(),
            itemsSold: 0,
            accumulatedReturn: 0
        });

        await newInvestment.save();

        // 4. Record the Transaction
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
        console.error("Investment Error:", err.message);
        // Send the specific error message to the frontend/logs
        res.status(500).send('Investment Failed: ' + err.message);
    }
});

module.exports = router;