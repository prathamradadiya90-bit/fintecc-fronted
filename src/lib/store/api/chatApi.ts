import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  ChatMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  MarkAsReadResponse,
  UploadFileResponse,
} from '../../types/chat.types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth('/chat'),
  tagTypes: ['ChatMessage'],
  endpoints: (builder) => ({
    getMessages: builder.query<ChatMessagesResponse, string>({
      query: (clientId) => `/${clientId}`,
      providesTags: (_result, _error, clientId) => [
        { type: 'ChatMessage', id: `LIST_${clientId}` },
      ],
    }),

    sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: ({ clientId, ...body }) => ({
        url: `/${clientId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: 'ChatMessage', id: `LIST_${clientId}` },
      ],
    }),

    markAsRead: builder.mutation<MarkAsReadResponse, string>({
      query: (clientId) => ({
        url: `/${clientId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, clientId) => [
        { type: 'ChatMessage', id: `LIST_${clientId}` },
      ],
    }),

    /**
     * Upload a file via the generic /upload endpoint.
     * Returns the server-relative filePath to be used as attachmentUrl in chat messages.
     * Uses a custom queryFn because the baseQuery is scoped to /chat.
     */
    uploadChatAttachment: builder.mutation<UploadFileResponse, FormData>({
      queryFn: async (formData) => {
        try {
          const response = await fetch(`${apiBaseUrl}/upload`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({ message: 'Upload failed' }));
            return { error: { status: response.status, data } };
          }

          const data = await response.json();
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useUploadChatAttachmentMutation,
} = chatApi;
