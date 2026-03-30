"use client";

import React, { useState } from 'react';

interface Subject {
  id: string;
  name: string;
  gradeId?: string;
  image_url?: string;
}

interface Book {
  id: string;
  title: string;
  subject?: string;
  grade?: string;
  image?: string;
  coverColor?: string;
  coverGradient?: string[];
}

interface LibrarySectionProps {
  books?: Book[];
  loading?: boolean;
  userGrade?: string;
  subjects?: Subject[];
}

const SUBJECT_STYLES: Record<string, { gradient: string[]; icon: string }> = {
  'mathematics': { gradient: ['#3B82F6', '#1D4ED8'], icon: 'calculate' },
  'math': { gradient: ['#3B82F6', '#1D4ED8'], icon: 'calculate' },
  'physics': { gradient: ['#8B5CF6', '#6D28D9'], icon: 'science' },
  'chemistry': { gradient: ['#F97316', '#EA580C'], icon: 'biotech' },
  'biology': { gradient: ['#22C55E', '#16A34A'], icon: 'eco' },
  'english': { gradient: ['#EC4899', '#DB2777'], icon: 'menu_book' },
  'amharic': { gradient: ['#EF4444', '#DC2626'], icon: 'menu_book' },
  'history': { gradient: ['#D97706', '#B45309'], icon: 'history_edu' },
  'geography': { gradient: ['#64748B', '#475569'], icon: 'public' },
  'civics': { gradient: ['#6366F1', '#4F46E5'], icon: 'account_balance' },
  'economics': { gradient: ['#14B8A6', '#0D9488'], icon: 'trending_up' },
};

export const LibrarySection: React.FC<LibrarySectionProps> = ({ 
  books = [], 
  loading = false, 
  userGrade = 'Grade 12',
  subjects = []
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const getSubjectStyle = (subjectName: string) => {
    const normalized = subjectName.toLowerCase();
    for (const [key, value] of Object.entries(SUBJECT_STYLES)) {
      if (normalized.includes(key)) return value;
    }
    return { gradient: ['#3B82F6', '#1D4ED8'], icon: 'menu_book' };
  };

  const handleImageError = (subjectId: string) => {
    setImageErrors(prev => ({ ...prev, [subjectId]: true }));
  };

  if (loading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Your Library</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container animate-pulse">
              <div className="w-1/3 h-48 bg-surface-container-low"></div>
              <div className="flex-1 p-5 space-y-3">
                <div className="h-4 bg-surface-container-low rounded w-1/3"></div>
                <div className="h-6 bg-surface-container-low rounded w-3/4"></div>
                <div className="h-3 bg-surface-container-low rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const displaySubjects = subjects.length > 0 ? subjects : [
    { id: '1', name: 'Mathematics', image_url: '' },
    { id: '2', name: 'Physics', image_url: '' },
    { id: '3', name: 'Chemistry', image_url: '' },
    { id: '4', name: 'Biology', image_url: '' },
  ];

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Your Library</h2>
        <button className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
          View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displaySubjects.slice(0, 4).map((subject) => {
          const style = getSubjectStyle(subject.name);
          const hasImage = subject.image_url && subject.image_url.length > 0 && !imageErrors[subject.id];
          
          return (
            <div 
              key={subject.id}
              className="flex bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-surface-container"
            >
              {/* Book Cover */}
              <div className="w-36 h-48 relative flex-shrink-0">
                {hasImage ? (
                  <>
                    <img 
                      src={subject.image_url} 
                      alt={subject.name}
                      className="w-full h-full object-cover rounded-r-md"
                      onError={() => handleImageError(subject.id)}
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/30 rounded-r-md" />
                  </>
                ) : (
                  <>
                    <div 
                      className="absolute inset-0 rounded-r-md overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`,
                      }}
                    >
                      {/* Book spine effect */}
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/20" />
                      
                      {/* Book content */}
                      <div className="flex flex-col items-center justify-center h-full p-3">
                        <span className="material-symbols-outlined text-white text-4xl mb-2 drop-shadow-md">
                          {style.icon}
                        </span>
                        <span className="text-white text-xs font-bold text-center leading-tight drop-shadow-md line-clamp-3">
                          {subject.name}
                        </span>
                      </div>
                    </div>
                    {/* Book shadow */}
                    <div className="absolute -right-2 top-1 bottom-1 w-2 bg-black/20 rounded-r-full" />
                  </>
                )}
              </div>
              
              <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-container/30 px-2 py-1 rounded-md">
                    {userGrade}
                  </span>
                  <h4 className="font-headline font-bold text-lg mt-2 mb-1 truncate">{subject.name}</h4>
                  <p className="text-on-surface-variant text-xs mb-3 truncate">
                    {subject.name} practice materials
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold font-headline transition-all hover:bg-primary-dim">Practice</button>
                  <button className="flex-1 bg-surface-container-high text-on-surface py-2 rounded-lg text-xs font-bold font-headline transition-all hover:bg-surface-variant">Flashcards</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
