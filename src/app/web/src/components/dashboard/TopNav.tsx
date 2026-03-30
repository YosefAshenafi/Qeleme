"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserData {
  fullName?: string;
  username?: string;
  email?: string;
  grade?: string;
  phone?: string;
}

interface TopNavProps {
  user?: UserData | null;
}

export const TopNav: React.FC<TopNavProps> = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  const displayName = user?.fullName || user?.username || 'Student';
  const displayEmail = user?.email || user?.phone || '';

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none border-b border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center h-16 px-6 md:px-12 w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tighter text-primary dark:text-blue-400 font-headline">
            MegaTest
          </Link>
          <nav className="hidden md:flex items-center gap-6 font-headline font-medium text-sm tracking-tight">
            <Link href="/dashboard" className="text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400 pb-1 font-bold">
              Dashboard
            </Link>
            <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Practice
            </Link>
            <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Resources
            </Link>
            <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Progress
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <input
              className="bg-surface-container-low border-none rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary w-64"
              placeholder="Search resources..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          </div>
          <button className="material-symbols-outlined text-outline hover:text-primary transition-all p-2 rounded-lg hover:bg-slate-50">notifications</button>
          <button className="material-symbols-outlined text-outline hover:text-primary transition-all p-2 rounded-lg hover:bg-slate-50">settings</button>
          <div className="h-8 w-px bg-outline-variant/30 mx-2"></div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="h-10 w-10 rounded-full border-2 border-primary shadow-sm bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white">person</span>
              </div>
              <span className="material-symbols-outlined text-primary text-sm">expand_more</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 py-1">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-primary">{displayName}</p>
                  {user?.grade && (
                    <p className="text-xs text-primary/70">{user.grade}</p>
                  )}
                  {displayEmail && (
                    <p className="text-xs text-on-surface-variant">{displayEmail}</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
