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
  image_url?: string;
}

interface Grade {
  id: string;
  name: string;
  subjects?: Subject[];
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

const SUBJECT_COLORS: Record<string, { coverColor: string; coverGradient: string[] }> = {
  'mathematics': { coverColor: '#4A90E2', coverGradient: ['#4A90E2', '#357ABD'] },
  'math': { coverColor: '#4A90E2', coverGradient: ['#4A90E2', '#357ABD'] },
  'physics': { coverColor: '#9C27B0', coverGradient: ['#9C27B0', '#7B1FA2'] },
  'chemistry': { coverColor: '#FF9800', coverGradient: ['#FF9800', '#F57C00'] },
  'biology': { coverColor: '#4CAF50', coverGradient: ['#4CAF50', '#388E3C'] },
  'english': { coverColor: '#E91E63', coverGradient: ['#E91E63', '#C2185B'] },
  'amharic': { coverColor: '#FF5722', coverGradient: ['#FF5722', '#D84315'] },
  'history': { coverColor: '#795548', coverGradient: ['#795548', '#5D4037'] },
  'geography': { coverColor: '#607D8B', coverGradient: ['#607D8B', '#455A64'] },
  'civics': { coverColor: '#3F51B5', coverGradient: ['#3F51B5', '#303F9F'] },
  'economics': { coverColor: '#009688', coverGradient: ['#009688', '#00796B'] },
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const getSubjectCoverColor = (subjectName: string): { coverColor: string; coverGradient: string[] } => {
    const normalizedName = subjectName.toLowerCase();
    for (const [key, value] of Object.entries(SUBJECT_COLORS)) {
      if (normalizedName.includes(key)) {
        return value;
      }
    }
    return { coverColor: '#4A90E2', coverGradient: ['#4A90E2', '#357ABD'] };
  };

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
          
          try {
            const statsData = await api.getUserStats();
            if (statsData?.data) {
              setStats(statsData.data);
            } else if (statsData) {
              setStats(statsData);
            }
          } catch {
          }
          
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

        const gradeNumber = user?.grade?.replace(/[^\d]/g, '') || '12';
        
        if (mcqData?.grades) {
          const userGrade = mcqData.grades.find((g: Grade) => 
            g.id === `grade-${gradeNumber}` || g.name?.toLowerCase().includes(gradeNumber.toLowerCase())
          );
          
          if (userGrade?.subjects && userGrade.subjects.length > 0) {
            const gradeSubjects: Subject[] = userGrade.subjects.map((subject: Subject) => ({
              ...subject,
              gradeId: userGrade.id
            }));
            
            const gradeBooks: Book[] = userGrade.subjects.map((subject: Subject) => {
              const coverData = getSubjectCoverColor(subject.name);
              return {
                id: subject.id,
                title: subject.name,
                subject: subject.name,
                grade: userGrade.name,
                image: subject.image_url || '',
                coverColor: coverData.coverColor,
                coverGradient: coverData.coverGradient
              };
            });
            
            setSubjects(gradeSubjects);
            setBooks(gradeBooks.slice(0, 4));
          } else {
            const allSubjects: Subject[] = [];
            const allBooks: Book[] = [];
            
            mcqData.grades.forEach((grade: Grade) => {
              if (grade.subjects) {
                grade.subjects.forEach((subject: Subject) => {
                  const coverData = getSubjectCoverColor(subject.name);
                  allSubjects.push({
                    ...subject,
                    gradeId: grade.id
                  });
                  allBooks.push({
                    id: subject.id,
                    title: subject.name,
                    subject: subject.name,
                    grade: grade.name,
                    image: subject.image_url || '',
                    coverColor: coverData.coverColor,
                    coverGradient: coverData.coverGradient
                  });
                });
              }
            });
            
            setSubjects(allSubjects);
            setBooks(allBooks.slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.fullName || user?.username || 'Student';
  const userGrade = user?.grade ? `Grade ${user.grade.replace(/[^\d]/g, '')}` : 'Grade 12';

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased m-plus-motif relative">
      <TopNav user={user} />
      
      <main className="pt-24 pb-12 px-6 md:px-12 w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10">
        <div className="flex-1 space-y-8">
          <HeroSection 
            userName={userName}
            grade={userGrade}
            stats={stats || undefined}
          />
          <QuickAccessGrid />
          <LibrarySection 
            books={books} 
            userGrade={userGrade} 
            loading={false}
            subjects={subjects}
          />
        </div>

        <Sidebar stats={stats || undefined} />
      </main>

      <Footer />
      
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-tertiary/5 blur-3xl rounded-full translate-y-1/4 -translate-x-1/4"></div>
      </div>
    </div>
  );
}
