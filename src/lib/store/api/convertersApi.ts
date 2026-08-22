import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { ExcelToJsonResponse, ReceiptOcrResponse } from '../../types/converter.types';

export const convertersApi = createApi({
  reducerPath: 'convertersApi',
  baseQuery: baseQueryWithReauth(''),
  tagTypes: ['Converters'],
  endpoints: (builder) => ({
    convertExcelToJson: builder.mutation<ExcelToJsonResponse, { file: FormData; allSheets?: boolean }>({
      query: ({ file, allSheets = false }) => ({
        url: `/converters/excel-to-json?allSheets=${allSheets}`,
        method: 'POST',
        body: file,
      }),
    }),

    convertJsonToExcel: builder.mutation<Blob, { data: any[]; sheetName?: string; filename?: string }>({
      query: (body) => ({
        url: '/converters/json-to-excel',
        method: 'POST',
        body,
        responseHandler: (response) => response.blob(),
      }),
    }),

    scanReceipt: builder.mutation<ReceiptOcrResponse, FormData>({
      query: (formData) => ({
        url: '/ocr/scan-receipt',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useConvertExcelToJsonMutation,
  useConvertJsonToExcelMutation,
  useScanReceiptMutation,
} = convertersApi;
