export default {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
  },
  navigation: {
    tabs: {
      home: 'Home',
      mcq: 'MCQ',
      flashcards: 'Flashcards',
      homework: 'Homework',
      profile: 'Profile',
      reports: 'Reports'
    }
  },
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
  },
  home: {
    welcome: 'Welcome back, Yosef!',
    subtitle: 'Ready to learn something new today?',
    recentActivity: 'Recent Activity',
    noActivity: 'No recent activity. Start learning!',
    quickActions: {
      mcq: {
        title: 'Practice MCQ',
        subtitle: 'Test your knowledge'
      },
      flashcards: {
        title: 'Flashcards',
        subtitle: 'Review key concepts'
      },
      homework: {
        title: 'Homework Help',
        subtitle: 'Get expert assistance'
      },
      reports: {
        title: 'Progress Report',
        subtitle: 'Track your learning'
      }
    },
    reportCards: {
      performance: {
        title: 'Performance',
        subtitle: 'Average Score',
        stats: {
          quizzesTaken: 'Quizzes Taken',
          successRate: 'Success Rate'
        }
      },
      studyProgress: {
        title: 'Study Progress',
        subtitle: 'Total Study Hours',
        stats: {
          dailyGoal: 'Daily Goal',
          weeklyGoal: 'Weekly Goal'
        }
      },
      learningStreak: {
        title: 'Learning Streak',
        subtitle: 'Days Active',
        stats: {
          currentStreak: 'Current Streak',
          bestStreak: 'Best Streak'
        }
      },
      studyFocus: {
        title: 'Study Focus',
        subtitle: 'Subjects Covered',
        stats: {
          topSubject: 'Top Subject',
          hoursPerSubject: 'Hours/Subject'
        }
      }
    },
    activityTypes: {
      mcq: 'MCQ Quiz',
      flashcard: 'Flashcards',
      homework: 'Homework',
      study: 'Study Session'
    },
    activityDetails: {
      completed: 'Completed',
      inProgress: 'In Progress',
      grade: 'Grade',
      subject: 'Subject',
      chapter: 'Chapter',
      duration: '{hours}h',
      questions: {
        completed: 'Completed 5 questions',
        reviewed: 'Reviewed 3 questions'
      },
      flashcards: {
        reviewed: 'Reviewed 10 flashcards'
      },
      homework: {
        submitted: 'Submitted homework',
        working: 'Working on homework'
      },
      study: {
        session: 'Study session - {duration}'
      }
    },
    motivationalQuotes: [
      {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      },
      {
        quote: "Education is not preparation for life; education is life itself.",
        author: "John Dewey"
      },
      {
        quote: "The beautiful thing about learning is that no one can take it away from you.",
        author: "B.B. King"
      }
    ]
  },
  profile: {
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    myQuestions: 'My Questions',
    myAnswers: 'My Answers',
    settings: 'Settings',
    accountSettings: 'Account Settings',
    notifications: 'Notifications',
    language: 'Language',
    theme: 'Theme',
    resetApp: 'Reset App',
    logout: 'Logout',
    role: 'Student',
    grade: '12th Grade',
    school: 'Example High School',
    joinDate: 'Joined {date}',
    joinDateValue: 'January 2024',
    englishName: 'Yosef Ashenafi',
    email: 'yosefashenafi7@gmail.com',
    stats: {
      mcqsCompleted: 'MCQs Completed',
      flashcardsClicked: 'Flashcards Clicked',
      homeworkQuestions: 'Homework Questions',
      studyHours: 'Study Hours',
    },
  },
  questions: {
    question: 'Question',
    answers: 'Answers',
    askQuestion: 'Ask a Question',
    yourQuestion: 'Your Question',
    addDetails: 'Add Details',
    tags: 'Tags',
  },
  settings: {
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    about: 'About',
    logout: 'Logout',
  },
  mcq: {
    title: 'Multiple Choice Questions',
    selectSubject: 'Select Subject and Chapter',
    correct: 'Correct!',
    incorrect: 'Incorrect!',
    subject: 'Subject',
    chapter: 'Chapter',
    selectSubjectPlaceholder: 'Select a subject',
    selectChapterPlaceholder: 'Select a chapter',
    startQuiz: 'Start Quiz',
    question: 'Question',
    of: 'of',
    timeTaken: 'Time Taken:',
    explanation: 'Explanation:',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    tryAgain: 'Try Again',
    chooseAnotherSubject: 'Choose Another Subject',
    selectAnswerMessage: 'Please select an answer before proceeding',
    results: {
      title: 'Quiz Results',
      score: 'Score',
      percentage: 'Percentage',
      message: {
        outstanding: "Outstanding! You're a genius!",
        great: "Great job! You're doing well!",
        good: "Not bad! Keep practicing!",
        keepLearning: "Keep learning! You can do better!"
      }
    },
    pictureQuiz: {
      title: 'Picture Quiz Time! 🎨',
      subtitle: "Let's learn with pictures!",
      instructions: {
        look: {
          title: "Look at the Picture 👀",
          description: "You'll see a picture at the top!"
        },
        drag: {
          title: "Drag to Answer 🖼️",
          description: "Drag the picture to the correct answer below!"
        },
        next: {
          title: "Next Question! ➡️",
          description: "See if you're right and continue to the next one!"
        }
      },
      startQuiz: 'Start Quiz! 🎉',
      correct: 'Correct!',
      incorrect: 'Incorrect!',
      showResult: 'Show Result',
      goToInstructions: 'Go to Instructions',
      unauthorized: 'You are not authorized to access picture questions.',
      goToRegular: 'Go to Regular Questions',
      noQuestions: 'No Questions Available'
    }
  },
  flashcards: {
    title: "Flash Cards",
    selectSubjectAndChapter: "Select Subject and Chapter",
    subject: "Subject",
    selectSubject: "Select a subject",
    chapter: "Chapter",
    selectChapter: "Select a chapter",
    startFlashcards: "Start Flashcards",
    cardProgress: "Card {{current}} of {{total}}",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    grades: {
      "grade-9": "Grade 9",
      "grade-10": "Grade 10",
      "grade-11": "Grade 11",
      "grade-12": "Grade 12"
    }
  },
  homework: {
    title: 'Homework Help',
    emptyState: 'Ask me anything about your homework!',
    inputPlaceholder: 'Ask your homework question...',
    thinking: 'Thinking',
    error: 'Sorry, I encountered an error. Please try again.',
    imageButton: 'Add Image',
    sendButton: 'Send Message',
    removeImage: 'Remove Image',
    activity: {
      type: 'homework',
      grade: 'grade-12',
      subject: 'General',
      chapter: 'Homework Help',
      details: 'Asked a homework question',
      status: 'Completed'
    }
  },
  reports: {
    title: 'Learning Reports',
    overallProgress: {
      title: 'Overall Progress',
      percentage: '{percentage}%',
      topicsCompleted: '{completed}/{total} Topics Completed',
      studyHours: '{hours}h Study Hours'
    },
    performance: {
      title: 'Performance',
      averageScore: '{score}%',
      quizzesTaken: '{count} Quizzes Taken',
      successRate: '{rate}% Success Rate',
      improvement: '{value} Improvement'
    },
    learningStreak: {
      title: 'Learning Streak',
      currentStreak: '{days} days',
      bestStreak: '{days}d Best Streak',
      totalActive: '{days}d Total Active'
    },
    subjectBreakdown: {
      title: 'Subject Breakdown',
      progress: '{progress}% Complete'
    },
    recentActivity: {
      title: 'Recent Activity',
      quiz: '{subject} - Quiz',
      study: '{subject} - Study',
      homework: '{subject} - Homework',
      score: 'Score: {score}%',
      duration: 'Duration: {duration}',
      status: 'Status: {status}'
    },
    howCalculated: {
      title: 'How Reports are Calculated',
      overallProgress: {
        title: 'Overall Progress',
        description: [
          '• Each unique subject counts as a topic',
          '• A topic is considered completed when:',
          '  - You\'ve taken at least 5 MCQ quizzes',
          '  - Your average score is 70% or higher',
          '• Progress = (Completed Topics / Total Topics) × 100'
        ]
      },
      performance: {
        title: 'Performance Metrics',
        description: [
          '• Average Score: Total of all MCQ scores ÷ Number of quizzes',
          '• Success Rate: Same as average score',
          '• Quizzes Taken: Total number of MCQ quizzes completed'
        ]
      },
      studyHours: {
        title: 'Study Hours',
        description: [
          '• Calculated from all study sessions',
          '• Each study activity\'s duration is added to the total'
        ]
      }
    }
  },
  subjects: {
    mathematics: 'Mathematics',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    history: 'History',
    geography: 'Geography',
    english: 'English',
    amharic: 'Amharic',
    civics: 'Civics',
    ict: 'ICT'
  }
} 