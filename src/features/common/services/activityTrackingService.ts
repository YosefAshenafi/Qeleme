import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityType = 'mcq' | 'flashcard' | 'study' | 'kg_question' | 'picture_mcq';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  timestamp: number;
  username: string; 
  grade: string;
  subject: string;
  chapter?: string;
  duration?: number; 
  score?: number; 
  totalQuestions?: number;
  correctAnswers?: number;
  details: string;
  status: 'completed' | 'in_progress' | 'abandoned';
}

export interface MCQActivity extends BaseActivity {
  type: 'mcq';
  examType?: 'national' | 'regular';
  year?: number;
  questionsAnswered: number;
  timeSpent: number; 
}

export interface FlashcardActivity extends BaseActivity {
  type: 'flashcard';
  cardsReviewed: number;
  cardsMastered: number;
  timeSpent: number; 
}

export interface KGQuestionActivity extends BaseActivity {
  type: 'kg_question';
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; 
}

export interface PictureMCQActivity extends BaseActivity {
  type: 'picture_mcq';
  categoryId: number;
  categoryName: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; 
}

export type Activity = MCQActivity | FlashcardActivity | KGQuestionActivity | PictureMCQActivity;
type NewActivity = Omit<BaseActivity, 'id' | 'timestamp' | 'username'> & Record<string, unknown>;

function getActivityDurationSeconds(activity: Activity): number {
  const withTime = activity as { timeSpent?: number };
  if (typeof withTime.timeSpent === 'number' && withTime.timeSpent >= 0) {
    return withTime.timeSpent;
  }
  return (activity.duration ?? 0) * 60;
}

export interface UserStats {
  totalActivities: number;
  totalStudyTime: number; 
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
    } catch (error) {
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
    } catch (error) {
      this.activities = [];
    }
  }

  
  private async loadStats(username: string): Promise<void> {
    try {
      const statsJson = await AsyncStorage.getItem(getStatsKey(username));
      if (statsJson) {
        this.stats = JSON.parse(statsJson);
      }
    } catch (error) {
      this.stats = null;
    }
  }

  
  private async saveActivities(): Promise<void> {
    try {
      if (this.currentUsername) {
        await AsyncStorage.setItem(getActivitiesKey(this.currentUsername), JSON.stringify(this.activities));
      }
    } catch (error) {
    }
  }

  
  private async saveStats(): Promise<void> {
    try {
      if (this.stats && this.currentUsername) {
        await AsyncStorage.setItem(getStatsKey(this.currentUsername), JSON.stringify(this.stats));
      }
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
    }
  }

  
  private async updateStats(): Promise<void> {
    try {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      
      
      const completedActivities = this.activities.filter(activity => {
        return activity.status === 'completed' &&
               activity.subject &&
               activity.subject.trim() !== '' &&
               activity.subject.toLowerCase() !== 'unknown' &&
               activity.subject.toLowerCase() !== 'undefined';
      });
      
      const stats: UserStats = {
        totalActivities: completedActivities.length,
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
          study: { count: 0, timeSpent: 0, lastActivity: 0 },
          kg_question: { count: 0, timeSpent: 0, lastActivity: 0 },
          picture_mcq: { count: 0, timeSpent: 0, lastActivity: 0 },
        },
      };

      
      
      completedActivities.forEach(activity => {
        const durationSec = getActivityDurationSeconds(activity);
        const durationMin = durationSec / 60;

        
        stats.totalStudyTime += durationMin;
        stats.lastActivityDate = Math.max(stats.lastActivityDate, activity.timestamp);

        
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
        subjectStats.timeSpent += durationMin;

        
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
        gradeStats.timeSpent += durationMin;

        
        const typeStats = stats.activityTypeBreakdown[activity.type];
        if (typeStats) {
          typeStats.count++;
          typeStats.timeSpent += durationMin;
          typeStats.lastActivity = Math.max(typeStats.lastActivity, activity.timestamp);
        } else {
          
        }

        
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

      
      if (stats.totalQuestionsAnswered > 0) {
        stats.averageScore = Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100);
      }

      
      Object.keys(stats.subjectBreakdown).forEach(subject => {
        const subjectStats = stats.subjectBreakdown[subject];
        if (subjectStats.questionsAnswered > 0) {
          subjectStats.averageScore = Math.round((subjectStats.correctAnswers / subjectStats.questionsAnswered) * 100);
        }
      });

      
      const sortedActivities = [...completedActivities].sort((a, b) => b.timestamp - a.timestamp);
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
    } catch (error) {
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
    } catch (error) {
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
      duration: Math.round(data.timeSpent / 60),
      details: `Completed ${data.questionsAnswered} picture MCQ questions in ${data.categoryName}`,
      status: 'completed',
    });
  }
}

export default ActivityTrackingService;
