"use client";

import React from 'react';

interface Book {
  id: string;
  title: string;
  subject?: string;
  grade?: string;
  image?: string;
  chapters?: number;
}

interface LibrarySectionProps {
  books?: Book[];
  loading?: boolean;
  userGrade?: string;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({ books = [], loading = false, userGrade = 'Grade 12' }) => {
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

  const displayBooks = books.length > 0 ? books : [
    {
      id: '1',
      title: 'Advanced Mathematics',
      subject: 'Mathematics',
      grade: userGrade,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop'
    },
    {
      id: '2',
      title: 'Physics Fundamentals',
      subject: 'Physics',
      grade: userGrade,
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=600&fit=crop'
    },
    {
      id: '3',
      title: 'Chemistry Essentials',
      subject: 'Chemistry',
      grade: userGrade,
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=600&fit=crop'
    },
    {
      id: '4',
      title: 'Biology Complete',
      subject: 'Biology',
      grade: userGrade,
      image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=600&fit=crop'
    }
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
        {displayBooks.slice(0, 4).map((book, index) => (
          <div 
            key={book.id || index}
            className="flex bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-surface-container"
          >
            <div className="w-1/3 h-48 relative">
              <img 
                alt={book.title} 
                className="w-full h-full object-cover" 
                src={book.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop'}
              />
              <div className="absolute inset-0 bg-primary/10"></div>
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-container/30 px-2 py-1 rounded-md">
                  {book.grade || 'Grade 12'}
                </span>
                <h4 className="font-headline font-bold text-lg mt-2 mb-1">{book.title}</h4>
                <p className="text-on-surface-variant text-xs mb-3 truncate">{book.subject || 'Subject'}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold font-headline transition-all hover:bg-primary-dim">Practice</button>
                <button className="flex-1 bg-surface-container-high text-on-surface py-2 rounded-lg text-xs font-bold font-headline transition-all hover:bg-surface-variant">Flashcards</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
