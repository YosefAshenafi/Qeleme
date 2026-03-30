"use client";

import React from 'react';

interface UserStats {
  streak?: number;
  xp?: number;
  maxXp?: number;
  level?: number;
  gradeProgress?: number;
  completedTasks?: number;
  totalTasksCompleted?: number;
  progress?: number;
  mastery?: number;
}

interface Activity {
  id?: string;
  title: string;
  time: string;
  image?: string;
  icon?: string;
}

interface Milestone {
  title: string;
  progress: number;
  color?: string;
}

interface SidebarProps {
  stats?: UserStats;
  recentActivity?: Activity[];
  milestones?: Milestone[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  stats,
  recentActivity,
  milestones 
}) => {
  const streak = stats?.streak ?? 5;
  const xp = stats?.xp ?? 1250;
  const maxXp = stats?.maxXp ?? 2000;
  const level = stats?.level ?? 3;

  const defaultActivities: Activity[] = [
    {
      title: 'Completed Mathematics Quiz',
      time: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop',
      icon: 'check_circle'
    },
    {
      title: 'Started Physics Chapter 5',
      time: '5 hours ago',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=100&h=100&fit=crop',
      icon: 'play_arrow'
    },
    {
      title: 'Reviewed Flashcards',
      time: 'Yesterday',
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=100&h=100&fit=crop',
      icon: 'style'
    }
  ];

  const defaultMilestones: Milestone[] = [
    { title: 'Mathematics Mastery', progress: 78, color: 'primary' },
    { title: 'Physics Progress', progress: 65, color: 'secondary' },
    { title: 'Chemistry Basics', progress: 45, color: 'tertiary' },
    { title: 'Weekly Goal', progress: 82, color: 'green-500' }
  ];

  const activities = recentActivity || defaultActivities;
  const milestoneList = milestones || defaultMilestones;

  return (
    <aside className="w-full lg:w-80 space-y-8">
      <div className="bg-surface-container-low p-6 rounded-xl text-center border border-surface-container">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
        </div>
        <h3 className="font-headline font-bold text-xl mb-1">{streak} Day Streak</h3>
        <p className="text-on-surface-variant text-sm mb-4">You're in the top 5% of learners this month!</p>
        <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full rounded-full" 
            style={{ width: `${(xp / maxXp) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-outline">
          <span>LEVEL {level}</span>
          <span>{xp.toLocaleString()} / {maxXp.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div 
              key={activity.id || index}
              className="bg-surface-container-lowest p-3 rounded-xl flex items-center gap-3 border border-surface-container hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img alt={activity.title} className="w-full h-full object-cover" src={activity.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop'} />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-xs truncate group-hover:text-primary transition-colors">{activity.title}</h4>
                <p className="text-[10px] text-on-surface-variant">{activity.time}</p>
              </div>
              <span className="material-symbols-outlined text-primary text-sm group-hover:scale-110 transition-transform">
                {activity.icon || 'chevron_right'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-high p-6 rounded-xl border border-surface-container">
        <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">school</span>
          Grade Progress
        </h3>
        <div className="space-y-4">
          <div className="text-center py-4">
            <span className="text-5xl font-headline font-bold text-primary">{stats?.gradeProgress || stats?.mastery || 0}%</span>
            <p className="text-sm text-on-surface-variant mt-2">Overall Completion</p>
          </div>
          <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary" 
              style={{ width: `${stats?.gradeProgress || stats?.mastery || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-on-surface-variant pt-2">
            <span>Started</span>
            <span>In Progress</span>
            <span>Complete</span>
          </div>
        </div>
        {stats?.completedTasks !== undefined && (
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-on-surface-variant">Tasks Completed</span>
              <span className="text-lg font-headline font-bold text-primary">{stats.completedTasks}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
