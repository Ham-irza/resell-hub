const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   POST api/store/buy
// @desc    Buy a product (Deduct stock, create order, start auto-sell)
// @access  Private
router.post('/buy', auth, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // 1. Find the product
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        // 2. Check if user has sufficient tier to purchase this product
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.tier < product.tier) {
            return res.status(400).json({ 
                msg: `You need to be at least tier ${product.tier} to purchase this product. Your current tier is ${user.tier}.` 
            });
        }

        // 3. Check Stock
        if (product.quantity < quantity) {
            return res.status(400).json({ msg: "Not enough stock available" });
        }

        // 4. Calculate Total and Expected Profit
        const totalAmount = product.price * quantity;
        
        // Calculate expected profit based on ROI
        const roi = product.roi || 0;
        const expectedProfit = (totalAmount * roi) / 100;

        // 5. Create Order Record - Status will be 'approved' and then admin can start auto-sell
        const newOrder = new Order({
            user: req.user.id,
            product: product._id,
            productName: product.name,
            productImage: product.image,
            quantity: Number(quantity),
            totalAmount: totalAmount,
            status: 'approved', // Order approved, waiting for admin to start auto-sell
            // Auto-sell tracking fields (will be activated when admin starts auto-sell)
            itemsSold: 0,
            totalQuantity: Number(quantity),
            expectedProfit: expectedProfit,
            pricePerItem: product.price,
            roi: roi,
            userTier: user.tier, // Store user tier at time of purchase
            lastProcessedDate: new Date()
        });

        await newOrder.save();

        // 6. Deduct Stock from Product
        product.quantity = product.quantity - quantity;
        await product.save();

        res.json({ 
            msg: "Order placed successfully! Your order is approved and will start auto-selling once the admin activates it.", 
            order: newOrder 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/store/orders
// @desc    Get logged in user's order history
// @access  Private
router.get('/orders', auth, async (req, res) => {
    try {
        // Fetch orders for this user, newest first
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/store/active-orders
// @desc    Get user's active auto-selling orders (including orders over 30 days)
// @access  Private
router.get('/active-orders', auth, async (req, res) => {
    try {
        // Get all orders with status 'auto-selling' (includes orders of any age)
        const activeOrders = await Order.find({ 
            user: req.user.id, 
            status: 'auto-selling' 
        }).sort({ createdAt: -1 });
        
        // Log for debugging
        console.log(`[BALANCE LOG] Fetched ${activeOrders.length} active orders for user ${req.user.id}`);
        activeOrders.forEach(order => {
            console.log(`[BALANCE LOG] Order ${order._id}: ${order.itemsSold}/${order.totalQuantity} items sold, Expected Profit: PKR ${order.expectedProfit}`);
        });
        
        res.json(activeOrders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
