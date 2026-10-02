'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
} from '@/lib/store/api/communicationApi';
import type {
  MessageTemplate,
  CommunicationChannel,
} from '@/lib/types/communication.types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: MessageTemplate | null;
}

export function TemplateModal({ isOpen, onClose, templateToEdit }: TemplateModalProps) {
  const { showToast } = useToast();
  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();

  const [formData, setFormData] = useState({
    name: '',
    channel: 'WHATSAPP' as CommunicationChannel,
    subject: '',
    body: '',
    isActive: true,
  });

  useEffect(() => {
    if (templateToEdit) {
      setFormData({
        name: templateToEdit.name,
        channel: templateToEdit.channel,
        subject: templateToEdit.subject || '',
        body: templateToEdit.body,
        isActive: templateToEdit.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        channel: 'WHATSAPP',
        subject: '',
        body: '',
        isActive: true,
      });
    }
  }, [templateToEdit, isOpen]);

  if (!isOpen) return null;

  const insertVariable = (varName: string) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + ` {{${varName}}} `,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Template name is required', 'error');
      return;
    }
    if (!formData.body.trim()) {
      showToast('Message body is required', 'error');
      return;
    }

    try {
      if (templateToEdit) {
        await updateTemplate({
          id: templateToEdit.id,
          data: formData,
        }).unwrap();
        showToast('Template updated successfully', 'success');
      } else {
        await createTemplate(formData).unwrap();
        showToast('Template created successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save template', 'error');
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100">
                {templateToEdit ? 'Edit Message Template' : 'New Message Template'}
              </h3>
              <p className="text-xs text-[#5A6E85] dark:text-slate-400">
                Define pre-approved communication copy with dynamic variable interpolation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Template Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. GST GSTR-3B Reminder"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Channel
              </label>
              <select
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value as CommunicationChannel })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/30"
              >
                <option value="WHATSAPP">WhatsApp Message</option>
                <option value="EMAIL">Email Dispatch</option>
                <option value="SMS">SMS Text</option>
              </select>
            </div>
          </div>

          {formData.channel === 'EMAIL' && (
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Email Subject
              </label>
              <Input
                placeholder="e.g. Important: Tax Filing Due Date Notice"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200">
                Message Body <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1">
                <span className="text-[11px] text-[#5A6E85] dark:text-slate-400 mr-1 flex items-center">
                  <Sparkles className="w-3 h-3 mr-0.5 text-[#4A6FA5]" /> Quick Tags:
                </span>
                {['clientName', 'dueDate', 'amountDue', 'firmName'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariable(tag)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-[#4A6FA5]/10 hover:text-[#4A6FA5] font-mono transition"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={5}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Dear {{clientName}}, this is a friendly reminder that your statutory compliance deadline is on {{dueDate}}. Regards, {{firmName}}."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/30 placeholder:text-slate-400 font-sans"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              {isSubmitting ? 'Saving...' : templateToEdit ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
