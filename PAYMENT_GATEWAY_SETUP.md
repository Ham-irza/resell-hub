# Alfa Payment Gateway Integration Guide

## Overview

This guide provides complete integration instructions for **Alfa Bank's Hosted Payment Solution**. The implementation supports both **Sandbox (Test)** and **Live (Production)** environments.

## Configured Credentials

Your sandbox credentials have been configured in `.env`:

```
ALFALAH_MERCHANT_ID=16327
ALFALAH_STORE_ID=021865
ALFALAH_MERCHANT_HASH=s8WY8hBaL9g6a3sMIOsPjn6JgzejGRSOKHHZwBkiY/s=
ALFALAH_KEY1=KDTwxdzjfNGZ2uQu
ALFALAH_KEY2=7915900251639620
ALFALAH_USERNAME=pyvady (Sandbox)
ALFALAH_PASSWORD=xgaPBgXs06VvFzk4yqF7CA== (Sandbox)
ALFALAH_API_URL=https://sandbox.bankalfalah.com/HS/api (Sandbox)
PAYMENT_MODE=TEST (Change to LIVE for production)
```

**Security Note**: Never commit `.env` with real credentials to version control. Use environment variables in production.

---

## API Endpoints

### 1. Initiate Payment
**Endpoint**: `POST /api/payment/initiate`  
**Authentication**: Required (JWT Token)

**Request Body**:
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 5000,
  "description": "Payment for Order #123"
}
```

**Response**:
```json
{
  "success": true,
  "type": "HOSTED_REDIRECT",
  "formData": {
    "MerchantId": "16327",
    "StoreID": "021865",
    "TransactionID": "1707309814523-abc123xyz",
    "Amount": 500000,
    "Description": "Payment for Order #123",
    "RequestHash": "base64-encoded-hash",
    "apiUrl": "https://sandbox.bankalfalah.com/HS/api",
    "isTest": true,
    "ipnUrl": "https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus/16327/021865/1707309814523-abc123xyz"
  },
  "orderId": "507f1f77bcf86cd799439011"
}
```

**Integration on Frontend**:
```typescript
// src/pages/Checkout.tsx
import { useState } from 'react';

export function CheckoutPage({ orderId, amount }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          amount,
          description: `Order #${orderId}`
        })
      });

      const data = await response.json();

      if (data.success && data.type === 'HOSTED_REDIRECT') {
        // Redirect to Alfa Payment Gateway hosted form
        window.location.href = `${data.formData.apiUrl}/Checkout?data=${encodeURIComponent(JSON.stringify(data.formData))}`;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

---

### 2. Payment Callback (IPN Webhook)
**Endpoint**: `POST /api/payment/callback`  
**Authentication**: None (Called by Gateway - Hash verified)

Called by Alfa Payment Gateway after payment completion/failure.

**Incoming Data** (from gateway):
```json
{
  "MerchantId": "16327",
  "StoreID": "021865",
  "TransactionID": "1707309814523-abc123xyz",
  "Amount": 500000,
  "Status": "SUCCESS|FAILED|CANCELLED",
  "ResponseHash": "base64-encoded-hash",
  "BankReference": "BANK123456",
  "AuthCode": "AUTH789"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment status updated",
  "paymentStatus": "COMPLETED"
}
```

**Important**: 
- Configure the callback URL in Alfa Payment Gateway: `https://yourdomain.com/api/payment/callback`
- All responses are verified using HMAC SHA256 hash
- Invalid hashes are rejected (security check)

---

### 3. Get Payment Status
**Endpoint**: `GET /api/payment/status/:orderId`  
**Authentication**: Required (JWT Token)

**Response**:
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "paymentStatus": "COMPLETED|PENDING|FAILED|CANCELLED",
  "transactionId": "1707309814523-abc123xyz",
  "ipnUrl": "https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus/16327/021865/1707309814523-abc123xyz",
  "amount": 5000
}
```

**Usage**:
```typescript
// Check payment status
const checkPaymentStatus = async (orderId: string) => {
  const response = await fetch(`/api/payment/status/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Payment Status:', data.paymentStatus);
};
```

---

### 4. Test Gateway Setup
**Endpoint**: `GET /api/payment/test`  
**Authentication**: None

Verify payment gateway configuration.

**Response**:
```json
{
  "success": true,
  "message": "Payment gateway is configured",
  "merchantId": "16327",
  "storeId": "021865",
  "apiUrl": "https://sandbox.bankalfalah.com/HS/api",
  "mode": "TEST",
  "credentialsConfigured": true
}
```

**Test in Terminal**:
```bash
curl http://localhost:5000/api/payment/test
```

---

## Sandbox Testing

### Test Cards (For Sandbox Only)
Contact Alfa Bank merchant portal for sandbox test card numbers.

### Testing Workflow
1. Start development server: `pnpm dev`
2. Visit your checkout page
3. Click "Pay Now"
4. You'll be redirected to Alfa hosted payment form
5. Enter test card details
6. Complete or fail the payment
7. Gateway redirects back to your return URL
8. Check order status at `/api/payment/status/:orderId`

### Test with curl
```bash
# Test payment initiation
curl -X POST http://localhost:5000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "amount": 5000,
    "description": "Test Payment"
  }'

# Check status
curl http://localhost:5000/api/payment/status/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verify setup
curl http://localhost:5000/api/payment/test
```

---

## Moving to Production

### Step 1: Get Live Credentials
Log into Alfa Merchant Portal:
- URL: https://merchants.bankalfalah.com/merchantportal
- Go Live → Step 2
- Generate new credentials
- Receive KEY1 & KEY2 via email

### Step 2: Update Environment Variables
```env
# Production Credentials
ALFALAH_MERCHANT_ID=YOUR_LIVE_MERCHANT_ID
ALFALAH_STORE_ID=YOUR_LIVE_STORE_ID
ALFALAH_MERCHANT_HASH=YOUR_LIVE_MERCHANT_HASH
ALFALAH_KEY1=YOUR_LIVE_KEY1
ALFALAH_KEY2=YOUR_LIVE_KEY2
ALFALAH_API_URL=https://payments.bankalfalah.com/HS/api
PAYMENT_MODE=LIVE
```

### Step 3: Configure Webhooks
In Alfa Merchant Portal:
- **Return URL**: `https://yourlivesite.com/orders`
- **IPN/Callback URL**: `https://yourlivesite.com/api/payment/callback`

### Step 4: Deploy
```bash
pnpm build
pnpm start
```

### Step 5: Test Live (Low Amount First)
- Place a small test order (1-10 PKR)
- Verify payment completes
- Check IPN callbacks are received
- Monitor Alfa Merchant Portal for transactions

---

## Currency & Amount Format

- **Currency**: PKR (Pakistani Rupees) - Code: 586
- **Amount Format**: Posted in cents
  - 5000 PKR = 500000 (cents)
  - 100 PKR = 10000 (cents)
- **Calculation**: `amountInCents = amountInPKR * 100`

---

## Response Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| SUCCESS | Payment approved | Mark order as paid |
| APPROVED | Payment approved | Mark order as paid |
| FAILED | Payment declined | Notify user, retry option |
| CANCELLED | User cancelled | Request new payment |
| PENDING | Awaiting confirmation | Hold order, check later |

---

## Security Best Practices

1. **Hash Verification**: Always verify request hashes
   ```javascript
   // Implemented in utils/paymentGateway.js
   verifyResponseHash(responseData) // Returns true/false
   ```

2. **HTTPS Only**: Use HTTPS in production
   - Merchant Portal enforces HTTPS
   - All callback requests use HTTPS

3. **PCI Compliance**: 
   - Never store card details
   - All card processing done by Alfa hosted form
   - Never transmit card data to your servers

4. **Sensitive Data**: 
   - Never log KEY2 or MERCHANT_HASH
   - Use environment variables
   - Rotate keys periodically

5. **Amount Validation**:
   ```javascript
   // Verify amount hasn't changed
   if (savedOrder.amount !== paymentResponse.Amount / 100) {
     reject('Amount mismatch - possible fraud');
   }
   ```

---

## Troubleshooting

### "Missing Alfa Payment Gateway Credentials"
- Check `.env` file has all required variables
- Verify `ALFALAH_KEY1` and `ALFALAH_KEY2` are set
- Call `/api/payment/test` to verify configuration

### "Invalid response signature"
- Gateway response hash verification failed
- Check KEY2 in `.env` matches your Alfa account
- Verify PAYMENT_MODE matches the gateway

### Payment redirect not working
- Check `VITE_APP_URL` in `.env` is correct
- Verify callback URL is configured in Merchant Portal
- Check browser console for errors

### Callback not received
- Verify firewall allows inbound HTTPS on port 443
- Check callback URL is publicly accessible
- Ensure server is running and connected to database
- Check logs: `node backend/index.js`

---

## Integration Checklist

- [ ] Credentials added to `.env`
- [ ] Payment routes registered in server
- [ ] Frontend checkout page created
- [ ] Order status tracking implemented
- [ ] IPN callback handler tested
- [ ] Test payment successful in sandbox
- [ ] Security: HTTPS enabled
- [ ] Security: Hash verification active
- [ ] Test low-value transaction in live
- [ ] Monitor transactions in Merchant Portal

---

## References

- **Alfa Merchant Portal**: https://merchants.bankalfalah.com/merchantportal
- **Sandbox Environment**: https://sandbox.bankalfalah.com
- **Live Environment**: https://payments.bankalfalah.com
- **IPN Status URL Format**: 
  - Sandbox: `https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus/{merchantId}/{storeId}/{transactionId}`
  - Live: `https://payments.bankalfalah.com/HS/api/IPN/OrderStatus/{merchantId}/{storeId}/{transactionId}`

---

## Support

For technical support:
- Contact Alfa Bank merchant support
- Email: Your registered merchant email
- Portal: https://merchants.bankalfalah.com/merchantportal

For application issues:
- Check logs: `pnpm dev`
- Review implementation against this guide
- Test with `/api/payment/test` endpoint
