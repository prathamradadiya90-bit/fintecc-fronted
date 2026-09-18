import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { dispatchUsageLimitError } from '@/providers/UsageLimitProvider';
import { dispatchProductionApiError } from '@/providers/ProductionApiErrorProvider';

// A dynamic base query that can be extended with a specific path
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const createBaseQuery = (path: string) => fetchBaseQuery({
  baseUrl: `${apiBaseUrl}${path}`,
  credentials: 'include'
});

function checkAndDispatchUsageLimit(error: FetchBaseQueryError) {
  if (!error) return;
  const errorData = error.data as any;
  const rawMessage =
    typeof errorData === 'string'
      ? errorData
      : errorData?.message || errorData?.error || '';

  if (typeof rawMessage === 'string') {
    if (rawMessage.includes('ACCESS_DENIED')) {
      const cleanMessage = rawMessage.replace(/^ACCESS_DENIED:\s*/i, '');
      dispatchUsageLimitError({
        message: cleanMessage || 'Firm does not have an active subscription. Please subscribe to a plan to continue.',
        type: 'ACCESS_DENIED',
        title: 'Active Subscription Required',
      });
    } else if (rawMessage.includes('LIMIT_EXCEEDED')) {
      const cleanMessage = rawMessage.replace(/^LIMIT_EXCEEDED:\s*/i, '');
      dispatchUsageLimitError({
        message: cleanMessage || 'AI usage credit or resource limit exceeded for the current billing cycle. Upgrade your plan.',
        type: 'LIMIT_EXCEEDED',
        title: 'AI Quota / Usage Limit Exceeded',
      });
    } else if (rawMessage.includes('Plan Limit Reached')) {
      dispatchUsageLimitError({
        message: rawMessage,
        type: 'PLAN_LIMIT',
        title: 'Subscription Limit Reached',
      });
    }
  }
}

function checkAndDispatchProductionApiError(error: FetchBaseQueryError) {
  if (!error) return;
  const errorData = error.data as any;
  const rawMessage =
    typeof errorData === 'string'
      ? errorData
      : errorData?.message || errorData?.error || '';

  if (typeof rawMessage === 'string' && rawMessage.trim()) {
    const lower = rawMessage.toLowerCase();
    // Intercept missing third-party keys (e.g., Razorpay, Surepass, Sandbox, Twilio, WhatsApp)
    if (
      lower.includes('production api key') ||
      (lower.includes('api key') && (lower.includes('missing') || lower.includes('not configured')))
    ) {
      dispatchProductionApiError({
        message: rawMessage,
      });
    }
  }
}

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

  // Intercept usage limit and access denied errors globally
  if (result.error) {
    checkAndDispatchUsageLimit(result.error);
    checkAndDispatchProductionApiError(result.error);
  }

  return result;
};

