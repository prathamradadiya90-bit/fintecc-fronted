import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedTasksResponse,
  TaskResponse,
  GetTasksParams,
  CreateTaskRequest,
  UpdateTaskRequest,
  BulkUpdateTasksRequest,
  MasterExcelImportResponse,
  KanbanBoardResponse,
  CalendarViewResponse,
  ComplianceAnalyticsResponse,
  SubmitReviewRequest,
  ReviewTaskRequest,
  LogTimeRequest,
  RescheduleTaskRequest,
  AiFilterRequest,
  VerifyGstPortalResponse,
  ProcessRecurringResponse,
  TaskComment,
  TimeLogEntry,
  Task,
} from '../../types/task.types';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: baseQueryWithReauth('/tasks'),
  tagTypes: ['Task', 'Kanban', 'Analytics', 'Calendar', 'Comments'],
  endpoints: (builder) => ({
    getTasks: builder.query<PaginatedTasksResponse, GetTasksParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    getTaskById: builder.query<TaskResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),

    createTask: builder.mutation<TaskResponse, CreateTaskRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Analytics' },
        { type: 'Calendar' },
      ],
    }),

    updateTask: builder.mutation<TaskResponse, { id: string; data: UpdateTaskRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Analytics' },
        { type: 'Calendar' },
      ],
    }),

    bulkUpdateTasks: builder.mutation<{ success: boolean; data: { count: number }; message: string }, BulkUpdateTasksRequest>({
      query: (body) => ({
        url: '/bulk-update',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Analytics' },
        { type: 'Calendar' },
      ],
    }),

    deleteTask: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Analytics' },
        { type: 'Calendar' },
      ],
    }),

    importMasterExcel: builder.mutation<MasterExcelImportResponse, FormData>({
      query: (formData) => ({
        url: '/master-excel-import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Analytics' },
        { type: 'Calendar' },
      ],
    }),

    // Visual Views
    getKanban: builder.query<
      KanbanBoardResponse,
      { clientId?: string; assigneeId?: string; search?: string; branchId?: string } | void
    >({
      query: (params) => ({
        url: '/kanban',
        params: params || {},
      }),
      providesTags: ['Kanban'],
    }),

    getWeekView: builder.query<{ success: boolean; data: Task[] }, { startDate?: string; endDate?: string } | void>({
      query: (params) => ({
        url: '/week-view',
        params: params || {},
      }),
      providesTags: ['Task'],
    }),

    getCalendarView: builder.query<
      CalendarViewResponse,
      { month?: number; year?: number; startDate?: string; endDate?: string; clientId?: string; assigneeId?: string; complianceType?: string } | void
    >({
      query: (params) => ({
        url: '/calendar-view',
        params: params || {},
      }),
      providesTags: ['Calendar'],
    }),

    // Compliance Analytics
    getComplianceAnalytics: builder.query<
      ComplianceAnalyticsResponse,
      { branchId?: string; returnType?: string } | void
    >({
      query: (params) => ({
        url: '/compliance-analytics',
        params: params || {},
      }),
      providesTags: ['Analytics'],
    }),

    // AI Filter
    filterTasksWithAi: builder.mutation<PaginatedTasksResponse, AiFilterRequest>({
      query: (body) => ({
        url: '/ai-filter',
        method: 'POST',
        body,
      }),
    }),

    // Maker-Checker
    submitForReview: builder.mutation<TaskResponse, { id: string; data: SubmitReviewRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}/submit-review`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Analytics' },
      ],
    }),

    reviewTask: builder.mutation<TaskResponse, { id: string; data: ReviewTaskRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}/review`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Analytics' },
        { type: 'Calendar' },
      ],
    }),

    // Collaboration & Comments
    getComments: builder.query<{ success: boolean; data: TaskComment[] }, string>({
      query: (id) => `/${id}/comments`,
      providesTags: (_res, _err, id) => [{ type: 'Comments', id }],
    }),

    addComment: builder.mutation<
      { success: boolean; data: TaskComment },
      { id: string; data: { text: string; attachments?: string[] } }
    >({
      query: ({ id, data }) => ({
        url: `/${id}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Comments', id },
        { type: 'Task', id },
      ],
    }),

    addWorkingUser: builder.mutation<TaskResponse, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/${id}/working-users`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Task', id }],
    }),

    removeWorkingUser: builder.mutation<TaskResponse, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/${id}/working-users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Task', id }],
    }),

    // Time Tracking & Reschedule
    logTime: builder.mutation<
      { success: boolean; data: { task: Task; logEntry: TimeLogEntry } },
      { id: string; data: LogTimeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/${id}/log-time`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Task', id },
        { type: 'Analytics' },
      ],
    }),

    rescheduleTask: builder.mutation<TaskResponse, { id: string; data: RescheduleTaskRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}/reschedule`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Calendar' },
      ],
    }),

    // Automated Recurring process trigger
    triggerRecurringTasks: builder.mutation<ProcessRecurringResponse, void>({
      query: () => ({
        url: '/recurring/process',
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
        { type: 'Calendar' },
        { type: 'Analytics' },
      ],
    }),

    // Live GST Portal Status Verification
    verifyGstPortal: builder.mutation<VerifyGstPortalResponse, string>({
      query: (id) => ({
        url: `/${id}/verify-gst-portal`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        { type: 'Kanban' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useBulkUpdateTasksMutation,
  useDeleteTaskMutation,
  useImportMasterExcelMutation,
  useGetKanbanQuery,
  useGetWeekViewQuery,
  useGetCalendarViewQuery,
  useGetComplianceAnalyticsQuery,
  useFilterTasksWithAiMutation,
  useSubmitForReviewMutation,
  useReviewTaskMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useAddWorkingUserMutation,
  useRemoveWorkingUserMutation,
  useLogTimeMutation,
  useRescheduleTaskMutation,
  useTriggerRecurringTasksMutation,
  useVerifyGstPortalMutation,
} = tasksApi;

