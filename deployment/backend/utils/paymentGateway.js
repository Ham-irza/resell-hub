const crypto = require('crypto');
const querystring = require('querystring'); // CRITICAL: Required for legacy ASP.NET servers

const validateCredentials = () => {
    const required = [
        'ALFALAH_MERCHANT_ID', 'ALFALAH_STORE_ID', 'ALFALAH_MERCHANT_HASH',
        'ALFALAH_KEY1', 'ALFALAH_KEY2', 'ALFALAH_USERNAME', 'ALFALAH_PASSWORD', 'ALFALAH_API_URL'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing Alfa credentials: ${missing.join(', ')}`);
    }
};

const verifyResponseHash = (responseData) => {
    const hashString = `${responseData.MerchantId}${responseData.StoreID}${responseData.TransactionID}${responseData.Amount}${responseData.Status}`;
    const calculatedHash = crypto.createHmac('sha256', process.env.ALFALAH_KEY2).update(hashString).digest('base64');
    return calculatedHash === responseData.ResponseHash;
};

const getIPNUrl = (transactionId) => {
    const baseUrl = process.env.PAYMENT_MODE === 'TEST'
        ? 'https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus'
        : 'https://payments.bankalfalah.com/HS/api/IPN/OrderStatus';
    return `${baseUrl}/${process.env.ALFALAH_MERCHANT_ID}/${process.env.ALFALAH_STORE_ID}/${transactionId}`;
};

const processPayment = async (orderData) => {
    const mode = process.env.PAYMENT_MODE || 'TEST';
    console.log(`💳 Processing Payment... Mode: ${mode}`);

    if (mode === 'TEST') {
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
        validateCredentials();
        try {
            const transactionId = orderData.orderId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const amount = Math.round(orderData.amount * 100).toString(); 
            
            let safeReturnUrl = orderData.returnUrl || `${process.env.VITE_APP_URL}/payment-return?orderId=${transactionId}`;
            safeReturnUrl = safeReturnUrl.replace(/http:\/\/localhost:\d+/g, 'https://e-grocify-test.com');

            const handshakePayload = {
                HS_ChannelId: '1001',
                HS_MerchantId: process.env.ALFALAH_MERCHANT_ID,
                HS_MerchantHash: process.env.ALFALAH_MERCHANT_HASH,
                HS_MerchantPassword: process.env.ALFALAH_PASSWORD,
                HS_MerchantUsername: process.env.ALFALAH_USERNAME,
                HS_ReturnURL: safeReturnUrl,
                HS_StoreId: process.env.ALFALAH_STORE_ID,
                HS_TransactionAmount: amount,
                HS_TransactionReferenceNumber: transactionId
            };

            // Alphabetical Sort & AES Encryption for the Hash
            const sortedKeys = Object.keys(handshakePayload).sort();
            const mapString = sortedKeys.map(k => `${k}=${handshakePayload[k]}`).join('&');

            const key = Buffer.from(process.env.ALFALAH_KEY1, 'utf8');
            const iv = Buffer.from(process.env.ALFALAH_KEY2, 'utf8');
            const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
            
            let encrypted = cipher.update(mapString, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            
            handshakePayload.HS_RequestHash = encrypted;

            // CRITICAL: Format specifically for the bank's infrastructure
            const payloadString = querystring.stringify(handshakePayload);

            console.log('Initiating Bank Alfalah Handshake. Payload length:', payloadString.length);

            // CRITICAL: Send explicit Content-Length to bypass chunking blocks
            const response = await fetch(process.env.ALFALAH_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(payloadString).toString(),
                    'Accept': 'application/json'
                },
                body: payloadString
            });

            const resultText = await response.text();
            console.log('RAW BANK RESPONSE:', resultText); // Added to see exactly what they send back

            let result;
            try {
                result = JSON.parse(resultText);
            } catch (e) {
                console.error("Bank returned non-JSON response:", resultText);
                throw new Error("Invalid response from Bank Alfalah");
            }

            if (result.success === "true" || result.AuthToken) {
                let checkoutBaseUrl = process.env.ALFALAH_API_URL.replace(/\/$/, '');
                return {
                    success: true,
                    type: 'AUTH_TOKEN_REDIRECT',
                    transactionId: transactionId,
                    checkoutUrl: `${checkoutBaseUrl}`,
                    authToken: result.AuthToken,
                    returnUrl: result.ReturnURL || safeReturnUrl
                };
            } else {
                console.error('Bank Alfalah Handshake Error:', result);
                return { success: false, error: result.ErrorMessage || 'Handshake failed', details: result };
            }

        } catch (error) {
            console.error('Payment Processing Exception:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = {
    processPayment,
    verifyResponseHash,
    getIPNUrl,
    validateCredentials
};