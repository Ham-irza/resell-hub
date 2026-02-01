const crypto = require('crypto');

// This simulates the interaction with Bank Alfalah's API
// In a real scenario, this would generate the HMAC hash and verify the callback
const processPayment = async (amount, cardDetails) => {
  const mode = process.env.PAYMENT_MODE || 'TEST';

  console.log(`💳 Processing Payment... Mode: ${mode}`);

  if (mode === 'TEST') {
    // SIMULATION: Always succeed after 1 second
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: 'TXN-' + Math.floor(Math.random() * 1000000),
          bankResponse: 'APPROVED_TEST'
        });
      }, 1000);
    });
  } 
  
  if (mode === 'LIVE') {
    // REAL INTEGRATION LOGIC
    // 1. Validate Keys
    if (!process.env.ALFALAH_MERCHANT_ID || !process.env.ALFALAH_HASH_KEY) {
      throw new Error("Missing Bank Alfalah API Credentials");
    }

    // 2. Here you would use 'axios' to hit the real Bank Alfalah API
    // const response = await axios.post(process.env.ALFALAH_API_URL, { ... });
    
    // For now, since we don't have keys, we throw error to prevent fake money
    throw new Error("Live Payment Gateway not yet connected. Please set PAYMENT_MODE to TEST.");
  }
};

module.exports = { processPayment };