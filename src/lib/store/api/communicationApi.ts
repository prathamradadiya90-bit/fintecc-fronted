import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  MessageTemplate,
  CreateMessageTemplatePayload,
  UpdateMessageTemplatePayload,
  BulkCampaign,
  CreateBulkCampaignPayload,
  UpdateBulkCampaignPayload,
  EmailBroadcastPayload,
  SegmentPreviewPayload,
  SegmentPreviewResponse,
  DueReminderBroadcastPayload,
  DueReminderResult,
  NotificationRule,
  CreateNotificationRulePayload,
  UpdateNotificationRulePayload,
  EvaluateRuleResult,
  TrackingStatsData,
  AutoFollowUpPayload,
  AutoFollowUpResult,
} from '@/lib/types/communication.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const communicationApi = createApi({
  reducerPath: 'communicationApi',
  baseQuery: baseQueryWithReauth('/communication'),
  tagTypes: ['Campaign', 'Template', 'NotificationRule', 'Tracking'],
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
        { type: 'Tracking', id: 'STATS' },
      ],
    }),

    // --- Broadcasts & Due Reminders ---
    sendEmailBroadcast: builder.mutation<ApiResponse<BulkCampaign>, EmailBroadcastPayload>({
      query: (body) => ({
        url: '/broadcasts/email',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Campaign', id: 'LIST' },
        { type: 'Tracking', id: 'STATS' },
      ],
    }),

    previewSegment: builder.mutation<ApiResponse<SegmentPreviewResponse>, SegmentPreviewPayload>({
      query: (body) => ({
        url: '/broadcasts/preview',
        method: 'POST',
        body,
      }),
    }),

    sendDueReminders: builder.mutation<ApiResponse<DueReminderResult>, DueReminderBroadcastPayload>({
      query: (body) => ({
        url: '/broadcasts/due-reminders',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Campaign', id: 'LIST' },
        { type: 'Tracking', id: 'STATS' },
      ],
    }),

    // --- Notification Rules ---
    getNotificationRules: builder.query<ApiResponse<NotificationRule[]>, void>({
      query: () => '/rules',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'NotificationRule' as const, id })),
              { type: 'NotificationRule', id: 'LIST' },
            ]
          : [{ type: 'NotificationRule', id: 'LIST' }],
    }),

    getNotificationRuleById: builder.query<ApiResponse<NotificationRule>, string>({
      query: (id) => `/rules/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'NotificationRule', id }],
    }),

    createNotificationRule: builder.mutation<ApiResponse<NotificationRule>, CreateNotificationRulePayload>({
      query: (body) => ({
        url: '/rules',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'NotificationRule', id: 'LIST' }],
    }),

    updateNotificationRule: builder.mutation<
      ApiResponse<NotificationRule>,
      { id: string; data: UpdateNotificationRulePayload }
    >({
      query: ({ id, data }) => ({
        url: `/rules/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'NotificationRule', id },
        { type: 'NotificationRule', id: 'LIST' },
      ],
    }),

    deleteNotificationRule: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'NotificationRule', id: 'LIST' }],
    }),

    evaluateNotificationRule: builder.mutation<ApiResponse<EvaluateRuleResult>, string>({
      query: (id) => ({
        url: `/rules/${id}/evaluate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Tracking', id: 'STATS' }],
    }),

    evaluateAllNotificationRules: builder.mutation<ApiResponse<{ message?: string; evaluatedCount?: number }>, void>({
      query: () => ({
        url: '/rules/evaluate-all',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Tracking', id: 'STATS' }],
    }),

    // --- Delivery & Read Tracking ---
    getTrackingStats: builder.query<
      ApiResponse<TrackingStatsData>,
      { campaignId?: string; returnType?: string; daysBack?: number } | void
    >({
      query: (params) => ({
        url: '/tracking/stats',
        params: params || {},
      }),
      providesTags: [{ type: 'Tracking', id: 'STATS' }],
    }),

    triggerAutoFollowUp: builder.mutation<ApiResponse<AutoFollowUpResult>, AutoFollowUpPayload>({
      query: (params) => ({
        url: '/auto-follow-up',
        method: 'POST',
        params,
      }),
      invalidatesTags: [{ type: 'Tracking', id: 'STATS' }],
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
  useSendEmailBroadcastMutation,
  usePreviewSegmentMutation,
  useSendDueRemindersMutation,
  useGetNotificationRulesQuery,
  useGetNotificationRuleByIdQuery,
  useCreateNotificationRuleMutation,
  useUpdateNotificationRuleMutation,
  useDeleteNotificationRuleMutation,
  useEvaluateNotificationRuleMutation,
  useEvaluateAllNotificationRulesMutation,
  useGetTrackingStatsQuery,
  useTriggerAutoFollowUpMutation,
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = communicationApi;
