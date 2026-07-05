import React from 'react';
import { Table, Column } from '@/components/ui/Table';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AmortizationRow, formatCurrencyExact } from '@/lib/utils/loanCalculator';

interface AmortizationScheduleProps {
  schedule: AmortizationRow[];
}

export function AmortizationSchedule({ schedule }: AmortizationScheduleProps) {
  
  // Create columns for the existing Table component
  const columns: Column<AmortizationRow>[] = [
    {
      key: 'month',
      header: 'Month',
      render: (row) => (
        <span className="font-medium text-slate-700">
          {row.month.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'openingBalance',
      header: 'Opening Balance',
      render: (row) => <span className="text-slate-500">{formatCurrencyExact(row.openingBalance)}</span>,
    },
    {
      key: 'emi',
      header: 'EMI',
      render: (row) => <span className="font-semibold text-slate-800">{formatCurrencyExact(row.emi)}</span>,
    },
    {
      key: 'principal',
      header: 'Principal',
      render: (row) => <span className="font-semibold text-[#00C2B3]">{formatCurrencyExact(row.principal)}</span>,
    },
    {
      key: 'interest',
      header: 'Interest',
      render: (row) => <span className="font-semibold text-amber-500">{formatCurrencyExact(row.interest)}</span>,
    },
    {
      key: 'closingBalance',
      header: 'Closing Balance',
      render: (row) => <span className="text-slate-500">{formatCurrencyExact(row.closingBalance)}</span>,
    },
  ];

  const handleDownloadCSV = () => {
    // Basic CSV download implementation
    const headers = ['Month', 'Opening Balance', 'EMI', 'Principal', 'Interest', 'Closing Balance'];
    const rows = schedule.map(r => [
      r.month.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      r.openingBalance.toFixed(2),
      r.emi.toFixed(2),
      r.principal.toFixed(2),
      r.interest.toFixed(2),
      r.closingBalance.toFixed(2)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "amortization_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Amortization Schedule</h3>
          <p className="text-sm text-slate-500">Month-by-month breakup of your loan repayment.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadCSV}>
            <Download className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto rounded-xl border border-slate-100 print:max-h-none print:overflow-visible print:border-none">
        <Table 
          data={schedule}
          columns={columns}
          keyExtractor={(item, index) => `month-${index}`}
        />
      </div>
    </div>
  );
}
