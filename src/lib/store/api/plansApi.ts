import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { 
  Plan, 
  Subscription, 
  CreatePlanRequest, 
  UpdatePlanRequest, 
  CreateOrderRequest, 
  CreateOrderResponse, 
  VerifyPaymentRequest,
  MySubscriptionData
} from '../../types/plan.types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const plansApi = createApi({
  reducerPath: 'plansApi',
  baseQuery: baseQueryWithReauth('/plans'),
  tagTypes: ['Plans', 'PublicPlans', 'Subscription'],
  endpoints: (builder) => ({
    // Public Endpoints
    getPublicPlans: builder.query<ApiResponse<Plan[]>, void>({
      query: () => '/public',
      providesTags: ['PublicPlans'],
    }),

    // Customer / Firm Subscription Status
    getMySubscription: builder.query<ApiResponse<MySubscriptionData>, void>({
      query: () => '/my-subscription',
      providesTags: ['Subscription'],
    }),

    // Super Admin Endpoints
    getAllPlans: builder.query<ApiResponse<Plan[]>, void>({
      query: () => '/all',
      providesTags: ['Plans'],
    }),
    createPlan: builder.mutation<ApiResponse<Plan>, CreatePlanRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Plans', 'PublicPlans'],
    }),
    updatePlan: builder.mutation<ApiResponse<Plan>, { id: string; data: UpdatePlanRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Plans', 'PublicPlans'],
    }),
    deletePlan: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plans', 'PublicPlans'],
    }),

    // Customer/Firm Owner Endpoints
    createOrder: builder.mutation<ApiResponse<CreateOrderResponse>, CreateOrderRequest>({
      query: (body) => ({
        url: '/create-order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),
    verifyPayment: builder.mutation<ApiResponse<Subscription>, VerifyPaymentRequest>({
      query: (body) => ({
        url: '/verify-payment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetPublicPlansQuery,
  useGetMySubscriptionQuery,
  useGetAllPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} = plansApi;

