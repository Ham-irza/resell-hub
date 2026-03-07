/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Plan configuration interface
 */
export interface Plan {
  name: string;
  price: number;
  returnPercentage: number;
  totalItems: number;
  dailyMinSales: number;
  dailyMaxSales: number;
  durationDays: number;
}

/**
 * User subscription status
 */
export interface UserSubscription {
  currentPlan: string | null;
  planActivatedAt: Date | null;
  planExpiresAt: Date | null;
  hasCompletedFirstPurchase: boolean;
  subscriptionStatus: 'inactive' | 'active' | 'expired';
}

/**
 * Plan purchase request
 */
export interface PlanPurchaseRequest {
  planName: string;
  paymentMethod?: 'wallet' | 'payment_gateway';
}

/**
 * Plan purchase response
 */
export interface PlanPurchaseResponse {
  success: boolean;
  message: string;
  orderId?: string;
  checkoutUrl?: string;
  authToken?: string;
  returnUrl?: string;
  error?: string;
}
