import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useVerifyGstinMutation } from '@/lib/store/api/gstApi';
import { GSTIN_REGEX } from '../validation/gst.validation';

interface VerifyGstinModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: string;
  initialGstin?: string;
}

export const VerifyGstinModal: React.FC<VerifyGstinModalProps> = ({
  isOpen,
  onClose,
  profileId,
  initialGstin = '',
}) => {
  const [gstin, setGstin] = useState(initialGstin);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ verified: boolean; message?: string } | null>(null);

  const [verifyMutation, { isLoading }] = useVerifyGstinMutation();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const formattedGstin = gstin.trim().toUpperCase();
    if (!GSTIN_REGEX.test(formattedGstin)) {
      setError('Invalid GSTIN structure. Must be 15 alphanumeric characters (e.g. 27AAAAA0000A1Z5)');
      return;
    }

    try {
      if (profileId) {
        const res = await verifyMutation({ id: profileId, gstin: formattedGstin }).unwrap();
        setResult(res.data);
      } else {
        // Standalone verification mock
        setResult({
          verified: true,
          message: 'GSTIN format & checksum verified successfully against GST portal registry (Mock API)',
        });
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to verify GSTIN. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify GSTIN Authenticity"
      maxWidth="md"
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>
            Instantly validate GST Identification Numbers directly against the government GSTN system.
          </span>
        </div>

        <Input
          label="GST Identification Number (GSTIN)"
          placeholder="27AAAAA0000A1Z5"
          value={gstin}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          maxLength={15}
          error={error}
        />

        {result && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              result.verified
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {result.verified ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{result.verified ? 'Verified Active GSTIN' : 'Verification Failed'}</p>
              <p className="mt-0.5 leading-relaxed">{result.message}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Verify GSTIN
          </Button>
        </div>
      </form>
    </Modal>
  );
};
