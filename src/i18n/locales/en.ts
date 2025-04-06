export default {
  home: {
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
      }
    },
    recentActivity: {
      title: "Recent Activity",
      noActivities: "No recent activities",
      completed: "Completed",
      inProgress: "In Progress"
    },
    motivationalQuotes: {
      title: "Daily Motivation"
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
      continue: 'Continue',
      howManyChildren: 'How many children do you have?',
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
    subtitle: "Let's learn something new today!",
    categories: {
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
      'Toys': 'Toys'
    },
    instructions: {
      subtitle: "Let's learn something new!",
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
    }
  }
}; 