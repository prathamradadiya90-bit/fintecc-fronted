"use client";

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Tag,
  AlertCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import {
  useGetUnifiedCalendarQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
} from '@/lib/store/api/calendarApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { CalendarEvent, CalendarEventType, CalendarPriority } from '@/lib/types/calendar.types';


const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ComplianceCalendarPage() {
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Query live unified events from backend
  const { data: calendarData, isLoading, refetch } = useGetUnifiedCalendarQuery({
    month: String(currentMonth + 1),
    year: String(currentYear),
  });

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState<CalendarEventType>('WORK');
  const [priority, setPriority] = useState<CalendarPriority>('MEDIUM');

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const liveEvents = calendarData?.data || [];

  const handleOpenCreateForDay = (day: number) => {
    const formattedDate = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    setEventDate(formattedDate);
    setTitle('');
    setDescription('');
    setEventType('WORK');
    setPriority('MEDIUM');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Event title is required', 'error');
      return;
    }

    try {
      const isoDateTime = new Date(`${eventDate}T09:00:00.000Z`).toISOString();
      await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: isoDateTime,
        eventType,
        priority,
      }).unwrap();

      showToast('Calendar event created successfully!', 'success');
      setIsCreateOpen(false);
    } catch (err: any) {
      console.error('Create event error:', err);
      showToast(err?.data?.message || 'Failed to create calendar event', 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id).unwrap();
      showToast('Event deleted successfully', 'success');
      setSelectedEvent(null);
    } catch (err: any) {
      console.error('Delete event error:', err);
      showToast(err?.data?.message || 'Failed to delete event', 'error');
    }
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty slots before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          style={{
            background: 'var(--color-bg-subtle)',
            borderRight: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
          }}
        />
      );
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

      // Find events matching this day
      const dayLiveEvents = liveEvents.filter((e) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });


      days.push(
        <div
          key={`day-${day}`}
          className="p-1.5 flex flex-col transition-colors group min-h-[90px] relative"
          style={{
            background: 'var(--color-bg-card)',
            borderRight: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-card-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-card)')}
        >
          <div className="flex items-center justify-between mb-1 shrink-0">
            <span
              className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                isToday ? 'bg-emerald-600 text-white shadow-xs' : ''
              }`}
              style={isToday ? {} : { color: 'var(--color-text-on-card)' }}
            >
              {day}
            </span>

            <button
              type="button"
              onClick={() => handleOpenCreateForDay(day)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-emerald-500 transition-opacity"
              title="Add event on this day"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            {/* Live unified events */}
            {dayLiveEvents.map((event) => {
              const isCustom = event.type === 'CUSTOM';
              const isTask = event.type === 'TASK';
              const badgeColor = isTask
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

              return (
                <div
                  key={`live-${event.id}`}
                  onClick={() => setSelectedEvent(event)}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate border ${badgeColor} cursor-pointer hover:opacity-80 transition-opacity`}
                  title={`${event.title} (${event.type})`}
                >
                  {event.title}
                </div>
              );
            })}

          </div>
        </div>
      );
    }

    // Trailing empty slots
    const totalSlots = firstDayOfMonth + daysInMonth;
    const remainingSlots = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
    for (let i = 0; i < remainingSlots; i++) {
      days.push(
        <div
          key={`end-empty-${i}`}
          style={{
            background: 'var(--color-bg-subtle)',
            borderRight: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
          }}
        />
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] w-full gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
              <CalendarIcon className="w-5 h-5 text-emerald-500" />
              Unified Compliance & Operations Calendar
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live Synced
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Consolidated overview of statutory deadlines, firm task due dates, and internal hearings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEventDate(new Date().toISOString().split('T')[0]);
              setTitle('');
              setDescription('');
              setIsCreateOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Custom Event
          </Button>

          {/* Month Navigator */}
          <div
            className="flex items-center gap-2 p-1 rounded-xl shadow-sm shrink-0"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Button variant="ghost" onClick={prevMonth} className="px-2.5 h-8 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[130px] text-center font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
              {MONTHS[currentMonth]} {currentYear}
            </div>
            <Button variant="ghost" onClick={nextMonth} className="px-2.5 h-8 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 border"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <span className="text-slate-500">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            GST Returns
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            TDS / TCS Filings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Work Board Tasks
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Custom Meetings & Hearings
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Showing {liveEvents.length} events for {MONTHS[currentMonth]}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-sm min-h-0 border"
        style={{
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Days of week header */}
        <div className="grid grid-cols-7 shrink-0" style={{ background: 'var(--color-bg-card)' }}>
          {DAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: 'var(--color-text-secondary)',
                borderRight: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {renderCalendarDays()}
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Calendar Event"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Event Title *
            </label>
            <Input
              type="text"
              placeholder="e.g. ITAT Tribunal Hearing or Quarterly Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Event Date *
              </label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="WORK">Work / Filing</option>
                <option value="MEETING">Client Meeting</option>
                <option value="REMINDER">Reminder</option>
                <option value="NOTE">Personal Note</option>
                <option value="OTHER">Other Statutory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Priority
            </label>
            <div className="flex items-center gap-3">
              {(['LOW', 'MEDIUM', 'HIGH'] as CalendarPriority[]).map((p) => (
                <label key={p} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="accent-emerald-500"
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Description / Case Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add hearing number, court room, or key topics..."
              className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Save Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                {selectedEvent.type}
              </span>
              {selectedEvent.priority && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/10 text-amber-600 border-amber-500/20">
                  {selectedEvent.priority} Priority
                </span>
              )}
            </div>

            <div className="space-y-2 p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/30" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Scheduled for: {new Date(selectedEvent.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              {selectedEvent.clientName && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Associated Client: {selectedEvent.clientName}</span>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Description:</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            <div className="pt-3 flex justify-between items-center border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {selectedEvent.type === 'CUSTOM' ? (
                <Button
                  variant="outline"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  isLoading={isDeleting}
                  className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Event
                </Button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  System generated event from Work Board
                </span>
              )}

              <Button onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
