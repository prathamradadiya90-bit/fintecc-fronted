import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { BankStatementResponse } from '../../types/bankStatement.types';

export const bankStatementsApi = createApi({
  reducerPath: 'bankStatementsApi',
  baseQuery: baseQueryWithReauth('/bank-statements'),
  tagTypes: ['BankStatement'],
  endpoints: (builder) => ({
    uploadBankStatement: builder.mutation<BankStatementResponse, FormData>({
      query: (body) => ({
        url: '/convert?format=json',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useUploadBankStatementMutation } = bankStatementsApi;
