'use client';

import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Copy,
  CheckCircle2,
  Calendar,
  Layers,
  Scale,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useValidateCinMutation,
  useValidateDinMutation,
  useValidateLlpinMutation,
  useCalculateLateFeeMutation,
  useGenerateResolutionMutation,
} from '@/lib/store/api/mcaApi';
import type {
  CinValidationResult,
  DinValidationResult,
  LlpinValidationResult,
  McaLateFeeResult,
  BoardResolutionDraftResult,
} from '@/lib/types/mca.types';

export function McaComplianceToolsCard() {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'cin' | 'din' | 'latefee' | 'resolution'>('cin');

  // 1. CIN Decoder
  const [validateCin, { isLoading: isValidatingCin }] = useValidateCinMutation();
  const [cinInput, setCinInput] = useState('U72900MH2020PTC123456');
  const [cinResult, setCinResult] = useState<CinValidationResult | null>(null);

  // 2. DIN & LLPIN
  const [validateDin, { isLoading: isValidatingDin }] = useValidateDinMutation();
  const [validateLlpin, { isLoading: isValidatingLlpin }] = useValidateLlpinMutation();
  const [dinInput, setDinInput] = useState('01234567');
  const [dinResult, setDinResult] = useState<DinValidationResult | null>(null);
  const [llpinInput, setLlpinInput] = useState('AAB-1234');
  const [llpinResult, setLlpinResult] = useState<LlpinValidationResult | null>(null);

  // 3. Late Fee Calculator
  const [calculateLateFee, { isLoading: isCalculatingFee }] = useCalculateLateFeeMutation();
  const [formType, setFormType] = useState('AOC-4');
  const [dueDate, setDueDate] = useState('2024-10-30');
  const [actualFilingDate, setActualFilingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [nominalCapital, setNominalCapital] = useState<number>(1000000);
  const [feeResult, setFeeResult] = useState<McaLateFeeResult | null>(null);

  // 4. Resolution Drafter
  const [generateResolution, { isLoading: isDraftingResolution }] = useGenerateResolutionMutation();
  const [companyName, setCompanyName] = useState('ACME ENTERPRISES PRIVATE LIMITED');
  const [resCin, setResCin] = useState('U72900MH2020PTC123456');
  const [resType, setResType] = useState<'ACCOUNTS_ADOPTION' | 'AUDITOR_APPOINTMENT' | 'GENERAL_AUTHORITY'>('ACCOUNTS_ADOPTION');
  const [directorName, setDirectorName] = useState('Rahul Sharma');
  const [directorDin, setDirectorDin] = useState('01234567');
  const [resolutionResult, setResolutionResult] = useState<BoardResolutionDraftResult | null>(null);

  const handleDecodeCin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinInput.trim()) return;
    try {
      const res = await validateCin({ cin: cinInput.trim() }).unwrap();
      if (res.data) {
        setCinResult(res.data);
        showToast(res.message || 'CIN decoded successfully', res.data.isValid ? 'success' : 'error');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to decode CIN', 'error');
    }
  };

  const handleValidateDin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await validateDin({ din: dinInput.trim() }).unwrap();
      if (res.data) {
        setDinResult(res.data);
        showToast(res.data.message, res.data.isValid ? 'success' : 'error');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'DIN validation failed', 'error');
    }
  };

  const handleValidateLlpin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await validateLlpin({ llpin: llpinInput.trim() }).unwrap();
      if (res.data) {
        setLlpinResult(res.data);
        showToast(res.data.message, res.data.isValid ? 'success' : 'error');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'LLPIN validation failed', 'error');
    }
  };

  const handleCalculateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateLateFee({
        formType,
        dueDate,
        actualFilingDate,
        nominalShareCapital: nominalCapital,
      }).unwrap();

      if (res.data) {
        setFeeResult(res.data);
        showToast('ROC Late fee computed', 'success');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to calculate fee', 'error');
    }
  };

  const handleDraftResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await generateResolution({
        companyName,
        cin: resCin,
        resolutionType: resType,
        directorName,
        din: directorDin,
      }).unwrap();

      if (res.data) {
        setResolutionResult(res.data);
        showToast('Board resolution drafted successfully', 'success');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to draft resolution', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  return (
    <div className="bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-[#1E2A38] dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#4A6FA5]" />
            MCA Compliance Engine & Corporate Law Tools
          </h3>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-0.5">
            21-character CIN decoder, Section 403 ROC late fee calculator, DIN/LLPIN validators, and statutory Board Resolution drafter.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F7F9FB] dark:bg-[#0C131F] border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('cin')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeSubTab === 'cin'
                ? 'bg-[#4A6FA5] text-white shadow-sm'
                : 'text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38]'
            }`}
          >
            CIN Decoder
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('din')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeSubTab === 'din'
                ? 'bg-[#4A6FA5] text-white shadow-sm'
                : 'text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38]'
            }`}
          >
            DIN & LLPIN
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('latefee')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeSubTab === 'latefee'
                ? 'bg-[#4A6FA5] text-white shadow-sm'
                : 'text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38]'
            }`}
          >
            ROC Late Fees
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('resolution')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeSubTab === 'resolution'
                ? 'bg-[#4A6FA5] text-white shadow-sm'
                : 'text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38]'
            }`}
          >
            Resolution Drafter
          </button>
        </div>
      </div>

      {/* 1. CIN Decoder SubTab */}
      {activeSubTab === 'cin' && (
        <div className="space-y-4">
          <form onSubmit={handleDecodeCin} className="flex gap-2">
            <input
              type="text"
              required
              maxLength={21}
              placeholder="Enter 21-character CIN (e.g. U72900MH2020PTC123456)"
              value={cinInput}
              onChange={(e) => setCinInput(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F] font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isValidatingCin}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs px-4"
            >
              {isValidatingCin ? 'Decoding...' : 'Decode & Validate CIN'}
            </Button>
          </form>

          {cinResult && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] space-y-3 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {cinResult.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3D7A64]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#9E4A4A]" />
                  )}
                  <span className="font-semibold text-xs text-[#1E2A38] dark:text-white font-mono">
                    {cinResult.cin}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    cinResult.isValid
                      ? 'bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20'
                      : 'bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20'
                  }`}
                >
                  {cinResult.isValid ? 'Valid CIN Format' : 'Invalid Pattern'}
                </span>
              </div>

              {cinResult.details && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#5A6E85] text-[11px]">Listing Status</span>
                    <div className="font-semibold text-[#1E2A38] dark:text-white mt-0.5">
                      {cinResult.details.listingStatus}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#5A6E85] text-[11px]">Company Class</span>
                    <div className="font-semibold text-[#4A6FA5] mt-0.5">
                      {cinResult.details.companyClass}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#5A6E85] text-[11px]">State of Incorporation</span>
                    <div className="font-semibold text-[#1E2A38] dark:text-white mt-0.5">
                      {cinResult.details.stateName} ({cinResult.details.stateCode})
                    </div>
                  </div>

                  <div>
                    <span className="text-[#5A6E85] text-[11px]">Incorporation Year</span>
                    <div className="font-semibold text-[#1E2A38] dark:text-white mt-0.5">
                      {cinResult.details.incorporationYear}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#5A6E85] text-[11px]">NIC Industry Code</span>
                    <div className="font-mono font-medium text-[#1E2A38] dark:text-white mt-0.5">
                      {cinResult.details.industryCode}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#5A6E85] text-[11px]">RoC Registration No</span>
                    <div className="font-mono font-medium text-[#1E2A38] dark:text-white mt-0.5">
                      {cinResult.details.registrationNo}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[#5A6E85] text-[11px]">RoC Jurisdiction</span>
                    <div className="font-semibold text-[#3D7A64] mt-0.5">
                      {cinResult.details.rocJurisdiction}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. DIN & LLPIN SubTab */}
      {activeSubTab === 'din' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* DIN Validator */}
          <form onSubmit={handleValidateDin} className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F]">
            <h4 className="font-semibold text-xs text-[#1E2A38] dark:text-white flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#4A6FA5]" />
              Director Identification Number (DIN) Validator
            </h4>
            <p className="text-[11px] text-[#5A6E85]">
              Validates 8-digit numeric Director Identification Number required for all corporate board members.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. 01234567"
                value={dinInput}
                onChange={(e) => setDinInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] font-mono"
              />
              <Button type="submit" size="sm" disabled={isValidatingDin} className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs">
                Check DIN
              </Button>
            </div>
            {dinResult && (
              <div className={`p-2 rounded-lg border text-[11px] font-medium ${dinResult.isValid ? 'bg-[#3D7A64]/10 text-[#3D7A64] border-[#3D7A64]/20' : 'bg-[#9E4A4A]/10 text-[#9E4A4A] border-[#9E4A4A]/20'}`}>
                {dinResult.message}
              </div>
            )}
          </form>

          {/* LLPIN Validator */}
          <form onSubmit={handleValidateLlpin} className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F]">
            <h4 className="font-semibold text-xs text-[#1E2A38] dark:text-white flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#4A6FA5]" />
              LLP Identification Number (LLPIN) Validator
            </h4>
            <p className="text-[11px] text-[#5A6E85]">
              Validates Limited Liability Partnership registration code format (e.g. AAA-1234 or AA12345).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. AAB-1234"
                value={llpinInput}
                onChange={(e) => setLlpinInput(e.target.value.toUpperCase())}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] font-mono"
              />
              <Button type="submit" size="sm" disabled={isValidatingLlpin} className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs">
                Check LLPIN
              </Button>
            </div>
            {llpinResult && (
              <div className={`p-2 rounded-lg border text-[11px] font-medium ${llpinResult.isValid ? 'bg-[#3D7A64]/10 text-[#3D7A64] border-[#3D7A64]/20' : 'bg-[#9E4A4A]/10 text-[#9E4A4A] border-[#9E4A4A]/20'}`}>
                {llpinResult.message}
              </div>
            )}
          </form>
        </div>
      )}

      {/* 3. ROC Late Fee Calculator SubTab */}
      {activeSubTab === 'latefee' && (
        <form onSubmit={handleCalculateFee} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                e-Form Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              >
                <option value="AOC-4">AOC-4 (Annual Financial Statements - ₹100/day)</option>
                <option value="MGT-7">MGT-7 (Annual Return - ₹100/day)</option>
                <option value="DIR-12">DIR-12 (Appointment of Directors - Slab fee)</option>
                <option value="ADT-1">ADT-1 (Auditor Appointment - Slab fee)</option>
                <option value="PAS-3">PAS-3 (Allotment of Shares - Slab fee)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Statutory Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Actual / Expected Filing Date
              </label>
              <input
                type="date"
                required
                value={actualFilingDate}
                onChange={(e) => setActualFilingDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Nominal Share Capital (₹)
              </label>
              <input
                type="number"
                value={nominalCapital}
                onChange={(e) => setNominalCapital(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isCalculatingFee}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center gap-1.5 text-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              {isCalculatingFee ? 'Calculating...' : 'Compute Section 403 Late Fees'}
            </Button>
          </div>

          {feeResult && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] space-y-3 animate-fadeIn text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[#5A6E85] text-[11px]">Delay Duration</span>
                  <div className="font-bold text-base text-[#1E2A38] dark:text-white mt-0.5">
                    {feeResult.delayDays} Days
                  </div>
                </div>

                <div>
                  <span className="text-[#5A6E85] text-[11px]">Normal Filing Fee</span>
                  <div className="font-bold text-base text-[#5A6E85] mt-0.5">
                    ₹{feeResult.normalFee}
                  </div>
                </div>

                <div>
                  <span className="text-[#5A6E85] text-[11px]">Section 403 Additional Fee</span>
                  <div className="font-bold text-base text-[#9E4A4A] mt-0.5">
                    ₹{feeResult.additionalFee.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span className="text-[#5A6E85] text-[11px]">Total Payable at Portal</span>
                  <div className="font-bold text-lg text-[#9E6B42] mt-0.5">
                    ₹{feeResult.totalPayable.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {feeResult.statutoryReference && (
                <div className="text-[11px] text-[#5A6E85] pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-semibold">Legal Provision: </span>
                  {feeResult.statutoryReference}
                </div>
              )}
            </div>
          )}
        </form>
      )}

      {/* 4. Board Resolution Drafter SubTab */}
      {activeSubTab === 'resolution' && (
        <div className="space-y-4 text-xs">
          <form onSubmit={handleDraftResolution} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Company CIN
              </label>
              <input
                type="text"
                required
                value={resCin}
                onChange={(e) => setResCin(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Resolution Subject / Matter
              </label>
              <select
                value={resType}
                onChange={(e) => setResType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              >
                <option value="ACCOUNTS_ADOPTION">Adoption of Financial Statements (AOC-4)</option>
                <option value="AUDITOR_APPOINTMENT">Appointment of Statutory Auditors (ADT-1)</option>
                <option value="GENERAL_AUTHORITY">Authorization for MCA V3 e-Filing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Authorized Director Name
              </label>
              <input
                type="text"
                required
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Director DIN
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={directorDin}
                onChange={(e) => setDirectorDin(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                size="sm"
                disabled={isDraftingResolution}
                className="w-full bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs h-8"
              >
                {isDraftingResolution ? 'Drafting...' : 'Generate Legal Resolution'}
              </Button>
            </div>
          </form>

          {resolutionResult && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] space-y-3 animate-fadeIn text-xs font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-xs text-[#1E2A38] dark:text-white uppercase tracking-wider">
                  {resolutionResult.title}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(resolutionResult.body)}
                  className="flex items-center gap-1.5 text-xs text-[#4A6FA5] border-[#4A6FA5]/30 hover:bg-[#4A6FA5]/10 h-7"
                >
                  <Copy className="w-3 h-3" />
                  Copy Text
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-[#1E2A38] dark:text-slate-200">
                {resolutionResult.body}
              </div>

              <div className="text-[11px] text-[#5A6E85] flex justify-between">
                <span>Signatory: {resolutionResult.signatory.directorName} ({resolutionResult.signatory.designation})</span>
                <span>DIN: {resolutionResult.signatory.din}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
