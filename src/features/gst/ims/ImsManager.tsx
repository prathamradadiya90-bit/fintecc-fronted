import React, { useState } from 'react';
import { Send, RefreshCw, LayoutList, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImsDocumentSummary } from './ImsDocumentSummary';
import { ImsVoucherView } from './ImsVoucherView';
import { ImsVendorView } from './ImsVendorView';
import { 
  useGetImsSummaryQuery, 
  useGetImsInvoicesQuery, 
  useGetImsVendorsQuery,
  useSubmitImsTbsMutation
} from '@/lib/store/api/gstApi';

interface ImsManagerProps {
  clientId: string;
  period?: string;
}

export const ImsManager: React.FC<ImsManagerProps> = ({ clientId, period }) => {
  const [viewMode, setViewMode] = useState<'vouchers' | 'vendors'>('vouchers');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { 
    data: summaryRes, 
    isLoading: isSummaryLoading, 
    refetch: refetchSummary 
  } = useGetImsSummaryQuery({ clientId, period }, { skip: !clientId });

  const {
    data: invoicesRes,
    isLoading: isInvoicesLoading,
    refetch: refetchInvoices
  } = useGetImsInvoicesQuery(
    {
      clientId,
      period,
      action: selectedAction === 'TBS' ? undefined : selectedAction,
      isTbs: selectedAction === 'TBS' ? true : undefined,
      search: searchTerm || undefined,
      limit: 100,
    },
    { skip: !clientId }
  );

  const {
    data: vendorsRes,
    isLoading: isVendorsLoading,
    refetch: refetchVendors
  } = useGetImsVendorsQuery({ clientId, period }, { skip: !clientId });

  const [submitTbsApi, { isLoading: isSubmittingTbs }] = useSubmitImsTbsMutation();

  const handleRefreshAll = () => {
    refetchSummary();
    refetchInvoices();
    refetchVendors();
  };

  const handleSubmitTbs = async () => {
    const tbsCount = summaryRes?.data?.tbsCount || 0;
    if (tbsCount === 0) {
      alert('No staged actions to submit. Accept, reject, or mark pending any invoice first.');
      return;
    }

    if (!confirm(`Are you sure you want to submit ${tbsCount} staged IMS actions to the GST Portal?`)) {
      return;
    }

    try {
      const res = await submitTbsApi({ clientId, period }).unwrap();
      alert(res.message || 'Successfully submitted IMS actions to GST portal!');
      handleRefreshAll();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit TBS actions');
    }
  };

  const tbsCount = summaryRes?.data?.tbsCount || 0;

  return (
    <div className="space-y-5">
      {/* Top Banner & Submit to Portal */}
      <div
        className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-heading)]">
              Invoice Management System (IMS)
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Review, Accept, Reject, or Pend outward supplier invoices before GSTR-2B generation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync / Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={handleSubmitTbs}
            isLoading={isSubmittingTbs}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit to Portal {tbsCount > 0 ? `(${tbsCount} Staged)` : ''}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ImsDocumentSummary
        summary={summaryRes?.data}
        isLoading={isSummaryLoading}
      />

      {/* View Switcher Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)]">
        <button
          onClick={() => setViewMode('vouchers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            viewMode === 'vouchers'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutList className="w-4 h-4" /> Invoices & Vouchers View
        </button>

        <button
          onClick={() => setViewMode('vendors')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            viewMode === 'vendors'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Vendor-Wise Action Matrix
        </button>
      </div>

      {/* Main View Content */}
      {viewMode === 'vouchers' ? (
        <ImsVoucherView
          clientId={clientId}
          invoices={invoicesRes?.data?.items || []}
          total={invoicesRes?.data?.total || 0}
          isLoading={isInvoicesLoading}
          selectedAction={selectedAction}
          onActionChange={setSelectedAction}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={handleRefreshAll}
        />
      ) : (
        <ImsVendorView
          vendors={vendorsRes?.data || []}
          isLoading={isVendorsLoading}
        />
      )}
    </div>
  );
};

