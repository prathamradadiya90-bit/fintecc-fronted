'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Info,
  Sparkles,
  AlertOctagon,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useGetAnnouncementsQuery,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '@/lib/store/api/announcementsApi';
import { AnnouncementFormModal } from '@/components/announcements/AnnouncementFormModal';
import { useToast } from '@/components/ui/Toast';
import type { Announcement, AnnouncementType } from '@/lib/types/announcement.types';

export default function SuperAdminAnnouncementsPage() {
  const { data: response, isLoading } = useGetAnnouncementsQuery({ limit: 100 });
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  const announcements = response?.data || [];

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await updateAnnouncement({
        id: announcement.id,
        isActive: !announcement.isActive,
      }).unwrap();
      showToast(
        `Announcement ${!announcement.isActive ? 'activated' : 'deactivated'}`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete announcement "${title}"?`)) return;
    try {
      await deleteAnnouncement(id).unwrap();
      showToast('Announcement deleted', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete announcement', 'error');
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'MAINTENANCE':
        return {
          icon: <AlertTriangle className="w-3 h-3 text-amber-500" />,
          cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200',
        };
      case 'ALERT':
        return {
          icon: <AlertOctagon className="w-3 h-3 text-rose-500" />,
          cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200',
        };
      case 'NEWS':
        return {
          icon: <Sparkles className="w-3 h-3 text-emerald-500" />,
          cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200',
        };
      case 'UPDATE':
      default:
        return {
          icon: <Info className="w-3 h-3 text-blue-500" />,
          cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200',
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00C2B3] border border-teal-100 dark:border-teal-900">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              System Announcements
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Broadcast platform updates, scheduled maintenance, and advisories to all users
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            setAnnouncementToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Broadcast Announcement
        </Button>
      </div>

      {/* Announcements Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Title & Type</th>
                <th className="py-3.5 px-4">Message Content</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date Broadcasted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
                      <span>Loading announcements...</span>
                    </div>
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <Megaphone className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      No system announcements
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Create your first broadcast message to inform users.
                    </p>
                  </td>
                </tr>
              ) : (
                announcements.map((item) => {
                  const badge = getTypeBadge(item.type);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border mt-1 ${badge.cls}`}
                        >
                          {badge.icon}
                          {item.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.content}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Draft / Inactive'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setAnnouncementToEdit(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#00C2B3] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit Announcement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={isDeleting}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnnouncementFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAnnouncementToEdit(null);
        }}
        announcementToEdit={announcementToEdit}
      />
    </div>
  );
}
