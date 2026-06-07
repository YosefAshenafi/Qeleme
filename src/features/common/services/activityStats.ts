import {
  type Activity,
  type MCQActivity,
  type KGQuestionActivity,
  type PictureMCQActivity,
  type UserStats,
  getActivityDurationSeconds,
} from './activityTypes';

// Pure aggregation of completed activities into UserStats: totals, per-subject
// and per-grade breakdowns, activity-type breakdown and streaks. Extracted from
// ActivityTrackingService.updateStats so the math is testable in isolation.
export function computeUserStats(activities: Activity[]): UserStats {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const completedActivities = activities.filter(activity => {
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
    }

    switch (activity.type) {
      case 'mcq': {
        const mcqActivity = activity as MCQActivity;
        stats.totalQuestionsAnswered += mcqActivity.questionsAnswered;
        stats.totalCorrectAnswers += mcqActivity.correctAnswers || 0;
        subjectStats.questionsAnswered += mcqActivity.questionsAnswered;
        subjectStats.correctAnswers += mcqActivity.correctAnswers || 0;
        gradeStats.questionsAnswered += mcqActivity.questionsAnswered;
        gradeStats.correctAnswers += mcqActivity.correctAnswers || 0;
        break;
      }

      case 'flashcard':
        break;

      case 'kg_question':
      case 'picture_mcq': {
        const kgActivity = activity as KGQuestionActivity | PictureMCQActivity;
        stats.totalQuestionsAnswered += kgActivity.questionsAnswered;
        stats.totalCorrectAnswers += kgActivity.correctAnswers;
        subjectStats.questionsAnswered += kgActivity.questionsAnswered;
        subjectStats.correctAnswers += kgActivity.correctAnswers;
        gradeStats.questionsAnswered += kgActivity.questionsAnswered;
        gradeStats.correctAnswers += kgActivity.correctAnswers;
        break;
      }
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

  return stats;
}
