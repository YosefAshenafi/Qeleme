"use client";

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col md:flex-row justify-between items-center py-8 px-12 gap-4 max-w-screen-2xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-headline">Mega Test</span>
          <span className="font-body text-xs text-slate-500 dark:text-slate-400">
            © 2024 Mega Test. An Academic Vanguard Initiative.
          </span>
        </div>
        <div className="flex gap-6">
          <a className="font-body text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-body text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="font-body text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Help Center</a>
          <a className="font-body text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
};
