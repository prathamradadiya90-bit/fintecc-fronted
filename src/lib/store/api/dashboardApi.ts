import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { DashboardStatsResponse } from '../../types/dashboard.types';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth('/dashboard'),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => '/',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
