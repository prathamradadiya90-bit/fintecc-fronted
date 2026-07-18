import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  VerifyOTPRequest,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendOtpRequest,
  InviteStaffRequest,
  UpdateStaffRequest
} from '../../types/auth.types';
import { setCredentials } from '../features/auth/authSlice';

import { baseQueryWithReauth } from './baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth('/auth'),
  tagTypes: ['Staff'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse<{ email: string }>, RegisterRequest>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<AuthResponse<{ user: User }>, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch {
          // Let the component handle login errors
        }
      },
    }),
    verifyRegistration: builder.mutation<AuthResponse<{ user: User }>, VerifyOTPRequest>({
      query: (credentials) => ({
        url: '/register/verify',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch {
          // Let the component handle verification errors
        }
      },
    }),
    resendOtp: builder.mutation<AuthResponse<null>, ResendOtpRequest>({
      query: (data) => ({
        url: '/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation<AuthResponse<{ email: string }>, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<AuthResponse<null>, ResetPasswordRequest>({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation<AuthResponse<null>, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    getMe: builder.query<AuthResponse<User>, void>({
      query: () => '/me',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data) {
            dispatch(setCredentials({ user: data.data }));
          }
        } catch {
          // Ignore error, means user is not authenticated
        }
      }
    }),
    getStaff: builder.query<AuthResponse<User[]>, void>({
      query: () => '/staff',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Staff' as const, id })),
              { type: 'Staff', id: 'LIST' },
            ]
          : [{ type: 'Staff', id: 'LIST' }],
    }),
    inviteStaff: builder.mutation<AuthResponse<{ email: string; role: string }>, InviteStaffRequest>({
      query: (body) => ({
        url: '/invite-staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    updateStaff: builder.mutation<AuthResponse<User>, UpdateStaffRequest>({
      query: ({ id, ...body }) => ({
        url: `/staff/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        { type: 'Staff', id: 'LIST' },
      ],
    }),
    deleteStaff: builder.mutation<AuthResponse<null>, string>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyRegistrationMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetStaffQuery,
  useInviteStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = authApi;
