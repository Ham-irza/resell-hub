/**
 * Alfa Payment Gateway TypeScript Types
 * Shared interfaces for payment processing
 */

export interface PaymentInitiateRequest {
  orderId: string;
  amount: number; // Amount in PKR (not cents)
  description?: string;
  returnUrl?: string;
}

export interface PaymentFormData {
  MerchantId: string;
  StoreID: string;
  TransactionID: string;
  Amount: number; // Amount in cents
  Description: string;
  ReturnURL: string;
  PostURL: string;
  ExpireDate: string;
  CharacterEncoding: string;
  CurrencyCode: string;
  RequestHash: string;
  apiUrl: string;
  isTest: boolean;
}

export interface PaymentInitiateResponse {
  success: boolean;
  type: 'HOSTED_REDIRECT' | 'ERROR';
  formData: PaymentFormData;
  orderId: string;
  message?: string;
}

export interface PaymentCallbackRequest {
  MerchantId: string;
  StoreID: string;
  TransactionID: string;
  Amount: number; // In cents
  Status: 'SUCCESS' | 'APPROVED' | 'FAILED' | 'CANCELLED' | 'PENDING';
  ResponseHash: string;
  BankReference?: string;
  AuthCode?: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentStatus: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED' | 'NOT_STARTED';
  transactionId?: string;
  ipnUrl?: string;
  amount: number;
}

export interface PaymentTestResponse {
  success: boolean;
  message: string;
  merchantId: string;
  storeId: string;
  apiUrl: string;
  mode: 'TEST' | 'LIVE';
  credentialsConfigured: boolean;
}

// Helper functions for the frontend

/**
 * Format amount from PKR to cents for payment gateway
 */
export function formatAmountToCents(amountInPKR: number): number {
  return Math.round(amountInPKR * 100);
}

/**
 * Format amount from cents back to PKR
 */
export function formatCentsToAmount(amountInCents: number): number {
  return amountInCents / 100;
}

/**
 * Initiate a payment transaction
 */
export async function initiatePayment(
  request: PaymentInitiateRequest,
  token: string
): Promise<PaymentInitiateResponse> {
  const response = await fetch('/api/payment/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Payment initiation failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get payment status for an order
 */
export async function getPaymentStatus(
  orderId: string,
  token: string
): Promise<PaymentStatusResponse> {
  const response = await fetch(`/api/payment/status/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Test payment gateway configuration
 */
export async function testPaymentGateway(): Promise<PaymentTestResponse> {
  const response = await fetch('/api/payment/test');

  if (!response.ok) {
    throw new Error('Failed to test payment gateway');
  }

  return response.json();
}
