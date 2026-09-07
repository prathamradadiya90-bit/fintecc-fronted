export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: 'MONTHLY' | 'ANNUALLY';
  trialDays: number;
  // Hard limits (null = unlimited)
  clientLimit: number | null;
  userLimit: number | null;
  gstFilingLimit: number | null;
  aiCreditLimit: number | null;
  storageLimitMb: number | null;
  invoiceLimit: number | null;
  features: string[] | null;
  isActive: boolean;
  razorpayPlanId: string | null;
  createdAt: string;
  updatedAt: string;
  // Legacy field (some older responses may include it)
  durationMonths?: number;
}

export type SubscriptionStatus =
  | 'pending'
  | 'active'
  | 'failed'
  | 'expired'
  | 'halted'
  | 'cancelled';

export interface Subscription {
  id: string;
  firmId: string;
  planId: string;
  // Razorpay identifiers — subscription-based flow
  razorpaySubscriptionId: string | null;
  razorpayOrderId: string | null; // legacy, kept for backward compatibility
  razorpayPaymentId: string | null;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  // Billing
  autoRenew: boolean;
  nextBillingDate: string | null;
  couponCode: string | null;
  discountAmount: number;
  failureReason: string | null;
  // Live usage trackers (reset each billing cycle)
  currentAiCreditsUsed: number;
  currentStorageUsedMb: number;
  currentGstFilings: number;
  currentInvoicesGenerated: number;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price: number;
  billingCycle?: 'MONTHLY' | 'ANNUALLY';
  trialDays?: number;
  clientLimit?: number | null;
  userLimit?: number | null;
  gstFilingLimit?: number | null;
  aiCreditLimit?: number | null;
  storageLimitMb?: number | null;
  invoiceLimit?: number | null;
  features?: string[];
  isActive?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: 'MONTHLY' | 'ANNUALLY';
  trialDays?: number;
  clientLimit?: number | null;
  userLimit?: number | null;
  gstFilingLimit?: number | null;
  aiCreditLimit?: number | null;
  storageLimitMb?: number | null;
  invoiceLimit?: number | null;
  features?: string[];
  isActive?: boolean;
}

export interface CreateOrderRequest {
  planId: string;
}

/**
 * Response from POST /plans/create-order for paid plans.
 * Backend now uses Razorpay Subscriptions instead of Orders.
 */
export interface CreateOrderResponse {
  /** Internal DB subscription ID */
  subscriptionId: string;
  /** Razorpay Subscription ID (sub_xxx) — pass to Razorpay checkout */
  razorpaySubscriptionId: string;
  /** Razorpay key to initialize the checkout */
  key: string;
  key_id: string;
  razorpayKeyId: string;
  keyId: string;
}

/**
 * Verification payload for POST /plans/verify-payment.
 * Uses subscriptionId instead of orderId since we moved to Razorpay Subscriptions.
 */
export interface VerifyPaymentRequest {
  razorpaySubscriptionId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface MySubscriptionData {
  hasActivePlan: boolean;
  hasUsedFreePlan: boolean;
  subscription: Subscription | null;
  activePlan: Plan | null;
}
