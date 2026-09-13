import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface AiChatRequest {
  message: string;
}

export interface AiChatResponse {
  success: boolean;
  data: {
    response: string;
  };
  message?: string;
}

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: baseQueryWithReauth('/ai'),
  tagTypes: ['AiChat'],
  endpoints: (builder) => ({
    sendAiMessage: builder.mutation<AiChatResponse, AiChatRequest>({
      query: (body) => ({
        url: '/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendAiMessageMutation } = aiApi;
