'use client';

import React from 'react';
import { GstStatutoryCatalogTable } from '@/features/gst/components/GstStatutoryCatalogTable';

export default function GstCatalogPage() {
  return (
    <div className="space-y-4">
      <GstStatutoryCatalogTable />
    </div>
  );
}
