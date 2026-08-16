export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMonths: number;
  features: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  firmId: string;
  planId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  status: 'pending' | 'active' | 'failed' | 'expired';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  features?: string[];
  isActive?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  features?: string[];
  isActive?: boolean;
}

export interface CreateOrderRequest {
  planId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  subscriptionId: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
