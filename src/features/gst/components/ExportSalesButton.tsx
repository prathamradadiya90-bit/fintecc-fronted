import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ExportSalesButtonProps {
  year?: number;
  className?: string;
}

export const ExportSalesButton: React.FC<ExportSalesButtonProps> = ({
  year = new Date().getFullYear(),
  className = '',
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiBaseUrl}/gst/export-sales?year=${year}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export sales report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GST_Sales_Report_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export sales error:', error);
      alert('Failed to export GST sales report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      isLoading={loading}
      leftIcon={<Download className="w-4 h-4 text-[#00C2B3]" />}
      className={className}
    >
      Export Sales Excel ({year})
    </Button>
  );
};
