"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Sample compliance events
const complianceEvents = [
  { id: 1, date: 7, month: 'every', title: 'TDS/TCS Payment', type: 'TDS', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 2, date: 11, month: 'every', title: 'GSTR-1 (Monthly)', type: 'GST', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 3, date: 15, month: 'every', title: 'PF & ESI Payment', type: 'Labour', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 4, date: 20, month: 'every', title: 'GSTR-3B (Monthly)', type: 'GST', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 5, date: 15, month: 2, title: 'Advance Tax (4th Inst.)', type: 'Income Tax', color: 'bg-red-100 text-red-700 border-red-200' }, // March 15 in JS is month index 2
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ComplianceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty slots before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-slate-50/40 border-r border-b border-slate-200" />
      );
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      
      // Find events for this day
      const dayEvents = complianceEvents.filter(e => e.date === day && (e.month === 'every' || e.month === currentMonth));

      days.push(
        <div 
          key={`day-${day}`} 
          className="bg-white border-r border-b border-slate-200 p-1.5 flex flex-col transition-colors hover:bg-slate-50/50 group min-h-[80px]"
        >
          <div className="flex justify-center mb-1 shrink-0">
            <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#00C2B3] text-white' : 'text-slate-700 group-hover:bg-slate-100'}`}>
              {day}
            </span>
          </div>
          
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            {dayEvents.map(event => (
              <div 
                key={`${day}-${event.id}`} 
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate border ${event.color} cursor-pointer hover:opacity-80 transition-opacity`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Fill remaining days in the grid to make it a perfect square/rectangle
    const totalSlots = firstDayOfMonth + daysInMonth;
    const remainingSlots = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
    for (let i = 0; i < remainingSlots; i++) {
      days.push(
        <div key={`end-empty-${i}`} className="bg-slate-50/40 border-r border-b border-slate-200" />
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] w-full gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#091124] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#00C2B3]" />
            Compliance Calendar
          </h2>
          <p className="text-slate-500 mt-0.5 text-[13px]">Track important tax and statutory deadlines</p>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <Button variant="ghost" onClick={prevMonth} className="px-3 hover:bg-slate-100 text-slate-600 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-[140px] text-center font-bold text-slate-800 text-sm">
            {MONTHS[currentMonth]} {currentYear}
          </div>
          <Button variant="ghost" onClick={nextMonth} className="px-3 hover:bg-slate-100 text-slate-600 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3 shrink-0">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-[13px] text-blue-800">
          <span className="font-semibold">Note:</span> This calendar currently displays standard statutory due dates for Indian businesses. Customized client-specific tracking will be available soon. 
        </div>
      </div>

      {/* Calendar Grid (Full height) */}
      <div className="flex-1 flex flex-col bg-white border-t border-l border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-0">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-white shrink-0">
          {DAYS.map(day => (
            <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-b border-slate-200">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Body */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}
