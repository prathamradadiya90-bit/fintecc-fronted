import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface ContactUsPayload {
  email: string;
  message: string;
}

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: baseQueryWithReauth('/contact-us'),
  endpoints: (builder) => ({
    createContactMessage: builder.mutation<any, ContactUsPayload>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreateContactMessageMutation } = contactApi;
