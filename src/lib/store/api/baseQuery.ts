import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

// A dynamic base query that can be extended with a specific path
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const createBaseQuery = (path: string) => fetchBaseQuery({
  baseUrl: `${apiBaseUrl}${path}`,
  credentials: 'include'
});

export const baseQueryWithReauth = (path: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => async (args, api, extraOptions) => {
  const baseQuery = createBaseQuery(path);
  let result = await baseQuery(args, api, extraOptions);
  const requestUrl = typeof args === 'string' ? args : args.url;
  const shouldSkipRefresh = [
    '/login',
    '/register',
    '/register/verify',
    '/forgot-password',
    '/reset-password',
    '/logout',
    '/refresh',
  ].includes(requestUrl);

  if (result.error && result.error.status === 401 && !shouldSkipRefresh) {
    // try to get a new token
    const refreshQuery = createBaseQuery('/auth');
    const refreshResult = await refreshQuery(
      { url: '/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry the initial query
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};
