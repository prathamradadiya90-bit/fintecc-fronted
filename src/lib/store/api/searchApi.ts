import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { GlobalSearchResponse } from '../../types/search.types';

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: baseQueryWithReauth('/search'),
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    globalSearch: builder.query<GlobalSearchResponse, string>({
      query: (q) => ({
        url: '/',
        params: { q },
      }),
    }),
  }),
});

export const { useGlobalSearchQuery, useLazyGlobalSearchQuery } = searchApi;
