import AsyncStorage from '@react-native-async-storage/async-storage';

// Activity types
export type ActivityType = 'mcq' | 'flashcard' | 'homework' | 'study' | 'kg_question' | 'picture_mcq';

// Base activity interface
export interface BaseActivity {
  id: string;
  type: ActivityType;
  timestamp: number;
  grade: string;
  subject: string;
  chapter?: string;
  duration?: number; // in minutes
  score?: number; // percentage or raw score
  totalQuestions?: number;
  correctAnswers?: number;
  details: string;
  status: 'completed' | 'in_progress' | 'abandoned';
}

// Specific activity interfaces
export interface MCQActivity extends BaseActivity {
  type: 'mcq';
  examType?: 'national' | 'regular';
  year?: number;
  questionsAnswered: number;
  timeSpent: number; // in seconds
}

export interface FlashcardActivity extends BaseActivity {
  type: 'flashcard';
  cardsReviewed: number;
  cardsMastered: number;
  timeSpent: number; // in seconds
}

export interface HomeworkActivity extends BaseActivity {
  type: 'homework';
  questionCount: number;
  hasImage: boolean;
  responseTime: number; // in seconds
}

export interface KGQuestionActivity extends BaseActivity {
  type: 'kg_question';
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
}

export interface PictureMCQActivity extends BaseActivity {
  type: 'picture_mcq';
  categoryId: number;
  categoryName: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
}

export type Activity = MCQActivity | FlashcardActivity | HomeworkActivity | KGQuestionActivity | PictureMCQActivity;

// User statistics interface
export interface UserStats {
  totalActivities: number;
  totalStudyTime: number; // in minutes
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: number;
  subjectBreakdown: {
    [subject: string]: {
      activities: number;
      timeSpent: number;
      questionsAnswered: number;
      correctAnswers: number;
      averageScore: number;
    };
  };
  gradeBreakdown: {
    [grade: string]: {
      activities: number;
      timeSpent: number;
      questionsAnswered: number;
      correctAnswers: number;
    };
  };
  activityTypeBreakdown: {
    [type in ActivityType]: {
      count: number;
      timeSpent: number;
      lastActivity: number;
    };
  };
}

// Storage keys
const ACTIVITIES_KEY = '@user_activities';
const STATS_KEY = '@user_stats';
const RECENT_ACTIVITIES_KEY = '@recentActivities'; // Keep for backward compatibility

class ActivityTrackingService {
  private static instance: ActivityTrackingService;
  private activities: Activity[] = [];
  private stats: UserStats | null = null;

  private constructor() {}

  public static getInstance(): ActivityTrackingService {
    if (!ActivityTrackingService.instance) {
      ActivityTrackingService.instance = new ActivityTrackingService();
    }
    return ActivityTrackingService.instance;
  }

  // Initialize the service by loading data from storage
  public async initialize(): Promise<void> {
    try {
      await this.loadActivities();
      await this.loadStats();
    } catch (error) {
      console.error('Failed to initialize ActivityTrackingService:', error);
    }
  }

  // Load activities from AsyncStorage
  private async loadActivities(): Promise<void> {
    try {
      const activitiesJson = await AsyncStorage.getItem(ACTIVITIES_KEY);
      if (activitiesJson) {
        this.activities = JSON.parse(activitiesJson);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
      this.activities = [];
    }
  }

  // Load stats from AsyncStorage
  private async loadStats(): Promise<void> {
    try {
      const statsJson = await AsyncStorage.getItem(STATS_KEY);
      if (statsJson) {
        this.stats = JSON.parse(statsJson);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      this.stats = null;
    }
  }

  // Save activities to AsyncStorage
  private async saveActivities(): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(this.activities));
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
  }

  // Save stats to AsyncStorage
  private async saveStats(): Promise<void> {
    try {
      if (this.stats) {
        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
      }
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  // Add a new activity
  public async addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newActivity: Activity = {
        ...activity,
        id: `${activity.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      this.activities.push(newActivity);

      // Keep only last 1000 activities to prevent storage bloat
      if (this.activities.length > 1000) {
        this.activities = this.activities.slice(-1000);
      }

      await this.saveActivities();
      await this.updateStats();
      await this.updateRecentActivities(newActivity);
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  }

  // Update recent activities for backward compatibility
  private async updateRecentActivities(activity: Activity): Promise<void> {
    try {
      const recentActivity = {
        type: activity.type,
        grade: activity.grade,
        subject: activity.subject,
        chapter: activity.chapter || '',
        timestamp: activity.timestamp,
        details: activity.details,
        status: activity.status,
      };

      const existingActivities = await AsyncStorage.getItem(RECENT_ACTIVITIES_KEY);
      let activities: any[] = [];
      
      if (existingActivities) {
        activities = JSON.parse(existingActivities);
      }
      
      activities.unshift(recentActivity);
      if (activities.length > 20) {
        activities = activities.slice(0, 20);
      }
      
      await AsyncStorage.setItem(RECENT_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to update recent activities:', error);
    }
  }

  // Calculate and update user statistics
  private async updateStats(): Promise<void> {
    try {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Initialize stats
      const stats: UserStats = {
        totalActivities: this.activities.length,
        totalStudyTime: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        averageScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: 0,
        subjectBreakdown: {},
        gradeBreakdown: {},
        activityTypeBreakdown: {
          mcq: { count: 0, timeSpent: 0, lastActivity: 0 },
          flashcard: { count: 0, timeSpent: 0, lastActivity: 0 },
          homework: { count: 0, timeSpent: 0, lastActivity: 0 },
          study: { count: 0, timeSpent: 0, lastActivity: 0 },
          kg_question: { count: 0, timeSpent: 0, lastActivity: 0 },
          picture_mcq: { count: 0, timeSpent: 0, lastActivity: 0 },
        },
      };

      // Process each activity
      this.activities.forEach(activity => {
        // Basic stats
        stats.totalStudyTime += activity.duration || 0;
        stats.lastActivityDate = Math.max(stats.lastActivityDate, activity.timestamp);

        // Subject breakdown
        if (!stats.subjectBreakdown[activity.subject]) {
          stats.subjectBreakdown[activity.subject] = {
            activities: 0,
            timeSpent: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            averageScore: 0,
          };
        }

        const subjectStats = stats.subjectBreakdown[activity.subject];
        subjectStats.activities++;
        subjectStats.timeSpent += activity.duration || 0;

        // Grade breakdown
        if (!stats.gradeBreakdown[activity.grade]) {
          stats.gradeBreakdown[activity.grade] = {
            activities: 0,
            timeSpent: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
          };
        }

        const gradeStats = stats.gradeBreakdown[activity.grade];
        gradeStats.activities++;
        gradeStats.timeSpent += activity.duration || 0;

        // Activity type breakdown
        const typeStats = stats.activityTypeBreakdown[activity.type];
        typeStats.count++;
        typeStats.timeSpent += activity.duration || 0;
        typeStats.lastActivity = Math.max(typeStats.lastActivity, activity.timestamp);

        // Type-specific processing
        switch (activity.type) {
          case 'mcq':
            const mcqActivity = activity as MCQActivity;
            stats.totalQuestionsAnswered += mcqActivity.questionsAnswered;
            stats.totalCorrectAnswers += mcqActivity.correctAnswers || 0;
            subjectStats.questionsAnswered += mcqActivity.questionsAnswered;
            subjectStats.correctAnswers += mcqActivity.correctAnswers || 0;
            gradeStats.questionsAnswered += mcqActivity.questionsAnswered;
            gradeStats.correctAnswers += mcqActivity.correctAnswers || 0;
            break;

          case 'flashcard':
            const flashcardActivity = activity as FlashcardActivity;
            stats.totalQuestionsAnswered += flashcardActivity.cardsReviewed;
            stats.totalCorrectAnswers += flashcardActivity.cardsMastered;
            subjectStats.questionsAnswered += flashcardActivity.cardsReviewed;
            subjectStats.correctAnswers += flashcardActivity.cardsMastered;
            gradeStats.questionsAnswered += flashcardActivity.cardsReviewed;
            gradeStats.correctAnswers += flashcardActivity.cardsMastered;
            break;

          case 'homework':
            const homeworkActivity = activity as HomeworkActivity;
            stats.totalQuestionsAnswered += homeworkActivity.questionCount;
            subjectStats.questionsAnswered += homeworkActivity.questionCount;
            gradeStats.questionsAnswered += homeworkActivity.questionCount;
            break;

          case 'kg_question':
          case 'picture_mcq':
            const kgActivity = activity as KGQuestionActivity | PictureMCQActivity;
            stats.totalQuestionsAnswered += kgActivity.questionsAnswered;
            stats.totalCorrectAnswers += kgActivity.correctAnswers;
            subjectStats.questionsAnswered += kgActivity.questionsAnswered;
            subjectStats.correctAnswers += kgActivity.correctAnswers;
            gradeStats.questionsAnswered += kgActivity.questionsAnswered;
            gradeStats.correctAnswers += kgActivity.correctAnswers;
            break;
        }
      });

      // Calculate average scores
      if (stats.totalQuestionsAnswered > 0) {
        stats.averageScore = Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100);
      }

      // Calculate subject average scores
      Object.keys(stats.subjectBreakdown).forEach(subject => {
        const subjectStats = stats.subjectBreakdown[subject];
        if (subjectStats.questionsAnswered > 0) {
          subjectStats.averageScore = Math.round((subjectStats.correctAnswers / subjectStats.questionsAnswered) * 100);
        }
      });

      // Calculate learning streak
      const sortedActivities = [...this.activities].sort((a, b) => b.timestamp - a.timestamp);
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let lastDate = 0;

      for (let i = 0; i < sortedActivities.length; i++) {
        const activityDate = new Date(sortedActivities[i].timestamp);
        const activityDay = Math.floor(activityDate.getTime() / oneDay);

        if (i === 0) {
          lastDate = activityDay;
          tempStreak = 1;
          currentStreak = 1;
        } else {
          const daysDiff = lastDate - activityDay;
          if (daysDiff === 1) {
            tempStreak++;
            lastDate = activityDay;
          } else if (daysDiff > 1) {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 1;
            lastDate = activityDay;
          }
        }
      }

      bestStreak = Math.max(bestStreak, tempStreak);
      
      // Check if current streak is still active (within last 2 days)
      const today = Math.floor(now / oneDay);
      const lastActivityDay = Math.floor(stats.lastActivityDate / oneDay);
      if (today - lastActivityDay <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }

      stats.currentStreak = currentStreak;
      stats.bestStreak = bestStreak;

      this.stats = stats;
      await this.saveStats();
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  // Get user statistics
  public getStats(): UserStats | null {
    return this.stats;
  }

  // Get activities by type
  public getActivitiesByType(type: ActivityType): Activity[] {
    return this.activities.filter(activity => activity.type === type);
  }

  // Get activities by subject
  public getActivitiesBySubject(subject: string): Activity[] {
    return this.activities.filter(activity => activity.subject === subject);
  }

  // Get activities by grade
  public getActivitiesByGrade(grade: string): Activity[] {
    return this.activities.filter(activity => activity.grade === grade);
  }

  // Get recent activities (last N activities)
  public getRecentActivities(limit: number = 10): Activity[] {
    return [...this.activities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get activities for a specific date range
  public getActivitiesInRange(startDate: number, endDate: number): Activity[] {
    return this.activities.filter(
      activity => activity.timestamp >= startDate && activity.timestamp <= endDate
    );
  }

  // Clear all data (for testing or reset)
  public async clearAllData(): Promise<void> {
    try {
      this.activities = [];
      this.stats = null;
      await AsyncStorage.removeItem(ACTIVITIES_KEY);
      await AsyncStorage.removeItem(STATS_KEY);
      await AsyncStorage.removeItem(RECENT_ACTIVITIES_KEY);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Helper methods for specific activity types
  public async trackMCQActivity(data: {
    grade: string;
    subject: string;
    chapter?: string;
    examType?: 'national' | 'regular';
    year?: number;
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
    score?: number;
  }): Promise<void> {
    await this.addActivity({
      type: 'mcq',
      grade: data.grade,
      subject: data.subject,
      chapter: data.chapter,
      examType: data.examType,
      year: data.year,
      questionsAnswered: data.questionsAnswered,
      correctAnswers: data.correctAnswers,
      timeSpent: data.timeSpent,
      score: data.score,
      duration: Math.round(data.timeSpent / 60), // Convert to minutes
      details: `Completed ${data.questionsAnswered} MCQ questions in ${data.subject}`,
      status: 'completed',
    });
  }

  public async trackFlashcardActivity(data: {
    grade: string;
    subject: string;
    chapter?: string;
    cardsReviewed: number;
    cardsMastered: number;
    timeSpent: number;
  }): Promise<void> {
    await this.addActivity({
      type: 'flashcard',
      grade: data.grade,
      subject: data.subject,
      chapter: data.chapter,
      cardsReviewed: data.cardsReviewed,
      cardsMastered: data.cardsMastered,
      timeSpent: data.timeSpent,
      duration: Math.round(data.timeSpent / 60), // Convert to minutes
      details: `Reviewed ${data.cardsReviewed} flashcards in ${data.subject}`,
      status: 'completed',
    });
  }

  public async trackHomeworkActivity(data: {
    grade: string;
    subject: string;
    questionCount: number;
    hasImage: boolean;
    responseTime: number;
  }): Promise<void> {
    await this.addActivity({
      type: 'homework',
      grade: data.grade,
      subject: data.subject,
      questionCount: data.questionCount,
      hasImage: data.hasImage,
      responseTime: data.responseTime,
      duration: Math.round(data.responseTime / 60), // Convert to minutes
      details: `Asked ${data.questionCount} homework question${data.questionCount > 1 ? 's' : ''} in ${data.subject}`,
      status: 'completed',
    });
  }

  public async trackKGQuestionActivity(data: {
    grade: string;
    subject: string;
    categoryId: number;
    categoryName: string;
    subcategoryId?: number;
    subcategoryName?: string;
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
  }): Promise<void> {
    await this.addActivity({
      type: 'kg_question',
      grade: data.grade,
      subject: data.subject,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      subcategoryId: data.subcategoryId,
      subcategoryName: data.subcategoryName,
      questionsAnswered: data.questionsAnswered,
      correctAnswers: data.correctAnswers,
      timeSpent: data.timeSpent,
      duration: Math.round(data.timeSpent / 60), // Convert to minutes
      details: `Completed ${data.questionsAnswered} KG questions in ${data.categoryName}`,
      status: 'completed',
    });
  }

  public async trackPictureMCQActivity(data: {
    grade: string;
    subject: string;
    categoryId: number;
    categoryName: string;
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
  }): Promise<void> {
    await this.addActivity({
      type: 'picture_mcq',
      grade: data.grade,
      subject: data.subject,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      questionsAnswered: data.questionsAnswered,
      correctAnswers: data.correctAnswers,
      timeSpent: data.timeSpent,
      duration: Math.round(data.timeSpent / 60), // Convert to minutes
      details: `Completed ${data.questionsAnswered} picture MCQ questions in ${data.categoryName}`,
      status: 'completed',
    });
  }
}

export default ActivityTrackingService;
