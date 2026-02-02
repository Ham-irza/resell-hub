const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product'); // Assuming you have this from previous steps

// @route   POST api/store/buy
// @desc    Buy a product (Deduct stock, create order)
// @access  Private
router.post('/buy', auth, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // 1. Find the product
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        // 2. Check Stock
        if (product.quantity < quantity) {
            return res.status(400).json({ msg: "Not enough stock available" });
        }

        // 3. Calculate Total
        const totalAmount = product.price * quantity;

        // 4. Create Order Record
        const newOrder = new Order({
            user: req.user.id,
            product: product._id,
            productName: product.name,
            productImage: product.image,
            quantity: Number(quantity),
            totalAmount: totalAmount,
            status: 'processing'
        });

        await newOrder.save();

        // 5. Deduct Stock from Product
        product.quantity = product.quantity - quantity;
        await product.save();

        res.json({ msg: "Order placed successfully", order: newOrder });

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

module.exports = router;