import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { AuditLogsResponse, AuditLogFilters } from '../../types/audit.types';

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: baseQueryWithReauth('/audit-logs'),
  tagTypes: ['AuditLog'],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogsResponse, AuditLogFilters | void>({
      query: (filters) => ({
        url: '/',
        params: filters || {},
      }),
      providesTags: ['AuditLog'],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
