import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  MessageTemplate,
  CreateMessageTemplatePayload,
  UpdateMessageTemplatePayload,
  BulkCampaign,
  CreateBulkCampaignPayload,
  UpdateBulkCampaignPayload,
} from '@/lib/types/communication.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const communicationApi = createApi({
  reducerPath: 'communicationApi',
  baseQuery: baseQueryWithReauth('/communication'),
  tagTypes: ['Campaign', 'Template'],
  endpoints: (builder) => ({
    // Campaigns
    getCampaigns: builder.query<ApiResponse<BulkCampaign[]>, void>({
      query: () => '/campaigns',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Campaign' as const, id })),
              { type: 'Campaign', id: 'LIST' },
            ]
          : [{ type: 'Campaign', id: 'LIST' }],
    }),

    getCampaignById: builder.query<ApiResponse<BulkCampaign>, string>({
      query: (id) => `/campaigns/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),

    createCampaign: builder.mutation<ApiResponse<BulkCampaign>, CreateBulkCampaignPayload>({
      query: (body) => ({
        url: '/campaigns',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),

    updateCampaign: builder.mutation<ApiResponse<BulkCampaign>, { id: string; data: UpdateBulkCampaignPayload }>({
      query: ({ id, data }) => ({
        url: `/campaigns/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Campaign', id },
        { type: 'Campaign', id: 'LIST' },
      ],
    }),

    deleteCampaign: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),

    sendCampaign: builder.mutation<ApiResponse<BulkCampaign>, string>({
      query: (id) => ({
        url: `/campaigns/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Campaign', id },
        { type: 'Campaign', id: 'LIST' },
      ],
    }),

    // Templates
    getTemplates: builder.query<ApiResponse<MessageTemplate[]>, { channel?: string } | void>({
      query: (params) => ({
        url: '/templates',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Template' as const, id })),
              { type: 'Template', id: 'LIST' },
            ]
          : [{ type: 'Template', id: 'LIST' }],
    }),

    getTemplateById: builder.query<ApiResponse<MessageTemplate>, string>({
      query: (id) => `/templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Template', id }],
    }),

    createTemplate: builder.mutation<ApiResponse<MessageTemplate>, CreateMessageTemplatePayload>({
      query: (body) => ({
        url: '/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Template', id: 'LIST' }],
    }),

    updateTemplate: builder.mutation<ApiResponse<MessageTemplate>, { id: string; data: UpdateMessageTemplatePayload }>({
      query: ({ id, data }) => ({
        url: `/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Template', id },
        { type: 'Template', id: 'LIST' },
      ],
    }),

    deleteTemplate: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Template', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useSendCampaignMutation,
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = communicationApi;
