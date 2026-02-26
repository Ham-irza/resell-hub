const express = require('express');
const router = express.Router();
const { processPayment, createHostedPaymentForm, verifyResponseHash, getIPNUrl } = require('../utils/paymentGateway');
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * POST /api/payment/initiate
 * Initiates a new payment request - can create new order or use existing orderId
 */
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, amount, orderId, description } = req.body;
    const userId = req.user.id;

    let order = null;
    let totalAmount = amount;

    // Check if we have product purchase details
    const hasProductDetails = productId && quantity;
    const hasExistingOrder = orderId;

    if (hasProductDetails) {
      // Create new order from product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({ msg: "Not enough stock available" });
      }

      totalAmount = product.price * quantity;
      const roi = product.roi || 0;
      const expectedProfit = (totalAmount * roi) / 100;

      order = new Order({
        user: userId,
        product: product._id,
        productName: product.name,
        productImage: product.image,
        quantity: Number(quantity),
        totalAmount: totalAmount,
        status: 'pending',
        paymentStatus: 'PENDING',
        itemsSold: 0,
        totalQuantity: Number(quantity),
        expectedProfit: expectedProfit,
        pricePerItem: product.price,
        roi: roi,
        lastProcessedDate: null
      });

      await order.save();
    } else if (hasExistingOrder) {
      // Use existing order
      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      totalAmount = order.totalAmount;
    } else {
      return res.status(400).json({ error: 'Missing required fields: orderId or (productId + quantity)' });
    }

    // Process payment through the gateway
    const paymentResult = await processPayment({
      orderId: order._id.toString(),
      amount: totalAmount,
      description: description || `Purchase: ${order.productName}`,
      returnUrl: `${process.env.VITE_APP_URL}/payment-return?orderId=${order._id}`
    });

    if (!paymentResult.success) {
      order.status = 'cancelled';
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({ error: 'Payment initiation failed', details: paymentResult });
    }

    // Update order with transaction ID
    order.transactionId = paymentResult.transactionId || paymentResult.formData?.TransactionID;
    order.paymentStatus = 'PENDING';
    await order.save();

    res.json({
      success: true,
      ...paymentResult,
      orderId: order._id.toString()
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payment/callback
 * Handles payment callback from Alfa Payment Gateway (IPN)
 */
router.post('/callback', async (req, res) => {
  try {
    const responseData = req.body;
    const orderId = req.query.orderId || responseData.TransactionID;

    console.log('Payment callback received:', responseData);

    const isTestMode = process.env.PAYMENT_MODE === 'TEST';
    
    if (!isTestMode && !verifyResponseHash(responseData)) {
      console.error('Invalid payment response hash - possible security issue');
      return res.status(400).json({ error: 'Invalid response signature' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const statusMap = {
      'SUCCESS': 'COMPLETED',
      'APPROVED': 'COMPLETED',
      'APPROVED_TEST': 'COMPLETED',
      'FAILED': 'FAILED',
      'CANCELLED': 'CANCELLED',
      'PENDING': 'PENDING'
    };

    const paymentStatus = statusMap[responseData.Status] || responseData.Status;
    order.paymentStatus = paymentStatus;
    order.bankResponse = responseData;

    if (paymentStatus === 'COMPLETED') {
      order.status = 'auto-selling';
      order.lastProcessedDate = new Date();
      
      if (order.product) {
        const product = await Product.findById(order.product);
        if (product) {
          product.quantity = Math.max(0, product.quantity - order.quantity);
          await product.save();
        }
      }
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      order.status = 'cancelled';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated',
      paymentStatus: order.paymentStatus,
      orderStatus: order.status
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payment/status/:orderId
 * Get payment status for an order
 */
router.get('/status/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      ipnUrl: order.transactionId ? getIPNUrl(order.transactionId) : null,
      amount: order.totalAmount
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payment/test
 * Test endpoint to verify payment gateway setup
 */
router.get('/test', (req, res) => {
  try {
    const testData = {
      merchantId: process.env.ALFALAH_MERCHANT_ID,
      storeId: process.env.ALFALAH_STORE_ID,
      apiUrl: process.env.ALFALAH_API_URL,
      mode: process.env.PAYMENT_MODE,
      credentialsConfigured: !!(
        process.env.ALFALAH_MERCHANT_ID &&
        process.env.ALFALAH_STORE_ID &&
        process.env.ALFALAH_MERCHANT_HASH &&
        process.env.ALFALAH_KEY1 &&
        process.env.ALFALAH_KEY2
      )
    };

    res.json({
      success: true,
      message: 'Payment gateway is configured',
      ...testData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payment/return/:orderId
 * Handles user return from payment page (redirect after payment)
 */
router.get('/return/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { Status, TransactionID, Amount } = req.query;

    console.log('Payment return received:', req.query);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect(`/dashboard?payment=error&message=Order+not+found`);
    }

    if (Status === 'SUCCESS' || Status === 'APPROVED') {
      if (order.status !== 'auto-selling') {
        order.paymentStatus = 'COMPLETED';
        order.status = 'auto-selling';
        order.lastProcessedDate = new Date();
        
        if (order.product) {
          const product = await Product.findById(order.product);
          if (product) {
            product.quantity = Math.max(0, product.quantity - order.quantity);
            await product.save();
          }
        }
        
        await order.save();
      }
      
      return res.redirect(`/dashboard?payment=success&orderId=${orderId}`);
    } else {
      order.paymentStatus = 'FAILED';
      order.status = 'cancelled';
      await order.save();
      
      return res.redirect(`/dashboard?payment=cancelled&orderId=${orderId}`);
    }
  } catch (error) {
    console.error('Payment return error:', error);
    res.redirect(`/dashboard?payment=error&message=${encodeURIComponent(error.message)}`);
  }
});

module.exports = router;
