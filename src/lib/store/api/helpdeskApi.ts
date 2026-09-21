import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedTicketsResponse,
  TicketResponse,
  TicketRepliesResponse,
  TicketReplyResponse,
  GetTicketsParams,
  CreateTicketRequest,
  UpdateTicketRequest,
  AddReplyRequest,
} from '../../types/helpdesk.types';

export const helpdeskApi = createApi({
  reducerPath: 'helpdeskApi',
  baseQuery: baseQueryWithReauth('/helpdesk'),
  tagTypes: ['Ticket', 'TicketReply'],
  endpoints: (builder) => ({
    getTickets: builder.query<PaginatedTicketsResponse, GetTicketsParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Ticket' as const, id })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),

    getTicketById: builder.query<TicketResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),

    createTicket: builder.mutation<TicketResponse, CreateTicketRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),

    updateTicket: builder.mutation<TicketResponse, { id: string; data: UpdateTicketRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),

    getTicketReplies: builder.query<TicketRepliesResponse, string>({
      query: (ticketId) => `/${ticketId}/replies`,
      providesTags: (_result, _error, ticketId) => [
        { type: 'TicketReply', id: ticketId },
      ],
    }),

    addTicketReply: builder.mutation<TicketReplyResponse, { ticketId: string; data: AddReplyRequest }>({
      query: ({ ticketId, data }) => ({
        url: `/${ticketId}/replies`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: 'TicketReply', id: ticketId },
        { type: 'Ticket', id: ticketId },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useGetTicketRepliesQuery,
  useAddTicketReplyMutation,
} = helpdeskApi;
