'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import {
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
} from '@/lib/store/api/attendanceApi';
import { useToast } from '@/components/ui/Toast';
import { Calendar, Clock, UserCheck } from 'lucide-react';
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types/attendance.types';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceToEdit?: AttendanceRecord | null;
}

export function MarkAttendanceModal({
  isOpen,
  onClose,
  attendanceToEdit,
}: MarkAttendanceModalProps) {
  const { showToast } = useToast();
  const { data: staffData, isLoading: isStaffLoading } = useGetStaffQuery();
  const [markAttendance, { isLoading: isMarking }] = useMarkAttendanceMutation();
  const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceMutation();

  const isEditing = !!attendanceToEdit;

  const [userId, setUserId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [checkInTime, setCheckInTime] = useState('09:30');
  const [checkOutTime, setCheckOutTime] = useState('18:30');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attendanceToEdit) {
      setUserId(attendanceToEdit.userId || '');
      setDate(
        attendanceToEdit.date
          ? new Date(attendanceToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setStatus(attendanceToEdit.status || 'PRESENT');
      if (attendanceToEdit.checkIn) {
        const d = new Date(attendanceToEdit.checkIn);
        setCheckInTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      }
      if (attendanceToEdit.checkOut) {
        const d = new Date(attendanceToEdit.checkOut);
        setCheckOutTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      }
    } else {
      setUserId('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('PRESENT');
      setCheckInTime('09:30');
      setCheckOutTime('18:30');
    }
    setErrors({});
  }, [attendanceToEdit, isOpen]);

  const staffOptions: SearchableOption[] = (staffData?.data || []).map((staff) => ({
    value: staff.id,
    label: staff.name,
    sublabel: staff.email,
    badge: staff.role,
  }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!userId) errs.userId = 'Please select a staff member';
    if (!date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let checkInIso: string | null = null;
      let checkOutIso: string | null = null;

      if (status === 'PRESENT' || status === 'HALFDAY') {
        if (checkInTime) {
          const [h, m] = checkInTime.split(':');
          const d = new Date(date);
          d.setHours(Number(h), Number(m), 0, 0);
          checkInIso = d.toISOString();
        }
        if (checkOutTime) {
          const [h, m] = checkOutTime.split(':');
          const d = new Date(date);
          d.setHours(Number(h), Number(m), 0, 0);
          checkOutIso = d.toISOString();
        }
      }

      if (isEditing && attendanceToEdit) {
        await updateAttendance({
          id: attendanceToEdit.id,
          data: {
            userId,
            date: new Date(date).toISOString(),
            status,
            checkIn: checkInIso,
            checkOut: checkOutIso,
          },
        }).unwrap();
        showToast('Attendance record updated', 'success');
      } else {
        await markAttendance({
          userId,
          date: new Date(date).toISOString(),
          status,
          checkIn: checkInIso,
          checkOut: checkOutIso,
        }).unwrap();
        showToast('Attendance recorded successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      console.error('Attendance error:', err);
      showToast(err?.data?.message || 'Failed to record attendance', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Attendance Entry' : 'Log Staff Attendance'}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="attendance-form"
            isLoading={isMarking || isUpdating}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Record Attendance'}
          </Button>
        </div>
      }
    >
      <form id="attendance-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <SearchableSelect
            label="Staff Member *"
            placeholder="Select staff member..."
            options={staffOptions}
            value={userId}
            onChange={(val) => {
              setUserId(val);
              if (errors.userId) setErrors((prev) => ({ ...prev, userId: '' }));
            }}
            error={errors.userId}
            isLoading={isStaffLoading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Date *"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full h-10 px-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALFDAY">Half Day</option>
              <option value="LEAVE">On Leave</option>
            </select>
          </div>
        </div>

        {(status === 'PRESENT' || status === 'HALFDAY') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <Input
              type="time"
              label="Check-In Time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
            />
            <Input
              type="time"
              label="Check-Out Time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
