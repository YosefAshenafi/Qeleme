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
  onboarding: {
    language: {
      title: 'Choose Your Language',
      subtitle: 'Select your preferred language',
    },
    welcome: {
      title: 'Welcome to Qelem',
      subtitle: 'Your personal learning companion',
      description: 'Start your learning journey with personalized study materials and interactive exercises.',
    },
    mcq: {
      title: 'Practice with MCQs',
      subtitle: 'Test your knowledge',
      description: 'Challenge yourself with questions and track your progress.',
    },
    flashcards: {
      title: 'Learn with Flashcards',
      subtitle: 'Review key concepts',
      description: 'Flip and study with interactive flashcards to reinforce your learning.',
    },
    homework: {
      title: 'Get Homework Help',
      subtitle: 'Expert assistance',
      description: 'Connect with tutors and get help with your homework questions.',
    },
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get Started',
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
    otp: {
      title: 'Verify Your Phone',
      subtitle: 'Enter the 6-digit code sent to your phone',
      error: {
        invalid: 'Invalid verification code',
        incomplete: 'Please enter all digits'
      },
      resend: {
        text: "Didn't receive the code?",
        button: 'Resend'
      },
      verify: 'Verify'
    },
    planSelection: {
      title: 'Choose Your Plan',
      subtitleSingle: 'Select your preferred plan',
      subtitleMultiple: 'Select a plan for all children',
      total: 'Total',
      continue: 'Continue',
      free: 'Free',
      calculation: '{{planPrice}} ETB × {{numberOfChildren}} children = {{total}} ETB',
      pricePerChild: 'Price per child: {{price}} ETB',
      success: {
        title: 'Registration Successful!',
        message: 'Your account has been created successfully. Please login to continue your learning journey.',
        parentMessage: 'Your family account has been created successfully. You and your children can now login using your password.',
        button: 'Go to Login'
      },
      error: {
        title: 'Registration Failed',
        message: 'We couldn\'t complete your registration. Please try again.',
        parentMessage: 'We couldn\'t complete your family registration. Please try again.',
        childrenMessage: 'Some children accounts could not be created. Please try again.',
        network: 'Unable to connect to the server. Please check your internet connection and try again.',
        button: 'Try Again'
      },
      plans: {
        '3': {
          name: 'Free',
          features: [
            'Basic access to learning materials',
            'Limited practice questions',
            'Basic progress tracking',
            'Community support'
          ]
        },
        '6': {
          name: '6 Months',
          features: [
            'Access to all learning materials',
            'Practice questions',
            'Progress tracking',
            'Basic support'
          ]
        },
        '12': {
          name: '12 Months',
          features: [
            'Everything in 6 Months plan',
            'Priority support',
            'Advanced analytics',
            'Exclusive content'
          ]
        }
      }
    }
  },
  home: {
    welcome: 'Welcome back, {{name}}!',
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
  },
  login: {
    welcome: 'Welcome to Qelem',
    subtitle: 'Empowering minds, one lesson at a time',
    username: {
      label: 'Username',
      placeholder: 'Enter your username',
      error: {
        required: 'Username is required',
        invalid: 'Please enter a valid username'
      }
    },
    password: {
      label: 'Password',
      placeholder: 'Password',
      error: {
        required: 'Password is required'
      }
    },
    error: {
      invalidCredentials: 'Invalid username or password',
      serverError: 'Invalid credentials.'
    },
    signIn: 'Sign In',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up'
  },
  resetPassword: {
    title: 'Reset Password',
    phoneNumber: 'Phone number',
    verificationCode: 'Enter verification code',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    sendCode: 'Send Verification Code',
    verifyCode: 'Verify Code',
    resetPassword: 'Reset Password',
    phoneSubtitle: 'Enter your phone number to receive a verification code',
    verifySubtitle: 'Enter the verification code sent to your phone',
    resetSubtitle: 'Create a new password',
    backToLogin: 'Back to Login',
  },
  signup: {
    title: 'Create Account',
    subtitle: 'Join our community',
    roleSelection: {
      title: 'Select Your Role',
      subtitle: 'Choose how you want to use Qelem',
      student: {
        title: 'Student',
        description: 'I want to learn and practice',
        features: {
          materials: 'Access study materials',
          practice: 'Practice questions',
          progress: 'Track progress'
        }
      },
      parent: {
        title: 'Parent',
        description: 'I want to manage my children\'s learning',
        features: {
          monitor: 'Monitor progress',
          manage: 'Manage children',
          updates: 'Get updates'
        }
      }
    },
    childrenSelection: {
      title: 'Add Your Children',
      subtitle: 'How many children do you want to register?',
      addChild: 'Add Child',
      child1: 'Child 1',
      child2: 'Child 2',
      child3: 'Child 3',
      child4: 'Child 4',
      child5: 'Child 5',
      child: 'Child',
      childNumber: 'Child {number}',
      continue: 'Continue'
    },
    fullName: 'Full Name',
    username: 'Username',
    phoneNumber: '9-digit number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    grade: {
      label: 'Select your grade',
      title: 'Select Grade'
    },
    terms: {
      prefix: 'I accept the ',
      link: 'Terms and Conditions',
      title: 'Terms and Conditions',
      content: `1. Acceptance of Terms\n\nBy accessing and using the Qelem app, you agree to be bound by these Terms and Conditions.\n\n2. User Registration\n\nUsers must provide accurate and complete information during registration. Users are responsible for maintaining the confidentiality of their account credentials.\n\n3. Privacy Policy\n\nYour use of the app is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information.\n\n4. User Conduct\n\nUsers agree to:\n- Use the app for lawful purposes only\n- Respect other users' privacy and rights\n- Not share inappropriate or harmful content\n- Not attempt to disrupt the app's functionality\n\n5. Content\n\nUsers retain ownership of their content but grant us license to use it for app functionality.\n\n6. Termination\n\nWe reserve the right to terminate or suspend accounts that violate these terms.\n\n7. Changes to Terms\n\nWe may update these terms periodically. Continued use of the app constitutes acceptance of new terms.`
    },
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    errors: {
      fullNameRequired: 'Please enter your full name',
      phoneRequired: 'Please enter your phone number',
      passwordRequired: 'Please enter a password',
      passwordMismatch: 'Passwords do not match',
      acceptTerms: 'Please accept the terms and conditions',
      gradeRequired: 'Please select your grade',
      incompleteChildrenData: 'Please complete all children information',
      generic: 'An error occurred during signup',
      network: 'Network error. Please try again.',
      networkConnection: 'Unable to connect to the server. Please check your internet connection.',
      timeout: 'Request timed out. Please try again.',
    },
  },
  payment: {
    title: 'Choose Your Plan',
    subtitle: 'Select the plan that best suits your learning needs',
    plans: {
      freeTrial: {
        title: 'Free Trial',
        features: {
          questions: '20 Questions',
          flashcards: '20 Flashcards',
          homework: '20 Homework Helps'
        },
        price: 'ETB 0',
        getStarted: 'Get Started'
      },
      sixMonth: {
        title: '6 Month Plan',
        badge: 'Most Popular',
        features: {
          questions: 'Unlimited Questions',
          flashcards: 'Unlimited Flashcards',
          homework: 'Unlimited Homework Helps'
        },
        price: 'ETB 499',
        period: '/6 months',
        getStarted: 'Get Started'
      },
      twelveMonth: {
        title: '12 Month Plan',
        badge: 'Best Value',
        features: {
          questions: 'Unlimited Questions',
          flashcards: 'Unlimited Flashcards',
          homework: 'Unlimited Homework Helps'
        },
        price: 'ETB 799',
        period: '/12 months',
        getStarted: 'Get Started'
      }
    }
  }
} 