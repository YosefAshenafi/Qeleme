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
    kindergarten: 'Kindergarten',
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
      content: `TERMS AND CONDITIONS FOR QELEM\n\nLast Updated: December 2024\n\n1. ACCEPTANCE OF TERMS\n\nBy accessing, downloading, installing, or using the Qelem mobile application ("App"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use the App.\n\nThese Terms constitute a legally binding agreement between you and Qelem. By using the App, you represent that you are at least 13 years of age or have obtained parental consent to use the App.\n\n2. DESCRIPTION OF SERVICE\n\nQelem is an educational platform designed to provide interactive learning experiences for Ethiopian students through multiple choice questions (MCQ), flashcards, and progress tracking. The App helps students practice and improve their knowledge through interactive educational content.\n\n3. USER REGISTRATION AND ACCOUNT SECURITY\n\n3.1 Registration Requirements\nTo use certain features of the App, you must register for an account. During registration, you agree to:\n- Provide accurate, current, and complete information (including but not limited to your full name, phone number, username, region, and grade level)\n- Maintain and promptly update your account information\n- Maintain the security of your account credentials\n- Accept responsibility for all activities that occur under your account\n\n3.2 Account Security\nYou are solely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.\n\n4. PRIVACY AND DATA PROTECTION\n\n4.1 Privacy Policy\nYour use of the App is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.\n\n4.2 Data Collection and Use\nWe collect certain personal information from you, including but not limited to:\n- Full name\n- Phone number\n- Username\n- Region/location\n- Grade level\n- Learning progress and usage data (quiz scores, completed lessons, study materials accessed)\n\n4.3 Data Protection Commitment\nWE DO NOT SELL, RENT, OR SHARE YOUR PERSONAL INFORMATION (INCLUDING YOUR FULL NAME, PHONE NUMBER, REGION, OR ANY OTHER PERSONAL DATA) WITH THIRD PARTIES FOR MARKETING OR COMMERCIAL PURPOSES.\n\nYour personal information is collected and used solely for:\n- Providing and improving our educational services\n- Personalizing your learning experience\n- Processing your account registration and authentication\n- Sending important service-related communications\n- Complying with legal obligations\n\n4.4 Third-Party Service Providers\nWe may use trusted third-party service providers to assist in operating the App (such as cloud hosting, analytics, and payment processing). These providers are bound by strict confidentiality agreements and are only permitted to use your data for the specific purposes of providing services to us. They are prohibited from using your personal information for their own marketing purposes.\n\n4.5 Data Security\nWe implement industry-standard security measures to protect your personal information, including encryption, secure data transmission, and access controls.\n\n5. USER CONDUCT AND ACCEPTABLE USE\n\n5.1 Acceptable Use\nYou agree to use the App only for lawful purposes and in accordance with these Terms. You agree NOT to:\n- Use the App for any illegal or unauthorized purpose\n- Violate any applicable laws or regulations\n- Infringe upon the rights of others\n- Transmit any harmful, offensive, or inappropriate content\n- Attempt to gain unauthorized access to the App or its systems\n- Interfere with or disrupt the App's functionality\n- Use automated systems to access the App without permission\n- Impersonate any person or entity\n- Collect or harvest information about other users\n\n5.2 Educational Purpose\nThis App is designed for educational purposes only. You agree to use the App to enhance your learning experience and not to misuse the educational content or features.\n\n6. INTELLECTUAL PROPERTY\n\n6.1 App Ownership\nThe App, including all content, features, functionality, and software, is owned by Qelem and is protected by copyright, trademark, and other intellectual property laws.\n\n6.2 User Content\nYou retain ownership of any content you create or submit through the App. However, by submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of providing and improving the App's services.\n\n6.3 Restrictions\nYou may not:\n- Copy, modify, or create derivative works of the App\n- Reverse engineer, decompile, or disassemble the App\n- Remove any copyright or proprietary notices\n- Use the App's content for commercial purposes without permission\n\n7. PAYMENT TERMS\n\n7.1 Subscription Services\nIf you choose to purchase a subscription or premium features, you agree to pay all applicable fees. All fees are non-refundable unless otherwise required by law.\n\n7.2 Payment Processing\nPayments are processed through secure third-party payment processors. We do not store your complete payment card information on our servers.\n\n8. TERMINATION\n\n8.1 Termination by You\nYou may terminate your account at any time by contacting us or using the account deletion feature within the App.\n\n8.2 Termination by Us\nWe reserve the right to suspend or terminate your account immediately, without prior notice, if:\n- You violate these Terms\n- You engage in fraudulent, illegal, or harmful activities\n- We are required to do so by law\n- We discontinue the App or any part of it\n\n8.3 Effect of Termination\nUpon termination, your right to use the App will immediately cease. We may delete your account and all associated data, subject to our Privacy Policy and applicable law.\n\n9. DISCLAIMER OF WARRANTIES\n\nTHE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:\n- MERCHANTABILITY\n- FITNESS FOR A PARTICULAR PURPOSE\n- NON-INFRINGEMENT\n- ACCURACY OR RELIABILITY OF CONTENT\n- UNINTERRUPTED OR ERROR-FREE OPERATION\n\n10. LIMITATION OF LIABILITY\n\nTO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATED TO YOUR USE OF THE APP.\n\n11. INDEMNIFICATION\n\nYou agree to indemnify, defend, and hold harmless Qelem and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or related to:\n- Your use of the App\n- Your violation of these Terms\n- Your violation of any rights of another party\n\n12. CHILDREN'S PRIVACY\n\n12.1 Age Requirements\nThe App is designed for educational use and may be used by children under parental supervision. We comply with applicable children's privacy laws, including the Children's Online Privacy Protection Act (COPPA).\n\n12.2 Parental Consent\nIf you are under 13 years of age, you may only use the App with the consent and supervision of a parent or legal guardian.\n\n12.3 Parental Rights\nParents have the right to:\n- Review their child's personal information\n- Request deletion of their child's information\n- Refuse further collection of their child's information\n\n13. CHANGES TO TERMS\n\nWe reserve the right to modify these Terms at any time. We will notify you of material changes by:\n- Posting the updated Terms within the App\n- Updating the "Last Updated" date\n\nYour continued use of the App after such modifications constitutes your acceptance of the updated Terms. If you do not agree to the modified Terms, you must stop using the App.\n\n14. GOVERNING LAW AND DISPUTE RESOLUTION\n\n14.1 Governing Law\nThese Terms shall be governed by and construed in accordance with the laws of Ethiopia, without regard to its conflict of law provisions.\n\n14.2 Dispute Resolution\nAny disputes arising out of or relating to these Terms or the App shall be resolved through good faith negotiations. If a dispute cannot be resolved through negotiations, it shall be subject to the exclusive jurisdiction of the courts of Ethiopia.\n\n15. SEVERABILITY\n\nIf any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.\n\n16. ENTIRE AGREEMENT\n\nThese Terms, together with our Privacy Policy, constitute the entire agreement between you and Qelem regarding your use of the App and supersede all prior agreements and understandings.\n\n17. CONTACT INFORMATION\n\nIf you have any questions, concerns, or complaints about these Terms or the App, please contact us at:\n\nEmail: contact@qelem.net\nWebsite: www.qelem.net\n\n18. ACKNOWLEDGMENT\n\nBY USING THE QELEM APP, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.`
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