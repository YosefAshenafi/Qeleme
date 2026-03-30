"use client";

import React from 'react';

interface QuickAccessItem {
  id?: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

interface QuickAccessGridProps {
  items?: QuickAccessItem[];
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ items }) => {
  const defaultItems: QuickAccessItem[] = [
    {
      title: 'Practice Tests',
      description: 'Take mock exams and quizzes',
      icon: 'quiz',
      color: 'primary'
    },
    {
      title: 'Flashcards',
      description: 'Review key concepts',
      icon: 'style',
      color: 'secondary'
    },
    {
      title: 'Progress Track',
      description: 'View your learning journey',
      icon: 'trending_up',
      color: 'tertiary'
    }
  ];

  const quickAccess = items || defaultItems;

  const colorMap: Record<string, string> = {
    primary: "bg-primary text-on-primary",
    secondary: "bg-surface-container-lowest border-b-4 border-secondary",
    tertiary: "bg-surface-container-lowest border-b-4 border-tertiary-container",
  };

  const iconColorMap: Record<string, string> = {
    primary: "text-on-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {quickAccess.map((item, index) => (
        <div 
          key={item.id || index}
          className={`${colorMap[item.color || 'primary']} p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-48`}
        >
          <span className={`material-symbols-outlined text-3xl group-hover:scale-110 transition-transform ${iconColorMap[item.color || 'primary']}`}>
            {item.icon}
          </span>
          <div>
            <h3 className={`font-headline text-xl font-bold mb-1 ${item.color === 'primary' ? 'text-on-primary' : 'text-on-surface'}`}>
              {item.title}
            </h3>
            <p className={`${item.color === 'primary' ? 'text-on-primary/80' : 'text-on-surface-variant'} text-sm`}>
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};
