'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User as UserIcon, Camera, Save, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUpdateMeMutation } from '@/lib/store/api/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import type { RootState } from '@/lib/store/store';

export function ProfileSettings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const [name, setName] = useState(user?.name || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB', 'error');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    if (selectedFile) {
      formData.append('profilePic', selectedFile);
    }

    try {
      await updateMe(formData).unwrap();
      showToast('Profile updated successfully!', 'success');
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Update profile error:', err);
      showToast(err?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const initials = (name || user?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarDisplay = previewUrl || user?.profilePic;

  return (
    <div className="space-y-6 max-w-2xl">
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="w-10 h-10 rounded-xl bg-[#00C2B3]/10 flex items-center justify-center text-[#00C2B3]">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-heading)' }}>
              Personal Profile
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your display name, avatar, and system role.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-lg font-bold text-white overflow-hidden shadow-inner border-2"
                style={{
                  background: 'linear-gradient(135deg, #091124 0%, #1a2744 100%)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {avatarDisplay ? (
                  <img
                    src={avatarDisplay}
                    alt={user?.name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-[#00C2B3] text-white flex items-center justify-center shadow-md hover:bg-[#00a89b] transition-colors"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-heading)' }}>
                Profile Picture
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Supports JPG, PNG, or WebP up to 5MB.
              </p>
              {selectedFile && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#00C2B3] mt-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> New picture selected: {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-heading)' }}>
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-heading)' }}>
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-9 opacity-80 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40"
                />
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
              <p className="text-[11px] mt-1 text-slate-400">
                Email address is permanently tied to your account login.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-heading)' }}>
                  Assigned System Role
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/20 text-xs font-medium" style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-heading)' }}>
                  <Shield className="w-4 h-4 text-[#00C2B3]" />
                  <span>{user?.role?.replace('_', ' ') || 'User'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-heading)' }}>
                  Account Status
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active & Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
