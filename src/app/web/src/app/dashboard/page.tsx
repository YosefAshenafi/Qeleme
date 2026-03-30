"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickAccessGrid } from "@/components/dashboard/QuickAccessGrid";
import { LibrarySection } from "@/components/dashboard/LibrarySection";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Footer } from "@/components/dashboard/Footer";

interface User {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  grade?: string;
  region?: string;
  progress?: number;
  mastery?: number;
  streak?: number;
  tasksCompleted?: number;
  completedTasks?: number;
  gradeProgress?: number;
}

interface UserStats {
  progress?: number;
  mastery?: number;
  tasksCompleted?: number;
  currentStreak?: number;
  performanceHistory?: number[];
  totalTasksCompleted?: number;
  completedTasks?: number;
  gradeProgress?: number;
}

interface Subject {
  id: string;
  name: string;
  gradeId?: string;
}

interface Book {
  id: string;
  title: string;
  subject?: string;
  grade?: string;
  image?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userData, mcqData] = await Promise.all([
          api.getUser().catch(() => null),
          api.getMCQData().catch(() => null)
        ]);

        const user = userData?.data || userData;
        if (user) {
          setUser(user);
          
          // Try to get stats if available
          try {
            const statsData = await api.getUserStats();
            if (statsData?.data) {
              setStats(statsData.data);
            } else if (statsData) {
              setStats(statsData);
            }
          } catch {
            // Stats not available, use defaults
          }
          
          // Also try to extract stats from user object if available
          if (user.progress !== undefined || user.mastery !== undefined) {
            setStats(prev => ({
              ...prev,
              progress: user.progress,
              mastery: user.mastery,
              currentStreak: user.streak,
              tasksCompleted: user.tasksCompleted,
              completedTasks: user.completedTasks,
              gradeProgress: user.gradeProgress
            }));
          }
        }

        // Process MCQ data to get subjects and books
        if (mcqData?.grades) {
          const allSubjects: Subject[] = [];
          const allBooks: Book[] = [];
          
          mcqData.grades.forEach((grade: { id: string; name: string; subjects?: Subject[] }) => {
            if (grade.subjects) {
              grade.subjects.forEach((subject: Subject) => {
                allSubjects.push({
                  ...subject,
                  gradeId: grade.id
                });
                allBooks.push({
                  id: subject.id,
                  title: subject.name,
                  subject: subject.name,
                  grade: grade.name,
                  image: getBookImage(subject.name)
                });
              });
            }
          });
          
          setSubjects(allSubjects);
          setBooks(allBooks.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getBookImage = (subjectName: string): string => {
    const images: Record<string, string> = {
      'Mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop',
      'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=600&fit=crop',
      'Chemistry': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=600&fit=crop',
      'Biology': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=600&fit=crop',
      'English': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
      'History': 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=600&fit=crop',
      'Geography': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=600&fit=crop',
    };
    
    const key = Object.keys(images).find(k => subjectName.toLowerCase().includes(k.toLowerCase()));
    return images[key || 'Mathematics'] || images['Mathematics'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.fullName || user?.username || 'Student';
  const userGrade = user?.grade ? `Grade ${user.grade}` : 'Grade 12';

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased m-plus-motif relative">
      <TopNav user={user} />
      
      <main className="pt-24 pb-12 px-6 md:px-12 w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10">
        {/* Left Column: Main Dashboard */}
        <div className="flex-1 space-y-8">
          <HeroSection 
            userName={userName}
            grade={userGrade}
            stats={stats || undefined}
          />
          <QuickAccessGrid />
          <LibrarySection books={books} userGrade={userGrade} loading={false} />
        </div>

        {/* Right Column: Sidebar */}
        <Sidebar stats={stats || undefined} />
      </main>

      <Footer />
      
      {/* Background motif for whole page */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-tertiary/5 blur-3xl rounded-full translate-y-1/4 -translate-x-1/4"></div>
      </div>
    </div>
  );
}
