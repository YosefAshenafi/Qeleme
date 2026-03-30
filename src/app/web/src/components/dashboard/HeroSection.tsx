"use client";

import React from 'react';

interface UserStats {
  progress?: number;
  mastery?: number;
  tasksCompleted?: number;
  currentStreak?: number;
  performanceHistory?: number[];
}

interface HeroSectionProps {
  userName?: string;
  grade?: string;
  stats?: UserStats;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  userName = 'Student', 
  grade = 'Grade 12',
  stats 
}) => {
  const progress = stats?.progress ?? 65;
  const mastery = stats?.mastery ?? 78;
  const tasksCompleted = stats?.tasksCompleted ?? 24;
  const currentStreak = stats?.currentStreak ?? 5;
  const performanceHistory = stats?.performanceHistory ?? [40, 55, 45, 70, 60, 80, 75];

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden academic-gradient">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="w-full md:w-1/2">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-primary font-bold tracking-widest text-xs uppercase">Weekly Performance</span>
            {currentStreak > 0 && (
              <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                {currentStreak} day streak
              </span>
            )}
          </div>
          <h1 className="font-headline text-4xl font-bold text-on-surface mb-2 tracking-tight">
            Hello, {userName}!
          </h1>
          <p className="text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            You've completed {progress}% of your {grade} Advanced Mathematics curriculum. Keep pushing toward the finals!
          </p>
          <div className="flex gap-4">
            <div className="flex-1 bg-surface-container-low p-4 rounded-lg border-l-4 border-primary">
              <span className="text-xs text-outline font-bold uppercase tracking-wider block mb-1">Learning Mastery</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-headline font-bold text-primary">{mastery}%</span>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-tight mt-1">Based on recent performance</p>
            </div>
            <div className="flex-1 bg-surface-container-low p-4 rounded-lg">
              <span className="text-xs text-outline block mb-1 uppercase font-bold tracking-wider">Tasks Completed</span>
              <span className="text-2xl font-headline font-bold text-on-surface">{tasksCompleted}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 flex items-end justify-center h-48 gap-3 px-4">
          {performanceHistory.map((height, index) => (
            <div 
              key={index}
              className={`w-8 rounded-t-lg transition-all hover:bg-primary ${index === performanceHistory.length - 1 ? 'bg-primary shadow-lg' : 'bg-primary-fixed'}`}
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="absolute -right-16 -top-16 opacity-[0.03] pointer-events-none">
        <span className="material-symbols-outlined text-[20rem]">school</span>
      </div>
    </section>
  );
};
