const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { processPayment } = require('../utils/paymentGateway');

// Plan configurations
const PLANS = {
    "Starter": { 
        name: "Starter", 
        price: 50000, 
        returnPercentage: 4.0, 
        totalItems: 100,       
        dailyMinSales: 2,      
        dailyMaxSales: 5,
        durationDays: 30
    },
    "Growth": { 
        name: "Growth", 
        price: 100000, 
        returnPercentage: 4.5, 
        totalItems: 250,       
        dailyMinSales: 5,
        dailyMaxSales: 10,
        durationDays: 30
    },
    "Premium": { 
        name: "Premium", 
        price: 200000, 
        returnPercentage: 5.0, 
        totalItems: 600,       
        dailyMinSales: 15,
        dailyMaxSales: 30,
        durationDays: 30
    }
};

// @route   GET api/plans
// @desc    Get all available plans
// @access  Public
router.get('/', (req, res) => {
    try {
        const plans = Object.values(PLANS);
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/plans/user
// @desc    Get user's current plan status
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check for active investment
        const activeInvestment = await Investment.findOne({ 
            user: req.user.id, 
            status: 'active' 
        });

        let currentPlan = null;
        let planStatus = 'inactive';
        let planActivatedAt = null;
        let planExpiresAt = null;

        // Priority 1: Check user data first (most reliable)
        if (user.currentPlan) {
            // Check if plan expired
            if (user.planExpiresAt && new Date() > user.planExpiresAt) {
                planStatus = 'expired';
            } else {
                currentPlan = user.currentPlan;
                planStatus = user.subscriptionStatus;
                planActivatedAt = user.planActivatedAt;
                planExpiresAt = user.planExpiresAt;
            }
        } 
        // Priority 2: Fallback to active investment if user data is missing
        else if (activeInvestment) {
            currentPlan = activeInvestment.plan.name;
            planStatus = 'active';
            planActivatedAt = activeInvestment.startDate;
            planExpiresAt = new Date(activeInvestment.startDate);
            planExpiresAt.setDate(planExpiresAt.getDate() + 30); // 30 days duration
        }
        // Priority 3: Fallback for edge cases
        else {
            // Fallback: check if user has plan fields set but no investment
            if (user.currentPlan && user.subscriptionStatus === 'active') {
                currentPlan = user.currentPlan;
                planStatus = 'active';
                planActivatedAt = user.planActivatedAt;
                planExpiresAt = user.planExpiresAt;
            }
        }

        res.json({
            currentPlan,
            planActivatedAt,
            planExpiresAt,
            hasCompletedFirstPurchase: user.hasCompletedFirstPurchase,
            subscriptionStatus: planStatus,
            canUpgrade: planStatus === 'active' || planStatus === 'expired'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/plans/purchase
// @desc    Purchase a plan with payment gateway integration
// @access  Private
router.post('/purchase', auth, async (req, res) => {
    try {
        const { planName, paymentMethod = 'payment_gateway' } = req.body;

        console.log('Plan purchase request:', { planName, paymentMethod, userId: req.user.id });

        // Validate plan
        const selectedPlan = PLANS[planName];
        if (!selectedPlan) {
            console.log('Invalid plan selected:', planName);
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User found:', { name: user.name, walletBalance: user.walletBalance });

        // Use a transaction to ensure all database operations are atomic
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check for existing active plan
            const existingInvestment = await Investment.findOne({ 
                user: req.user.id, 
                status: 'active' 
            }).session(session);

            if (existingInvestment) {
                // Allow plan change if it's different from current plan
                if (existingInvestment.plan.name === planName) {
                    console.log('User already has this plan:', existingInvestment.plan.name);
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ error: 'You already have this plan' });
                }
                console.log('User has different active plan, cancelling old investment:', existingInvestment.plan.name);
                // Cancel the existing investment
                existingInvestment.status = 'cancelled';
                await existingInvestment.save({ session });
            }

            if (paymentMethod === 'wallet') {
                // Check wallet balance
                if (user.walletBalance < selectedPlan.price) {
                    console.log('Insufficient wallet balance:', { 
                        required: selectedPlan.price, 
                        available: user.walletBalance 
                    });
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ error: 'Insufficient wallet balance' });
                }

                console.log('Processing wallet payment...');

                // Deduct from wallet
                user.walletBalance -= selectedPlan.price;
                await user.save({ session });

                // Create investment
                const newInvestment = await createInvestment(user._id, selectedPlan, session);
                
                // Record transaction
                await Transaction.create([{
                    user: user._id,
                    type: 'plan_purchase',
                    amount: selectedPlan.price,
                    status: 'approved',
                    description: `Purchased ${planName} plan`
                }], { session });

                // Update user subscription status
                user.currentPlan = planName;
                user.planActivatedAt = new Date();
                user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                user.hasCompletedFirstPurchase = true;
                user.subscriptionStatus = 'active';
                await user.save({ session });

                // Create notification for plan subscription
                await Notification.create([{
                    user: user._id,
                    type: 'plan_subscribed',
                    message: `Congratulations! You have successfully subscribed to the ${planName} plan. Your plan will expire on ${user.planExpiresAt.toLocaleDateString()}.`
                }], { session });

                await session.commitTransaction();
                session.endSession();

                console.log('Wallet payment successful:', { planName, newBalance: user.walletBalance });

                res.json({
                    success: true,
                    message: `${planName} plan activated successfully!`,
                    plan: {
                        name: planName,
                        activatedAt: user.planActivatedAt,
                        expiresAt: user.planExpiresAt
                    }
                });

            } else {
                console.log('Processing payment gateway payment...');
                
                // Payment gateway method
                const paymentResult = await processPayment({
                    orderId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    amount: selectedPlan.price,
                    description: `Purchase ${planName} Plan`,
                    returnUrl: `${process.env.VITE_APP_URL}/payment-return?plan=${planName}`
                });

                console.log('Payment gateway result:', paymentResult);

                if (!paymentResult.success) {
                    console.log('Payment gateway failed:', paymentResult.error);
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ 
                        error: 'Payment initiation failed',
                        details: paymentResult.error 
                    });
                }

                // For mock mode, immediately complete the plan purchase
                if (process.env.PAYMENT_MODE === 'TEST' || process.env.NODE_ENV !== 'production') {
                    console.log('Mock mode detected, completing plan purchase immediately...');
                    
                    // Create investment
                    const newInvestment = await createInvestment(user._id, selectedPlan, session);
                    
                    // Record transaction
                    await Transaction.create([{
                        user: user._id,
                        type: 'plan_purchase',
                        amount: selectedPlan.price,
                        status: 'approved',
                        description: `Purchased ${planName} plan via mock payment`
                    }], { session });

                    // Update user subscription status
                    user.currentPlan = planName;
                    user.planActivatedAt = new Date();
                    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                    user.hasCompletedFirstPurchase = true;
                    user.subscriptionStatus = 'active';
                    await user.save({ session });

                    // Create notification for plan subscription
                    await Notification.create([{
                        user: user._id,
                        type: 'plan_subscribed',
                        message: `Congratulations! You have successfully subscribed to the ${planName} plan. Your plan will expire on ${user.planExpiresAt.toLocaleDateString()}.`
                    }], { session });

                    await session.commitTransaction();
                    session.endSession();

                    console.log('Mock payment successful:', { planName, newBalance: user.walletBalance });

                    res.json({
                        success: true,
                        message: `${planName} plan activated successfully!`,
                        plan: {
                            name: planName,
                            activatedAt: user.planActivatedAt,
                            expiresAt: user.planExpiresAt
                        }
                    });
                } else {
                    // Store pending plan purchase info for live mode
                    user.pendingPlanPurchase = {
                        planName,
                        transactionId: paymentResult.transactionId,
                        amount: selectedPlan.price,
                        initiatedAt: new Date()
                    };
                    await user.save({ session });

                    await session.commitTransaction();
                    session.endSession();

                    console.log('Payment gateway initiated successfully:', { 
                        transactionId: paymentResult.transactionId,
                        checkoutUrl: paymentResult.checkoutUrl 
                    });

                    res.json({
                        success: true,
                        message: 'Payment initiated successfully',
                        ...paymentResult
                    });
                }
            }
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    } catch (err) {
        console.error('Plan purchase error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   POST api/plans/upgrade
// @desc    Upgrade to a higher plan
// @access  Private
router.post('/upgrade', auth, async (req, res) => {
    try {
        const { planName } = req.body;
        const selectedPlan = PLANS[planName];

        if (!selectedPlan) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check current plan
        const currentPlan = PLANS[user.currentPlan];
        if (!currentPlan) {
            return res.status(400).json({ error: 'No active plan found to upgrade' });
        }

        // Check if trying to downgrade
        if (selectedPlan.price <= currentPlan.price) {
            return res.status(400).json({ error: 'You can only upgrade to a higher plan' });
        }

        const upgradeCost = selectedPlan.price - currentPlan.price;

        // Check wallet balance for upgrade
        if (user.walletBalance < upgradeCost) {
            return res.status(400).json({ error: 'Insufficient wallet balance for upgrade' });
        }

        // Deduct upgrade cost
        user.walletBalance -= upgradeCost;
        await user.save();

        // Cancel current investment
        const currentInvestment = await Investment.findOne({ 
            user: req.user.id, 
            status: 'active' 
        });

        if (currentInvestment) {
            currentInvestment.status = 'cancelled';
            await currentInvestment.save();
        }

        // Create new investment
        const newInvestment = await createInvestment(user._id, selectedPlan);

        // Record upgrade transaction
        await Transaction.create({
            user: user._id,
            type: 'plan_upgrade',
            amount: upgradeCost,
            status: 'approved',
            description: `Upgraded from ${currentPlan.name} to ${planName}`
        });

        // Update user subscription
        user.currentPlan = planName;
        user.planActivatedAt = new Date();
        user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.subscriptionStatus = 'active';
        await user.save();

        res.json({
            success: true,
            message: `Successfully upgraded to ${planName} plan!`,
            plan: {
                name: planName,
                activatedAt: user.planActivatedAt,
                expiresAt: user.planExpiresAt
            }
        });

    } catch (err) {
        console.error('Plan upgrade error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   POST api/plans/callback
// @desc    Handle payment callback for plan purchases
// @access  Public
router.post('/callback', async (req, res) => {
    try {
        const responseData = req.body;
        const orderId = req.query.orderId || responseData.TransactionID;

        // Verify payment response
        const { verifyResponseHash } = require('../utils/paymentGateway');
        const isTestMode = process.env.PAYMENT_MODE === 'TEST';
        
        if (!isTestMode && !verifyResponseHash(responseData)) {
            return res.status(400).json({ error: 'Invalid payment response hash' });
        }

        // Find user with pending plan purchase
        const user = await User.findOne({ 'pendingPlanPurchase.transactionId': orderId });
        if (!user) {
            return res.status(404).json({ error: 'User not found for this transaction' });
        }

        const pendingPurchase = user.pendingPlanPurchase;
        const selectedPlan = PLANS[pendingPurchase.planName];

        if (responseData.Status === 'SUCCESS' || responseData.Status === 'APPROVED') {
            // Use a transaction to ensure all database operations are atomic
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Create investment
                const newInvestment = await createInvestment(user._id, selectedPlan, session);
                
                // Record transaction
                await Transaction.create([{
                    user: user._id,
                    type: 'plan_purchase',
                    amount: pendingPurchase.amount,
                    status: 'approved',
                    description: `Purchased ${pendingPurchase.planName} plan`
                }], { session });

                // Update user subscription status
                user.currentPlan = pendingPurchase.planName;
                user.planActivatedAt = new Date();
                user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                user.hasCompletedFirstPurchase = true;
                user.subscriptionStatus = 'active';
                user.pendingPlanPurchase = undefined;
                await user.save({ session });

                // Create notification for plan subscription
                await Notification.create([{
                    user: user._id,
                    type: 'plan_subscribed',
                    message: `Congratulations! Your payment for the ${pendingPurchase.planName} plan has been successful. Your plan is now active and will expire on ${user.planExpiresAt.toLocaleDateString()}.`
                }], { session });

                await session.commitTransaction();
                session.endSession();

                res.json({
                    success: true,
                    message: 'Plan purchase completed successfully'
                });
            } catch (err) {
                await session.abortTransaction();
                session.endSession();
                throw err;
            }
        } else {
            // Payment failed, clean up
            user.pendingPlanPurchase = undefined;
            await user.save();

            res.json({
                success: false,
                message: 'Plan purchase failed'
            });
        }
    } catch (err) {
        console.error('Plan callback error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Helper function to create investment
async function createInvestment(userId, plan, session = null) {
    const newInvestment = new Investment({
        user: userId,
        status: 'active',
        plan: {
            name: plan.name,
            price: plan.price,
            dailySales: plan.dailyMaxSales,
            returnRate: plan.returnPercentage,
            dailyMinSales: plan.dailyMinSales,
            dailyMaxSales: plan.dailyMaxSales,
            totalItems: plan.totalItems
        },
        totalStock: plan.totalItems,
        startDate: new Date(),
        lastProcessedDate: new Date(),
        itemsSold: 0,
        accumulatedReturn: 0
    });

    if (session) {
        await newInvestment.save({ session });
    } else {
        await newInvestment.save();
    }
    return newInvestment;
}

module.exports = router;