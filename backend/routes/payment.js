const express = require('express');
const router = express.Router();
const { processPayment, createHostedPaymentForm, verifyResponseHash, getIPNUrl } = require('../utils/paymentGateway');
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');

/**
 * POST /api/payment/initiate
 * Initiates a new payment request
 */
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { orderId, amount, description } = req.body;

    // Validate input
    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Missing required fields: orderId, amount' });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Process payment
    const paymentResult = await processPayment({
      orderId,
      amount,
      description,
      returnUrl: `${process.env.VITE_APP_URL}/orders/${orderId}`
    });

    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment initiation failed', details: paymentResult });
    }

    // Update order with payment details
    order.paymentStatus = 'PENDING';
    order.transactionId = paymentResult.transactionId || paymentResult.formData?.TransactionID;
    await order.save();

    res.json({
      success: true,
      ...paymentResult,
      orderId: orderId
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payment/callback
 * Handles payment callback from Alfa Payment Gateway (IPN)
 * This is called after user completes/cancels payment
 */
router.post('/callback', async (req, res) => {
  try {
    const responseData = req.body;

    console.log('Payment callback received:', responseData);

    // Verify hash to ensure request is from Alfa Payment Gateway
    if (!verifyResponseHash(responseData)) {
      // Hash verification failed - could be security issue
      console.error('Invalid payment response hash - possible security issue');
      return res.status(400).json({ error: 'Invalid response signature' });
    }

    // Update order status based on payment response
    const order = await Order.findOne({ _id: responseData.TransactionID });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Map Alfa payment status to our system
    const statusMap = {
      'SUCCESS': 'COMPLETED',
      'APPROVED': 'COMPLETED',
      'FAILED': 'FAILED',
      'CANCELLED': 'CANCELLED',
      'PENDING': 'PENDING'
    };

    order.paymentStatus = statusMap[responseData.Status] || responseData.Status;
    order.bankResponse = responseData;
    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated',
      paymentStatus: order.paymentStatus
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
      amount: order.totalPrice
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

module.exports = router;
