'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Mail,
  Smartphone,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetTemplatesQuery,
  useDeleteTemplateMutation,
} from '@/lib/store/api/communicationApi';
import { TemplateModal } from './TemplateModal';
import type { MessageTemplate, CommunicationChannel } from '@/lib/types/communication.types';

export function TemplatesTab() {
  const { showToast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | CommunicationChannel>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  const { data: response, isLoading } = useGetTemplatesQuery(
    selectedChannel !== 'ALL' ? { channel: selectedChannel } : undefined
  );
  const [deleteTemplate] = useDeleteTemplateMutation();

  const templates = response?.data || [];

  const handleEdit = (tpl: MessageTemplate) => {
    setSelectedTemplate(tpl);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      await deleteTemplate(id).unwrap();
      showToast('Template deleted', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete template', 'error');
    }
  };

  const handleCopyBody = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Template text copied to clipboard', 'info');
  };

  const getChannelIcon = (ch: CommunicationChannel) => {
    switch (ch) {
      case 'WHATSAPP':
        return <MessageSquare className="w-4 h-4 text-[#3D7A64]" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-[#4A6FA5]" />;
      case 'SMS':
        return <Smartphone className="w-4 h-4 text-[#9E6B42]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action and filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42]">
        <div className="flex items-center space-x-2 bg-[#F7F9FB] dark:bg-[#0C131F] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          {(['ALL', 'WHATSAPP', 'EMAIL', 'SMS'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                selectedChannel === ch
                  ? 'bg-white dark:bg-[#131C2E] text-[#1E2A38] dark:text-slate-100 shadow-xs'
                  : 'text-[#5A6E85] dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {ch === 'ALL' ? 'All Channels' : ch}
            </button>
          ))}
        </div>

        <Button
          onClick={handleCreate}
          className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </Button>
      </div>

      {/* Grid of Templates */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#131C2E] rounded-xl border border-dashed border-slate-200 dark:border-[#1E2B42]">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-200">
            No Message Templates Found
          </h4>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Create reusable copy templates for WhatsApp reminders, compliance notices, and fee receipts.
          </p>
          <Button
            onClick={handleCreate}
            className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs"
          >
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] p-5 shadow-sm flex flex-col justify-between hover:border-[#4A6FA5]/40 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                      {getChannelIcon(tpl.channel)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#1E2A38] dark:text-slate-100">
                        {tpl.name}
                      </h4>
                      <span className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                        {tpl.channel}
                      </span>
                    </div>
                  </div>
                </div>

                {tpl.subject && (
                  <div className="mt-3 text-[11px] text-[#5A6E85] dark:text-slate-400 italic">
                    Subject: &quot;{tpl.subject}&quot;
                  </div>
                )}

                <div className="mt-3 p-3 rounded-lg bg-[#F7F9FB] dark:bg-[#0C131F] text-xs text-[#1E2A38] dark:text-slate-300 font-mono whitespace-pre-wrap line-clamp-4">
                  {tpl.body}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleCopyBody(tpl.body)}
                  className="flex items-center text-[11px] text-[#5A6E85] hover:text-[#4A6FA5] transition"
                  title="Copy body text"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy</span>
                </button>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(tpl)}
                    className="h-7 px-2 text-[#5A6E85] hover:text-[#4A6FA5] text-[11px]"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="h-7 px-2 text-[#9E4A4A] hover:bg-[#9E4A4A]/10 text-[11px]"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
        }}
        templateToEdit={selectedTemplate}
      />
    </div>
  );
}
