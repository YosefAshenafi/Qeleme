export default {
  errors: {
    network: {
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.'
    },
    generic: {
      title: 'Error',
      message: 'Something went wrong. Please try again.'
    }
  },
  home: {
    welcome: 'Welcome {{name}}!',
    subtitle: 'Ready to learn something new today?',
    noActivity: 'No recent activity. Start learning!',
    goto: 'Go to Home Screen',
    quickActions: {
      title: 'Quick Actions',
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
      },
      nationalExams: {
        title: 'National Exams',
        subtitle: 'Practice with past papers',
        yearExam: '{{year}} National Exam',
        grade: 'Grade {{grade}}'
      }
    },
    reportCards: {
      performance: {
        title: "Performance",
        subtitle: "Your learning progress",
        stats: {
          quizzesTaken: "Quizzes Taken",
          successRate: "Success Rate"
        }
      },
      studyProgress: {
        title: "Study Progress",
        subtitle: "Time spent learning",
        stats: {
          dailyGoal: "Daily Goal",
          weeklyGoal: "Weekly Goal"
        }
      },
      streak: {
        title: "Learning Streak",
        subtitle: "Days of consistent learning",
        stats: {
          currentStreak: "Current Streak",
          bestStreak: "Best Streak"
        }
      },
      learningStreak: {
        title: "Learning Streak",
        subtitle: "Days of consistent learning",
        stats: {
          currentStreak: "Current Streak",
          bestStreak: "Best Streak"
        }
      },
      studyFocus: {
        title: "Study Focus",
        subtitle: "Your learning patterns",
        stats: {
          topSubject: "Top Subject",
          hoursPerSubject: "Hours per Subject"
        }
      }
    },
    recentActivity: {
      title: "Recent Activity",
      noActivities: "No recent activities",
      completed: "Completed",
      inProgress: "In Progress"
    },
    activityTypes: {
      mcq: 'MCQ Quiz',
      flashcard: 'Flashcards',
      homework: 'Homework',
      study: 'Study Session'
    },
    seeAll: 'See All',
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
  reports: {
    title: 'Reports',
    loading: 'Loading your progress...',
    progressStats: {
      title: 'Your Progress'
    },
    overallProgress: {
      title: 'Overall Progress',
      topicsCompleted: 'Topics Completed',
      studyHours: 'Study Hours'
    },
    performance: {
      title: 'Performance',
      averageScore: 'Average Score',
      quizzesTaken: 'Quizzes Taken',
      successRate: 'Success Rate',
      improvement: 'Improvement'
    },
    learningStreak: {
      title: 'Learning Streak',
      currentStreak: 'Current Streak',
      bestStreak: 'Best Streak',
      totalDaysActive: 'Total Days Active'
    },
    subjectBreakdown: {
      title: 'Subject Breakdown',
      progress: 'Progress',
      score: 'Score'
    },
    recentActivity: {
      title: 'Recent Activity',
      quiz: 'Quiz',
      study: 'Study',
      homework: 'Homework',
      completed: 'Completed',
      duration: '{hours} hours',
      activity: 'activity',
      activities: 'activities',
      chapter: 'chapter',
      chapters: 'chapters',
      noChapter: 'No Chapter'
    },
    howCalculated: {
      title: 'How Reports are Calculated',
      overallProgress: {
        title: 'Overall Progress',
        description: 'Calculated based on completed topics and study hours'
      },
      performance: {
        title: 'Performance',
        description: 'Based on quiz scores and success rates'
      },
      studyHours: {
        title: 'Study Hours',
        description: 'Tracked from active study sessions'
      }
    },
    activityTypes: {
      quiz: 'Quiz',
      study: 'Study',
      homework: 'Homework',
      flashcard: 'Flashcards',
      mcq: 'MCQ Quiz',
      kg_question: 'KG Question',
      picture_mcq: 'Picture Quiz'
    },
    status: {
      completed: 'Completed'
    },
    duration: '{{hours}}h',
    scoreFormat: '{{score}}%',
    progressFormat: '{{progress}}% Completed',
    noData: 'Start learning to see your progress here!',
    comingSoon: 'More reports coming soon!',
    comingSoonDescription: 'We are working on additional analytics and insights for your learning journey.'
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
    timer: {
      text: 'Code expires in'
    },
    resend: {
      text: 'Didn\'t receive the code?',
      button: 'Resend Code'
    },
    send: {
      text: 'Didn\'t receive the code?',
      button: 'Send Code'
    }
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
    resetConfirmation: 'Are you sure you want to reset the app? This will take you back to the onboarding screen.',
    resetAppSuccess: 'App data has been reset successfully. Your progress and reports have been cleared.',
    resetAppSuccessNote: 'You are still logged in and can continue using the app.',
    resetAppError: 'Failed to reset app data. Please try again.',
    resetPasswordPrompt: 'Please enter your password to reset app data. This will clear all your progress and reports, but you will remain logged in.',
    logout: 'Logout',
    role: 'Student',
    grade: '12th Grade',
    school: 'Example High School',
    joinDate: 'Joined {date}',
    joinDateValue: 'January 2024',
    englishName: 'Yosef Ashenafi',
    email: 'yosefashenafi7@gmail.com',
    stats: {
      pictureQuestions: 'Picture Questions',
      cardGroups: 'Card Groups',
      mcqsCompleted: 'MCQs Completed',
      flashcardsClicked: 'Flashcards Clicked',
      homeworkQuestions: 'Homework Questions',
      studyHours: 'Study Hours',
    },
    accountSettingsLabels: {
      fullName: 'Full Name',
      username: 'Username',
      role: 'Role',
      grade: 'Grade',
      joined: 'Joined',
      paymentPlan: 'Payment Plan'
    },
    save: 'Save',
    edit: 'Edit',
    title: 'Settings',
    about: 'About Qelem',
    aboutInfo: 'Qelem is an innovative educational platform designed to enhance learning through interactive content, personalized experiences, and comprehensive progress tracking.',
    contactUs: 'Contact Us',
    version: 'App Version',
    dangerZone: 'Danger Zone',
    importantNotice: 'Important Notice',
    deleteAccount: 'Delete Account',
    deleteAccountWarning: 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers.',
    deleteAccountConfirmation: 'Are you sure you want to delete your account? This action cannot be undone.',
    enterOTPToDelete: 'Enter verification code to delete account',
    deleteAccountOTPSubtitle: 'We sent a verification code to your phone number to confirm account deletion. Please also enter your password.',
    confirmDelete: 'Delete Account',
    accountDeleted: 'Account deleted successfully',
    enterPassword: 'Enter your password',
    enterAllFields: 'Please enter phone number, verification code, and password'
  },
  auth: {
    errors: {
      paymentFailed: 'Payment failed. Please try again.',
    },
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
        incomplete: 'Please enter all digits',
        invalidData: 'Invalid user data. Please try again.',
        verificationFailed: 'Failed to verify OTP. Please try again.'
      },
      send: {
        text: "Ready to verify your phone?",
        button: 'Send OTP'
      },
      resend: {
        text: "Didn't receive the code?",
        button: 'Resend'
      },
      timer: {
        text: 'Time remaining:'
      },
      verify: 'Verify'
    },
    planSelection: {
      title: 'Choose Your Plan',
      subtitleSingle: 'Select your preferred plan',
      subtitleMultiple: 'Select a plan for all children',
      total: 'Total',
      continue: 'Continue',
      finish: 'Finish',
      pay: 'Pay',
      free: 'Free',
      recommended: 'Recommended',
      months: 'months',
      calculation: '{{planPrice}} ETB × {{numberOfChildren}} children = {{total}} ETB',
      pricePerChild: 'Price per child: {{price}} ETB',
      descriptions: {
        free: 'Free plan with limited access to basic features',
        oneMonth: '1 month of full access to all learning materials',
        threeMonths: '3 months of full access to all learning materials',
        sixMonths: '6 months of full access to all learning materials',
        twelveMonths: '12 months of full access with premium features',
        fullAccess: 'of full access to all learning materials'
      },
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
        '0': {
          name: 'Free',
          features: [
            'Basic access to learning materials',
            'Limited practice questions',
            'Basic progress tracking',
            'Community support'
          ]
        },
        '1': {
          name: '1 Month',
          features: [
            'Access to all learning materials',
            'Practice questions',
            'Progress tracking',
            'Basic support'
          ]
        },
        '3': {
          name: '3 Months',
          features: [
            'Access to all learning materials',
            'Practice questions',
            'Progress tracking',
            'Basic support'
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
  common: {
    error: 'Error',
    tryAgain: 'Try Again',
    back: 'Back',
    loading: 'Loading...',
    processing: 'Processing...',
    retry: 'Retry',
    imageLoadError: 'Image failed to load',
    grade: 'Grade',
  },
  mcq: {
    question: 'Question',
    title: 'MCQ Practice',
    selectSubject: 'Select Subject',
    subject: 'Subject',
    selectChapter: 'Select Chapter',
    chapter: 'Chapter',
    selectSubjectAndChapter: 'Select Subject and Chapter',
    selectSubjectPlaceholder: 'Select a subject',
    selectChapterPlaceholder: 'Select a chapter',
    selectExamType: 'Select Exam Type',
    nationalExam: 'National Exam',
    mcqExam: 'Qelem\'s MCQ Quizzes',
    nationalExamDescription: 'Try previous years\' national exam questions',
    mcqExamDescription: 'Try the multiple choice questions prepared for each chapter!',
    year: 'Year',
    selectYear: 'Select Year',
    startQuiz: 'Start Quiz',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    correct: 'Correct!',
    incorrect: 'Incorrect!',
    explanation: 'Explanation',
    of: 'of',
    pictureQuiz: {
      title: 'Picture Quiz',
      subtitle: 'Test your knowledge with images',
      startQuiz: 'Start Quiz',
      goToRegularQuestions: 'Go to Homepage',
      goToInstructions: 'Go to Instructions',
      unauthorizedText: 'You need to be authorized to access this feature.',
      noQuestionsAvailable: 'No questions available for this grade yet.',
      dragInstruction: 'Drag the picture and drop to the answer',
      instructions: {
        look: {
          title: 'Look at the Image',
          description: 'Carefully observe the image shown in the question.'
        },
        drag: {
          title: 'Drag and Drop',
          description: 'Drag the image to the correct answer option.'
        },
        next: {
          title: 'Move to Next',
          description: 'Click next to proceed to the next question.'
        }
      }
    },
    results: {
      title: 'Quiz Results',
      timeTaken: 'Time Taken: {{time}}',
      score: 'Score: {{score}}/{{total}}',
      percentage: '{{percentage}}%',
      message: {
        outstanding: 'Outstanding! You are a star!',
        great: 'Great job! Keep it up!',
        good: 'Good effort! You can do even better!',
        keepLearning: 'Keep practicing! You will improve!',
        genius: 'Outstanding! You\'re a genius!',
        doingWell: 'Great job! You\'re doing well!',
        notBad: 'Not bad! Keep practicing!',
        canDoBetter: 'Keep learning! You can do better!'
      },
      tryAgain: 'Try Other Remaining Questions',
      tryOtherQuestions: 'Try Other Remaining Questions',
      checkOtherQuestions: 'Check Other Questions',
      chooseAnotherSubject: 'Choose Another Subject',
      tryOtherNationalExam: 'Try Other Remaining National Exams',
      chooseAnotherNationalExamYear: 'Choose Another National Exam Year'
    },
    selectAnswer: 'Please select an answer before proceeding',
    noSubjectsFound: {
      title: 'No subjects found for your grade',
      description: 'We couldn\'t find any subjects for grade {{gradeName}}. This could be because:',
      reasons: {
        accountUpdate: 'Your account might need to be updated with the correct grade',
        serverUnavailable: 'The server is temporarily unavailable',
        contentBeingAdded: 'Content for your grade is still being added'
      }
    }
  },
  flashcards: {
    title: "Flashcards",
    selectSubjectAndChapter: "Select Subject and Chapter",
    subject: "Subject",
    selectSubject: "Select Subject",
    chapter: "Chapter",
    selectChapter: "Select Chapter",
    startFlashcards: "Start Flashcards",
    cardProgress: "Card {{current}} of {{total}}",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    loading: "Loading flashcards...",
    error: "Failed to load flashcards. Please check your internet connection and try again.",
    noFlashcards: "No flashcards available for this grade yet.",
    clickToReveal: "Click on the question to see the answer",
    tapToSeeAnswer: "Tap to see answer",
    tapToSeeQuestion: "Tap to see question",
    grades: {
      "grade-9": "Grade 9",
      "grade-10": "Grade 10",
      "grade-11": "Grade 11",
      "grade-12": "Grade 12"
    }
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
  signup: {
    title: 'Create Account',
    subtitle: 'Join Qelem',
    roleSelection: {
      title: 'Register',
      subtitle: 'Choose how you want to use Qelem',
      student: {
        title: 'Single Student',
        description: 'I want to learn and practice',
        features: {
          materials: 'Access study materials',
          practice: 'Practice questions',
          progress: 'Track progress'
        }
      },
      parent: {
        title: 'Multiple Students',
        description: 'I want to register multiple students with one phone number',
        features: {
          monitor: 'Register multiple students',
          manage: 'One phone number for all',
          updates: 'Easy management'
        }
      }
    },
    childrenSelection: {
      title: 'Register Multiple Students',
      subtitle: 'How many students do you want to register?',
      addChild: 'Add Student',
      child1: 'Student 1',
      child2: 'Student 2',
      child3: 'Student 3',
      child4: 'Student 4',
      child5: 'Student 5',
      child: 'Student',
      childNumber: 'Student {number}',
      continue: 'Continue',
      howManyChildren: 'How many students do you want to register?',
      enterNumberGreaterThanOne: 'Enter a number greater than 1'
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
    region: {
      label: 'Select your region',
      title: 'Select Region'
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
      fullNameMinLength: 'Full name must be at least 2 characters',
      fullNameInvalid: 'Full name contains invalid characters',
      phoneRequired: 'Please enter your phone number',
      phoneInvalid: 'Please enter a valid 9-digit phone number',
      phoneInvalidPrefix: 'Phone number must start with 9, 7, or 8',
      passwordRequired: 'Please enter a password',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordMaxLength: 'Password must be less than 50 characters',
      passwordMismatch: 'Passwords do not match',
      confirmPasswordRequired: 'Please confirm your password',
      usernameRequired: 'Please enter a username',
      usernameMinLength: 'Username must be at least 5 characters',
      usernameMaxLength: 'Username must be less than 20 characters',
      usernameInvalid: 'Username can only contain letters, numbers, underscore, and hyphen',
      usernameTaken: 'Username is already taken',
      acceptTerms: 'Please accept the terms and conditions',
      gradeRequired: 'Please select your grade',
      regionRequired: 'Please select your region',
      incompleteChildrenData: 'Please complete all children information',
      generic: 'An error occurred during signup',
      validationFailed: 'Please fix the errors below before continuing',
      navigationFailed: 'Failed to navigate. Please try again.',
      network: 'Network error. Please try again.',
      networkConnection: 'Unable to connect to the server. Please check your internet connection.',
      timeout: 'Request timed out. Please try again.',
    },
  },
  welcome: {
    title: 'Welcome to Qelem',
    subtitle: 'If you are new, please sign up. If you already have an account, please sign in.',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    contactInfo: {
      title: 'Contact Information',
      phone: 'Phone',
      email: 'Email'
    }
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
  kg: {
    welcome: 'Welcome {{name}}!',
    howToPlay: 'How to Play',
    subtitle: "Read the books and evaluate yourself with the questions!",
    letsHaveFun: "",
    categories: {
      // Fallback categories
      'Animals': 'Animals',
      'Colors': 'Colors',
      'Numbers': 'Numbers',
      'Shapes': 'Shapes',
      'Fruits': 'Fruits',
      'Vegetables': 'Vegetables',
      'Family': 'Family',
      'Body Parts': 'Body Parts',
      'Clothes': 'Clothes',
      'Weather': 'Weather',
      'Transport': 'Transport',
      'Food': 'Food',
      'School': 'School',
      'Toys': 'Toys',
      // API categories
      'Maths': 'Maths',
      'Domestic Animals': 'Domestic Animals',
      'Wild Animals': 'Wild Animals',
      'Household Items': 'Household Items',
      'Fruits and Vegetables': 'Fruits and Vegetables',
      'School Compound': 'School Compound',
      'Different Activities': 'Different Activities',
      'Foods': 'Foods',
      // UI text
      title: 'Choose Your Learning Adventure!',
      subtitle: 'Choose a topic and Start Learning!'
    },
    instructions: {
      subtitle: "Read the books and evaluate yourself with the questions!",
      look: {
        title: 'Look Carefully',
        description: 'Take your time to look at the pictures and understand what they show.'
      },
      choose: {
        title: 'Choose Wisely',
        description: 'Select the correct answer from the options given.'
      },
      haveFun: {
        title: 'Have Fun!',
        description: 'Learning is fun! Enjoy the process and celebrate your progress.'
      },
      start: 'Start Learning'
    },
    subcategories: {
      welcome: 'Welcome to {{category}}!',
      subtitle: 'Choose a topic to start learning',
      title: 'Choose Your Learning Adventure!',
      '1-10 Numbers': '1-10 Numbers',
      '11-20 Numbers': '11-20 Numbers',
      '1-10 Counting': '1-10 Counting',
      '11-20 Counting': '11-20 Counting',
      'Fill in the Blanks': 'Fill in the Blanks',
      'Middle Number 1-10': 'Middle Number 1-10',
      'Middle Number 11-20': 'Middle Number 11-20'
    }
  },
  subjects: {
    mathematics: {
      title: 'Mathematics',
      description: 'Learn numbers, formulas, and mathematical concepts',
      topics: {
        algebra: {
          title: 'Algebra',
          description: 'Learn about variables, equations, and inequalities',
          subtopics: {
            linearEquations: 'Linear Equations',
            quadraticEquations: 'Quadratic Equations',
            polynomials: 'Polynomials',
            inequalities: 'Inequalities'
          }
        },
        geometry: {
          title: 'Geometry',
          description: 'Study shapes, angles, and spaces',
          subtopics: {
            triangles: 'Triangles',
            circles: 'Circles',
            polygons: 'Polygons',
            coordinateGeometry: 'Coordinate Geometry'
          }
        },
        calculus: {
          title: 'Calculus',
          description: 'Study changes and areas',
          subtopics: {
            limits: 'Limits',
            derivatives: 'Derivatives',
            integrals: 'Integrals',
            differentialEquations: 'Differential Equations'
          }
        },
        statistics: {
          title: 'Statistics',
          description: 'Learn about data and probability',
          subtopics: {
            probability: 'Probability',
            dataAnalysis: 'Data Analysis',
            distributions: 'Distributions',
            hypothesisTesting: 'Hypothesis Testing'
          }
        },
        trigonometry: {
          title: 'Trigonometry',
          description: 'Study sines, cosines, and tangents',
          subtopics: {
            angles: 'Angles',
            identities: 'Identities',
            graphs: 'Graphs',
            applications: 'Applications'
          }
        }
      },
      difficultyLevels: {
        basic: 'Basic',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      },
      practiceTypes: {
        exercises: 'Exercises',
        problems: 'Problems',
        quizzes: 'Quizzes',
        tests: 'Tests'
      },
      resources: {
        formulas: 'Formulas',
        examples: 'Examples',
        tutorials: 'Tutorials',
        worksheets: 'Worksheets'
      }
    },
    physics: {
      title: 'Physics',
      description: 'Study matter, energy, and their interactions',
      topics: {
        mechanics: {
          title: 'Mechanics',
          description: 'Study motion and forces',
          subtopics: {
            kinematics: 'Kinematics',
            dynamics: 'Dynamics',
            energy: 'Energy and Work',
            momentum: 'Momentum'
          }
        },
        waves: {
          title: 'Waves',
          description: 'Study wave phenomena and properties',
          subtopics: {
            soundWaves: 'Sound Waves',
            lightWaves: 'Light Waves',
            interference: 'Interference',
            diffraction: 'Diffraction'
          }
        },
        electricity: {
          title: 'Electricity',
          description: 'Study electrical phenomena',
          subtopics: {
            charge: 'Electric Charge',
            current: 'Electric Current',
            circuits: 'Electric Circuits',
            magnetism: 'Magnetism'
          }
        },
        thermodynamics: {
          title: 'Thermodynamics',
          description: 'Study heat and temperature',
          subtopics: {
            temperature: 'Temperature',
            heat: 'Heat Transfer',
            laws: 'Laws of Thermodynamics',
            entropy: 'Entropy'
          }
        }
      }
    },
    chemistry: {
      title: 'Chemistry',
      description: 'Study matter and its transformations',
      topics: {
        inorganic: {
          title: 'Inorganic Chemistry',
          description: 'Study non-carbon compounds',
          subtopics: {
            periodicTable: 'Periodic Table',
            acids: 'Acids and Bases',
            salts: 'Salts',
            metals: 'Metals'
          }
        },
        organic: {
          title: 'Organic Chemistry',
          description: 'Study carbon compounds',
          subtopics: {
            hydrocarbons: 'Hydrocarbons',
            alcohols: 'Alcohols',
            acids: 'Organic Acids',
            polymers: 'Polymers'
          }
        },
        physical: {
          title: 'Physical Chemistry',
          description: 'Study chemical systems',
          subtopics: {
            thermodynamics: 'Thermodynamics',
            kinetics: 'Chemical Kinetics',
            equilibrium: 'Chemical Equilibrium',
            electrochemistry: 'Electrochemistry'
          }
        }
      }
    },
    biology: {
      title: 'Biology',
      description: 'Study life and living organisms',
      topics: {
        cellBiology: {
          title: 'Cell Biology',
          description: 'Study cell structure and function',
          subtopics: {
            cellStructure: 'Cell Structure',
            cellDivision: 'Cell Division',
            metabolism: 'Metabolism',
            transport: 'Cell Transport'
          }
        },
        genetics: {
          title: 'Genetics',
          description: 'Study inheritance and variation',
          subtopics: {
            inheritance: 'Inheritance',
            dna: 'DNA and RNA',
            mutation: 'Mutation',
            evolution: 'Evolution'
          }
        },
        ecology: {
          title: 'Ecology',
          description: 'Study organisms and environment',
          subtopics: {
            ecosystems: 'Ecosystems',
            populations: 'Populations',
            biodiversity: 'Biodiversity',
            conservation: 'Conservation'
          }
        },
        physiology: {
          title: 'Physiology',
          description: 'Study body systems',
          subtopics: {
            digestive: 'Digestive System',
            respiratory: 'Respiratory System',
            circulatory: 'Circulatory System',
            nervous: 'Nervous System'
          }
        }
      }
    }
  },
  payment: {
    title: 'Payment',
    subtitle: 'Redirecting to Chappa...',
    amount: 'Amount: {{amount}}',
    paymentMethod: 'Payment Method: {{paymentMethod}}',
    orderId: 'Order ID: {{orderId}}',
  }
}; 