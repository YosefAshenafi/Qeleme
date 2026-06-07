import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  type ActivityType,
  type Activity,
  type NewActivity,
  type UserStats,
} from './activityTypes';
import { computeUserStats } from './activityStats';

// Re-exported so existing consumers can keep importing activity types from this
// module (the definitions now live in ./activityTypes).
export type {
  ActivityType,
  BaseActivity,
  MCQActivity,
  FlashcardActivity,
  KGQuestionActivity,
  PictureMCQActivity,
  Activity,
  UserStats,
} from './activityTypes';

const getActivitiesKey = (username: string) => `@user_activities_${username}`;
const getStatsKey = (username: string) => `@user_stats_${username}`;
const RECENT_ACTIVITIES_KEY = '@recentActivities'; 

class ActivityTrackingService {
  private static instance: ActivityTrackingService;
  private activities: Activity[] = [];
  private stats: UserStats | null = null;
  private currentUsername: string | null = null;

  private constructor() {}

  public static getInstance(): ActivityTrackingService {
    if (!ActivityTrackingService.instance) {
      ActivityTrackingService.instance = new ActivityTrackingService();
    }
    return ActivityTrackingService.instance;
  }

  
  public async initialize(username?: string): Promise<void> {
    try {
      if (username) {
        this.currentUsername = username;
        await this.loadActivities(username);
        
        await this.updateStats();
      } else {
        
        this.activities = [];
        this.stats = null;
        this.currentUsername = null;
      }
    } catch {
    }
  }

  
  private async loadActivities(username: string): Promise<void> {
    try {
      const activitiesJson = await AsyncStorage.getItem(getActivitiesKey(username));
      if (activitiesJson) {
        const allActivities = JSON.parse(activitiesJson);
        
        this.activities = allActivities.filter((activity: Activity) => activity.username === username);
      } else {
        this.activities = [];
      }
    } catch {
      this.activities = [];
    }
  }

  
  private async loadStats(username: string): Promise<void> {
    try {
      const statsJson = await AsyncStorage.getItem(getStatsKey(username));
      if (statsJson) {
        this.stats = JSON.parse(statsJson);
      }
    } catch {
      this.stats = null;
    }
  }

  
  private async saveActivities(): Promise<void> {
    try {
      if (this.currentUsername) {
        await AsyncStorage.setItem(getActivitiesKey(this.currentUsername), JSON.stringify(this.activities));
      }
    } catch {
    }
  }

  
  private async saveStats(): Promise<void> {
    try {
      if (this.stats && this.currentUsername) {
        await AsyncStorage.setItem(getStatsKey(this.currentUsername), JSON.stringify(this.stats));
      }
    } catch {
    }
  }

  
  public async addActivity(activity: NewActivity): Promise<void> {
    try {
      if (!this.currentUsername) {
        return;
      }
      
      const newActivity = {
        ...activity,
        username: this.currentUsername,
        id: `${activity.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      } as Activity;

      this.activities.push(newActivity);

      
      if (this.activities.length > 1000) {
        this.activities = this.activities.slice(-1000);
      }

      await this.saveActivities();
      await this.updateStats();
      await this.updateRecentActivities(newActivity);
    } catch {
    }
  }

  
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
    } catch {
    }
  }

  
  private async updateStats(): Promise<void> {
    try {
      this.stats = computeUserStats(this.activities);
      await this.saveStats();
    } catch {
    }
  }

  
  public getStats(): UserStats | null {
    return this.stats;
  }

  
  public getActivitiesByType(type: ActivityType): Activity[] {
    return this.activities.filter(activity => activity.type === type);
  }

  
  public getActivitiesBySubject(subject: string): Activity[] {
    return this.activities.filter(activity => activity.subject === subject);
  }

  
  public getActivitiesByGrade(grade: string): Activity[] {
    return this.activities.filter(activity => activity.grade === grade);
  }

  
  public getRecentActivities(limit: number = 10): Activity[] {
    return [...this.activities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  
  public getActivitiesInRange(startDate: number, endDate: number): Activity[] {
    return this.activities.filter(
      activity => activity.timestamp >= startDate && activity.timestamp <= endDate
    );
  }

  
  public async clearAllData(): Promise<void> {
    try {
      if (this.currentUsername) {
        await AsyncStorage.removeItem(getActivitiesKey(this.currentUsername));
        await AsyncStorage.removeItem(getStatsKey(this.currentUsername));
      }
      this.activities = [];
      this.stats = null;
      await AsyncStorage.removeItem(RECENT_ACTIVITIES_KEY);
    } catch {
    }
  }

  
  public async clearUserData(username: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(getActivitiesKey(username));
      await AsyncStorage.removeItem(getStatsKey(username));
      if (this.currentUsername === username) {
        this.activities = [];
        this.stats = null;
        this.currentUsername = null;
      }
    } catch {
    }
  }

  
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
      duration: Math.round(data.timeSpent / 60),
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
      duration: Math.round(data.timeSpent / 60),
      details: `Reviewed ${data.cardsReviewed} flashcards in ${data.subject}`,
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
      duration: Math.round(data.timeSpent / 60),
      details: `Completed ${data.questionsAnswered} kindergarten questions in ${data.categoryName}`,
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
      duration: Math.round(data.timeSpent / 60),
      details: `Completed ${data.questionsAnswered} picture MCQ questions in ${data.categoryName}`,
      status: 'completed',
    });
  }
}

export default ActivityTrackingService;
