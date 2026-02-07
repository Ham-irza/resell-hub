const crypto = require('crypto');

/**
 * Alfa Payment Gateway Integration
 * Supports both Sandbox (Testing) and Live (Production) environments
 */

// Validate required environment variables
const validateCredentials = () => {
  const required = [
    'ALFALAH_MERCHANT_ID',
    'ALFALAH_STORE_ID',
    'ALFALAH_MERCHANT_HASH',
    'ALFALAH_KEY1',
    'ALFALAH_KEY2'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Alfa Payment Gateway credentials: ${missing.join(', ')}`);
  }
};

/**
 * Generate HMAC Hash for payment request
 * @param {string} data - Data to hash
 * @returns {string} - HMAC hash
 */
const generateHash = (data) => {
  return crypto
    .createHmac('sha256', process.env.ALFALAH_KEY2)
    .update(data)
    .digest('base64');
};

/**
 * Generate payment request hash
 * @param {Object} paymentData - Payment transaction data
 * @returns {string} - Request hash
 */
const generatePaymentHash = (paymentData) => {
  const hashString = `${paymentData.merchantId}${paymentData.storeId}${paymentData.transactionId}${paymentData.amount}`;
  return generateHash(hashString);
};

/**
 * Create hosted payment form data
 * @param {Object} orderData - Order details
 * @returns {Object} - Form data for Alfa Payment Gateway
 */
const createHostedPaymentForm = (orderData) => {
  validateCredentials();

  const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const amount = Math.round(orderData.amount * 100); // Convert to cents

  const paymentParams = {
    MerchantId: process.env.ALFALAH_MERCHANT_ID,
    StoreID: process.env.ALFALAH_STORE_ID,
    TransactionID: transactionId,
    Amount: amount,
    Description: orderData.description || 'Purchase',
    ReturnURL: orderData.returnUrl || process.env.VITE_APP_URL + '/payment-callback',
    PostURL: process.env.VITE_APP_URL + '/payment-ipn',
    ExpireDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    CharacterEncoding: 'UTF-8',
    CurrencyCode: '586' // PKR currency code
  };

  // Generate request hash
  const hashString = `${paymentParams.MerchantId}${paymentParams.StoreID}${paymentParams.TransactionID}${paymentParams.Amount}`;
  paymentParams.RequestHash = generateHash(hashString);

  return {
    ...paymentParams,
    apiUrl: process.env.ALFALAH_API_URL,
    isTest: process.env.PAYMENT_MODE === 'TEST'
  };
};

/**
 * Verify payment response hash (webhook validation)
 * @param {Object} responseData - Response from Alfa Payment Gateway
 * @returns {boolean} - Is hash valid
 */
const verifyResponseHash = (responseData) => {
  const hashString = `${responseData.MerchantId}${responseData.StoreID}${responseData.TransactionID}${responseData.Amount}${responseData.Status}`;
  const calculatedHash = generateHash(hashString);
  return calculatedHash === responseData.ResponseHash;
};

/**
 * Get payment status via IPN URL
 * @param {string} transactionId - Transaction ID
 * @returns {string} - IPN URL for status check
 */
const getIPNUrl = (transactionId) => {
  const baseUrl = process.env.PAYMENT_MODE === 'TEST'
    ? 'https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus'
    : 'https://payments.bankalfalah.com/HS/api/IPN/OrderStatus';

  return `${baseUrl}/${process.env.ALFALAH_MERCHANT_ID}/${process.env.ALFALAH_STORE_ID}/${transactionId}`;
};

/**
 * Process payment - Simulates Test Mode or provides Live integration data
 */
const processPayment = async (orderData) => {
  const mode = process.env.PAYMENT_MODE || 'TEST';
  console.log(`💳 Processing Payment... Mode: ${mode}`);

  if (mode === 'TEST') {
    // SIMULATION: Return after delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: 'TXN-' + Math.floor(Math.random() * 1000000),
          bankResponse: 'APPROVED_TEST',
          message: 'Test payment processed successfully'
        });
      }, 1000);
    });
  }

  if (mode === 'LIVE') {
    // LIVE INTEGRATION
    validateCredentials();
    const formData = createHostedPaymentForm(orderData);
    return {
      success: true,
      type: 'HOSTED_REDIRECT',
      formData: formData,
      message: 'Redirect user to Alfa Payment Gateway',
      ipnUrl: getIPNUrl(formData.TransactionID)
    };
  }
};

module.exports = {
  processPayment,
  createHostedPaymentForm,
  verifyResponseHash,
  getIPNUrl,
  generateHash,
  validateCredentials
};