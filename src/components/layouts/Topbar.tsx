"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Basic title mapping based on pathname
  let title = 'Dashboard';
  if (pathname.includes('/my-clients')) title = 'My Clients';
  
  const userName = user?.name || user?.userName;
  const displayName = userName || 'Guest User';
  const initials = userName 
    ? userName.substring(0, 2).toUpperCase() 
    : 'GU';

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">{title}</h1>
      </div>
      
      <div className="flex items-center gap-5">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-2.5 pl-5 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#091124] text-white flex items-center justify-center font-semibold text-xs">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-[13px] font-semibold text-slate-700">{displayName}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
