'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from '@/lib/store/api/announcementsApi';
import { useToast } from '@/components/ui/Toast';
import type { Announcement, AnnouncementType } from '@/lib/types/announcement.types';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementToEdit?: Announcement | null;
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
  announcementToEdit,
}) => {
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('UPDATE');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (announcementToEdit) {
      setTitle(announcementToEdit.title || '');
      setContent(announcementToEdit.content || '');
      setType(announcementToEdit.type || 'UPDATE');
      setIsActive(announcementToEdit.isActive ?? true);
    } else {
      setTitle('');
      setContent('');
      setType('UPDATE');
      setIsActive(true);
    }
  }, [announcementToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    try {
      if (announcementToEdit) {
        await updateAnnouncement({
          id: announcementToEdit.id,
          title: title.trim(),
          content: content.trim(),
          type,
          isActive,
        }).unwrap();
        showToast('Announcement updated successfully', 'success');
      } else {
        await createAnnouncement({
          title: title.trim(),
          content: content.trim(),
          type,
          isActive,
        }).unwrap();
        showToast('Announcement broadcasted successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to save announcement', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={announcementToEdit ? 'Edit System Announcement' : 'Broadcast New Announcement'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Announcement Title"
          placeholder="e.g. Scheduled System Maintenance on Sunday"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              Type / Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AnnouncementType)}
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
            >
              <option value="UPDATE">UPDATE (Feature updates / release notes)</option>
              <option value="MAINTENANCE">MAINTENANCE (Scheduled server downtime)</option>
              <option value="NEWS">NEWS (General product announcements)</option>
              <option value="ALERT">ALERT (Urgent compliance or security advisory)</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <label className="relative flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#00C2B3] focus:ring-[#00C2B3] border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active & Visible to Users
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Message Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the announcement message text..."
            rows={4}
            required
            className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
          />
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating}>
            {announcementToEdit ? 'Save Changes' : 'Broadcast Announcement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
