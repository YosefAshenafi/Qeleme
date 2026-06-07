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
export type NewActivity = Omit<BaseActivity, 'id' | 'timestamp' | 'username'> & Record<string, unknown>;

export function getActivityDurationSeconds(activity: Activity): number {
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
