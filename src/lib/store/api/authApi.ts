import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  VerifyOTPRequest,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../../types/auth.types';
import { setCredentials } from '../features/auth/authSlice';

import { baseQueryWithReauth } from './baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth('/auth'),
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
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyRegistrationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetMeQuery
} = authApi;
