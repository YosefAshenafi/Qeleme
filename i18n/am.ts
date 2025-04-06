export default {
  common: {
    loading: 'እባክዎ ይጠብቁ...',
    error: 'ስህተት',
    success: 'ተሳክቷል',
    cancel: 'ሰርዝ',
    save: 'አስቀምጥ',
    delete: 'ሰርዝ',
    edit: 'አስተካክል',
    back: 'ተመለስ',
    comingSoon: 'በቅርብ ጊዜ ተጨማሪ ይገኛል! ይጠብቁን።',
    confirmation: 'ማረጋገጫ',
    confirm: 'አረጋግጥ',
  },
  navigation: {
    tabs: {
      home: 'ዋና ገጽ',
      mcq: 'ምርጫ',
      flashcards: 'ፍላሽካርድ',
      homework: 'የቤት ስራ',
      profile: 'መገለጫ',
      reports: 'ሪፖርቶች'
    }
  },
  auth: {
    signIn: 'ግባ',
    signUp: 'ተመዝገብ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    forgotPassword: 'የይለፍ ቃል ረስተዋል?',
    createAccount: 'አካውንት ፍጠር',
    alreadyHaveAccount: 'አካውንት አለዎት?',
    otp: {
      title: 'ስልክዎን ያረጋግጡ',
      subtitle: 'ወደ ስልክዎ የተላከውን 6-ዲጂት ኮድ ያስገቡ',
      error: {
        invalid: 'ልክ ያልሆነ የማረጋገጫ ኮድ',
        incomplete: 'እባክዎ ሁሉንም አሃዞች ያስገቡ'
      },
      resend: {
        text: 'ኮዱ አልደረሰዎትም?',
        button: 'እንደገና ይላኩ'
      },
      verify: 'ያረጋግጡ'
    },
    planSelection: {
      title: 'የእርስዎን እቅድ ይምረጡ',
      subtitleSingle: 'የሚፈልጉትን እቅድ ይምረጡ',
      subtitleMultiple: 'ለሁሉም ልጆች አንድ እቅድ ይምረጡ',
      total: 'ጠቅላላ',
      continue: 'ቀጥል',
      free: 'ነጻ',
      calculation: '{{planPrice}} ብር × {{numberOfChildren}} ልጆች = {{total}} ብር',
      pricePerChild: 'ለእያንዳንዱ ልጅ: {{price}} ብር',
      success: {
        title: 'ምዝገባ ተሳክቷል!',
        message: 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል። የመማሪያ ጉዞዎን ለመቀጠል እባክዎ ይግቡ።',
        parentMessage: 'የቤተሰብ መለያዎ በተሳካ ሁኔታ ተፈጥሯል። እርስዎ እና ልጆችዎ በእርስዎ የይለፍ ቃል መግባት ይችላሉ።',
        button: 'ወደ መግቢያ ይሂዱ'
      },
      error: {
        title: 'ምዝገባ አልተሳካም',
        message: 'ምዝገባዎን ማጠናቀቅ አልቻልንም። እባክዎ እንደገና ይሞክሩ።',
        parentMessage: 'የቤተሰብ ምዝገባዎን ማጠናቀቅ አልቻልንም። እባክዎ እንደገና ይሞክሩ።',
        childrenMessage: 'አንዳንድ የልጆች መለያዎችን መፍጠር አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
        network: 'ወደ አገልግሎት መገናኘት አልተቻለም። የበይነመረብ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።',
        button: 'እንደገና ይሞክሩ'
      },
      plans: {
        '0': {
          name: 'ነፃ',
          features: [
            'መሰረታዊ የመማሪያ ቁሳቁሶች',
            'የተወሰኑ የልምምድ ጥያቄዎች',
            'መሰረታዊ የእድገት ክትትል',
            'የማህበረሰብ ድጋፍ'
          ]
        },
        '1': {
          name: '1 ወር',
          features: [
            'ሁሉንም የትምህርት ቁሳቁሶች ማግኘት',
            'የልምምድ ጥያቄዎች',
            'የእድገት ክትትል',
            'መሰረታዊ ድጋፍ'
          ]
        },
        '3': {
          name: '3 ወራት',
          features: [
            'ሁሉንም የትምህርት ቁሳቁሶች ማግኘት',
            'የልምምድ ጥያቄዎች',
            'የእድገት ክትትል',
            'መሰረታዊ ድጋፍ'
          ]
        },
        '6': {
          name: '6 ወራት',
          features: [
            'ሁሉንም የትምህርት ቁሳቁሶች ማግኘት',
            'የልምምድ ጥያቄዎች',
            'የእድገት ክትትል',
            'መሰረታዊ ድጋፍ'
          ]
        },
        '12': {
          name: '12 ወራት',
          features: [
            'በ6 ወር እቅድ ያሉት ሁሉም ነገሮች',
            'ቅድሚያ የሚሰጠው ድጋፍ',
            'የላቀ ትንታኔ',
            'ልዩ ይዘት'
          ]
        }
      }
    }
  },
  home: {
    welcome: 'እንኳን በደህና ተመለሱ፣ {{name}}!',
    subtitle: 'ዛሬ አዲስ ነገር ለመማር ዝግጁ ነዎት?',
    recentActivity: 'የቅርብ ጊዜ እንቅስቃሴዎች',
    noActivity: 'ምንም የቅርብ ጊዜ እንቅስቃሴ የለም። መማር ይጀምሩ!',
    quickActions: {
      mcq: {
        title: 'ምርጫ ለመለማመድ',
        subtitle: 'እውቀትዎን ይፈትሹ'
      },
      flashcards: {
        title: 'ፍላሽካርዶች',
        subtitle: 'ዋና ሃሳቦችን ይከልሱ'
      },
      homework: {
        title: 'የቤት ስራ እርዳታ',
        subtitle: 'የባለሙያ እርዳታ ያግኙ'
      },
      reports: {
        title: 'የእድገት ሪፖርት',
        subtitle: 'ትምህርትዎን ይከታተሉ'
      }
    },
    reportCards: {
      performance: {
        title: 'አፈጻጸም',
        subtitle: 'አማካይ ውጤት',
        stats: {
          quizzesTaken: 'የተወሰዱ ፈተናዎች',
          successRate: 'የስኬት መጠን'
        }
      },
      studyProgress: {
        title: 'የጥናት እድገት',
        subtitle: 'ጠቅላላ የጥናት ሰዓታት',
        stats: {
          dailyGoal: 'የዕለት ግብ',
          weeklyGoal: 'የሳምንት ግብ'
        }
      },
      learningStreak: {
        title: 'የመማር ተከታታይነት',
        subtitle: 'ንቁ የነበሩባቸው ቀናት',
        stats: {
          currentStreak: 'የአሁኑ ተከታታይነት',
          bestStreak: 'ምርጥ ተከታታይነት'
        }
      },
      studyFocus: {
        title: 'የጥናት ትኩረት',
        subtitle: 'የተሸፈኑ ትምህርቶች',
        stats: {
          topSubject: 'ከፍተኛ ትምህርት',
          hoursPerSubject: 'ሰዓት/ትምህርት'
        }
      }
    },
    activityTypes: {
      mcq: 'ምርጫ ፈተና',
      flashcard: 'ፍላሽካርዶች',
      homework: 'የቤት ስራ',
      study: 'የጥናት ክፍለ ጊዜ'
    },
    activityDetails: {
      completed: 'ተጠናቅቋል',
      inProgress: 'በሂደት ላይ',
      grade: 'ክፍል',
      subject: 'ትምህርት',
      chapter: 'ምዕራፍ',
      duration: '{hours}ሰ',
      questions: {
        completed: '5 ጥያቄዎችን አጠናቅቋል',
        reviewed: '3 ጥያቄዎችን ገምግሟል'
      },
      flashcards: {
        reviewed: '10 ፍላሽካርዶችን ገምግሟል'
      },
      homework: {
        submitted: 'የቤት ስራ አስገብቷል',
        working: 'በቤት ስራ ላይ እየሰራ ነው'
      },
      study: {
        session: 'የጥናት ክፍለ ጊዜ - {duration}'
      }
    },
    motivationalQuotes: [
      {
        quote: "ታላቅ ስራ የምንሰራው የምንወደውን ስራ ስንሰራ ብቻ ነው።",
        author: "ስቲቭ ጆብስ"
      },
      {
        quote: "ትምህርት ለህይወት ዝግጅት አይደለም፤ ትምህርት በራሱ ህይወት ነው።",
        author: "ጆን ዴዊ"
      },
      {
        quote: "ስለ ትምህርት ያለው ቆንጆ ነገር፣ ማንም ሊወስደው የማይችል መሆኑ ነው።",
        author: "ቢ.ቢ. ኪንግ"
      }
    ]
  },
  profile: {
    myProfile: 'የእኔ መገለጫ',
    editProfile: 'መገለጫ አስተካክል',
    myQuestions: 'የእኔ ጥያቄዎች',
    myAnswers: 'የእኔ መልሶች',
    settings: 'ቅንብሮች',
    accountSettings: 'የአካውንት ቅንብሮች',
    notifications: 'ማሳወቂያዎች',
    language: 'ቋንቋ',
    theme: 'ገጽታ',
    resetApp: 'አፕሊኬሽኑን ዳግም አስጀምር',
    resetConfirmation: 'አፕሊኬሽኑን ዳግም ማስጀመር እንደሚፈልጉ እርግጠኛ ነዎት? ይህ ወደ መጀመሪያው ገጽ ይወስድዎታል።',
    logout: 'ውጣ',
    role: 'ተማሪ',
    grade: '12ኛ ክፍል',
    school: 'ምሳሌ ሁለተኛ ደረጃ ትምህርት ቤት',
    joinDate: '{date} ተቀላቅለዋል',
    joinDateValue: 'ጃንዋሪ 2024',
    englishName: 'ዮሴፍ አሸናፊ',
    email: 'yosefashenafi7@gmail.com',
    stats: {
      mcqsCompleted: 'የተጠናቀቁ ምርጫዎች',
      flashcardsClicked: 'የተመለከቱ ፍላሽካርዶች',
      homeworkQuestions: 'የቤት ስራ ጥያቄዎች',
      studyHours: 'የጥናት ሰዓታት'
    },
    errors: {
      imagePermission: 'ይቅርታ፣ ፎቶ ለመውሰድ ፈቃድ ያስፈልገናል!',
      imagePicking: 'ፎቶ መምረጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
      loadingImage: 'የመገለጫ ፎቶን መጫን አልተቻለም:',
      loadingStats: 'ስታቲስቲክስን መጫን አልተቻለም:',
    },
  },
  questions: {
    question: 'ጥያቄ',
    answers: 'መልሶች',
    askQuestion: 'ጥያቄ ጠይቅ',
    yourQuestion: 'የእርስዎ ጥያቄ',
    addDetails: 'ዝርዝሮችን ጨምር',
    tags: 'መለያዎች',
  },
  settings: {
    language: 'ቋንቋ',
    theme: 'ገጽታ',
    notifications: 'ማሳወቂያዎች',
    about: 'ስለ እኛ',
    logout: 'ውጣ',
  },
  mcq: {
    question: 'ጥያቄ',
    title: 'ምርጫ',
    selectSubject: 'ትምህርት ይምረጡ',
    subject: 'ትምህርት',
    chapter: 'ምዕራፍ',
    selectSubjectPlaceholder: 'ትምህርት ይምረጡ',
    selectChapterPlaceholder: 'ምዕራፍ ይምረጡ',
    startQuiz: 'ፈተና ይጀምሩ',
    previous: 'ቀዳሚ',
    next: 'ቀጣይ',
    finish: 'ጨርስ',
    correct: 'ትክክል!',
    incorrect: 'ስህተት!',
    explanation: 'ማብራሪያ',
    of: 'ከ',
    pictureQuiz: {
      title: 'የምስል ፈተና',
      subtitle: 'በምስሎች እውቀትዎን ይፈትሹ',
      startQuiz: 'ፈተና ይጀምሩ',
      goToRegularQuestions: 'ወደ መደበኛ ጥያቄዎች ይሂዱ',
      goToInstructions: 'ወደ መመሪያዎች ይሂዱ',
      unauthorizedText: 'ይህን ባህሪ ለመጠቀም ፈቃድ ያስፈልግዎታል።',
      noQuestionsAvailable: 'ለዚህ ክፍል ገና ምንም ጥያቄዎች አልተዘጋጁም።',
      instructions: {
        look: {
          title: 'ምስሉን ይመልከቱ',
          description: 'በጥያቄው ውስጥ የሚታየውን ምስል በጥንቃቄ ይመልከቱ።'
        },
        drag: {
          title: 'ጎትት እና አስቀምጥ',
          description: 'ምስሉን ወደ ትክክለኛው መልስ አማራጭ ጎትት።'
        },
        next: {
          title: 'ወደ ቀጣይ ይሂዱ',
          description: 'ወደ ቀጣይ ጥያቄ ለመሄድ ቀጣይ ይጫኑ።'
        }
      }
    },
    results: {
      title: 'የፈተና ውጤት',
      timeTaken: 'የተወሰደ ጊዜ: {{time}}',
      score: 'ውጤት: {{score}}/{{total}}',
      percentage: '{{percentage}}%',
      messages: {
        outstanding: 'በጣም ጥሩ! የልብ ልጅ ነዎት!',
        great: 'በጣም ጥሩ! በደንብ እያለሁ ነው!',
        good: 'በጣም አይደለም! መለማመድ ይቀጥሉ!',
        keepLearning: 'መማር ይቀጥሉ! የተሻለ ሊሆኑ ይችላሉ!'
      },
      tryAgain: 'እንደገና ይሞክሩ',
      chooseAnotherSubject: 'ሌላ ትምህርት ይምረጡ'
    },
    selectAnswer: 'እባክዎ ከመቀጠልዎ በፊት መልስ ይምረጡ'
  },
  flashcards: {
    title: "ፍላሽ ካርዶች",
    selectSubjectAndChapter: "መጽሐፍ እና ምዕራፍ ይምረጡ",
    subject: "መጽሐፍ",
    selectSubject: "መጽሐፍ ይምረጡ",
    chapter: "ምዕራፍ",
    selectChapter: "ምዕራፍ ይምረጡ",
    startFlashcards: "ፍላሽ ካርዶች ጀምር",
    cardProgress: "ካርድ {{current}} ከ {{total}}",
    previous: "የቀድሞ",
    next: "ቀጣይ",
    finish: "ጨርስ",
    loading: "ፍላሽ ካርዶች እየጫኑ ነው...",
    error: "ፍላሽ ካርዶች ለመጫን አልተቻለም። እባክዎ በኋላ ይሞክሩ።",
    noFlashcards: "ለዚህ ክፍል ገና ፍላሽ ካርዶች አልተጨረሱም።",
    grades: {
      "grade-9": "9ኛ ክፍል",
      "grade-10": "10ኛ ክፍል",
      "grade-11": "11ኛ ክፍል",
      "grade-12": "12ኛ ክፍል"
    }
  },
  homework: {
    title: 'የቤት ስራ እርዳታ',
    emptyState: 'የቤት ስራዎ በተመለከተ ማንኛውንም ጥያቄ ጠይቁኝ!',
    inputPlaceholder: 'የቤት ስራዎ ጥያቄ ይጠይቁ...',
    thinking: 'በማሰብ ላይ',
    error: 'ይቅርታ፣ ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።',
    imageButton: 'ምስል ጨምር',
    sendButton: 'መልእክት ላክ',
    removeImage: 'ምስል አውጣ',
    activity: {
      type: 'homework',
      grade: 'grade-12',
      subject: 'አጠቃላይ',
      chapter: 'የቤት ስራ እርዳታ',
      details: 'የቤት ስራ ጥያቄ ጠይቋል',
      status: 'ተጠናቅቋል'
    }
  },
  reports: {
    title: 'ሪፖርቶች',
    overallProgress: {
      title: 'አጠቃላይ እድገት',
      topicsCompleted: 'የተጠናቀቁ ርዕሶች',
      studyHours: 'የትምህርት ሰዓታት'
    },
    performance: {
      title: 'አፈጻጸም',
      averageScore: 'አማካይ ነጥብ',
      quizzesTaken: 'የተወሰዱ ፈተናዎች',
      successRate: 'የስኬት መጠን',
      improvement: 'ማሻሻያ'
    },
    learningStreak: {
      title: 'የትምህርት ተከታታይነት',
      currentStreak: 'የአሁኑ ተከታታይነት',
      bestStreak: 'ምርጥ ተከታታይነት',
      totalDaysActive: 'ጠቅላላ ንቁ ቀናት'
    },
    subjectBreakdown: {
      title: 'የርዕሶች ትንታኔ',
      progress: 'እድገት',
      score: 'ነጥብ'
    },
    recentActivity: {
      title: 'የቅርብ ጊዜ እንቅስቃሴ',
      quiz: 'ፈተና',
      study: 'ትምህርት',
      homework: 'የቤት ስራ',
      completed: 'ተጠናቅቋል',
      duration: '{hours} ሰዓታት'
    },
    howCalculated: {
      title: 'ሪፖርቶች እንዴት ይሰላሉ',
      overallProgress: {
        title: 'አጠቃላይ እድገት',
        description: 'በተጠናቀቁ ርዕሶች እና የትምህርት ሰዓታት ላይ የተመሰረተ'
      },
      performance: {
        title: 'አፈጻጸም',
        description: 'በፈተና ነጥቦች እና የስኬት መጠን ላይ የተመሰረተ'
      },
      studyHours: {
        title: 'የትምህርት ሰዓታት',
        description: 'ከንቁ የትምህርት ክፍለ ጊዜዎች የተመዘገበ'
      }
    },
    activityTypes: {
      quiz: 'ፈተና',
      study: 'ጥናት',
      homework: 'የቤት ስራ'
    },
    status: {
      completed: 'ተጠናቋል'
    },
    duration: '{{hours}} ሰዓት',
    scoreFormat: '{{score}}%',
    progressFormat: '{{progress}}% ተጠናቋል'
  },
  subjects: {
    mathematics: 'ሒሳብ',
    physics: 'ፊዚክስ',
    chemistry: 'ኬሚስትሪ',
    biology: 'ባዮሎጂ',
    history: 'ታሪክ',
    geography: 'ጂኦግራፊ',
    english: 'እንግሊዝኛ',
    amharic: 'አማርኛ',
    civics: 'ሲቪክስ',
    ict: 'አይሲቲ'
  },
  onboarding: {
    language: {
      title: 'ቋንቋዎን ይምረጡ',
      subtitle: 'የሚወዱትን ቋንቋ ይምረጡ',
    },
    welcome: {
      title: 'እንኳን ወደ ቀለም በደህና መጡ',
      subtitle: 'የግል የመማሪያ ጓደኛዎ',
      description: 'በተለየ የመማሪያ ቁሳቁሶች እና በመስተጋብራዊ መልመጃዎች የመማር ጉዞዎን ይጀምሩ።',
    },
    mcq: {
      title: 'በባህሪ መልመጃ ይለማመዱ',
      subtitle: 'እውቀትዎን ይፈትሹ',
      description: 'በጥያቄዎች ይሞክሩ እና እድገትዎን ይከታተሉ።',
    },
    flashcards: {
      title: 'በፍላሽ ካርዶች ይማሩ',
      subtitle: 'ዋና ጽንሰ-ሐሳቦችን ይገምግሙ',
      description: 'በመስተጋብራዊ ፍላሽ ካርዶች ይገምግሙ እና መማራትዎን ያጠናክሩ።',
    },
    homework: {
      title: 'የቤት ስራ እርዳታ ያግኙ',
      subtitle: 'ባለሙያ እርዳታ',
      description: 'ከመምህራን ጋር ይገናኙ እና ለቤት ስራ ጥያቄዎችዎ እርዳታን ያግኙ::',
    },
    skip: 'ይዛወሩ',
    next: 'ቀጥል',
    getStarted: 'ጀምር',
  },
  login: {
    welcome: 'እንኳን በደህና መጡ',
    subtitle: 'አእምሮዎን በእያንዳንዱ ትምህርት ያጠናክሩ',
    username: {
      label: 'መለያ ስም',
      placeholder: 'መለያ ስምዎን ያስገቡ',
      error: {
        required: 'መለያ ስም ያስፈልጋል',
        invalid: 'የሚፈልጉትን መለያ ስም ያስገቡ'
      }
    },
    password: {
      label: 'የይለፍ ቃል',
      placeholder: 'የይለፍ ቃል',
      error: {
        required: 'የይለፍ ቃል ያስፈልጋል'
      }
    },
    error: {
      invalidCredentials: 'የሚፈልጉትን መለያ ስም ያስገቡ',
      serverError: 'ትክክለኛ መለያ አላስገቡም'
    },
    signIn: 'ግባ',
    forgotPassword: 'የይለፍ ቃልዎን ረስተዋል?',
    noAccount: 'መለያ የሎትም?',
    signUp: 'ይመዝገቡ'
  },
  resetPassword: {
    title: 'የይለፍ ቃል ዳግም ያዘጋጁ',
    phoneNumber: 'ስልክ ቁጥር',
    verificationCode: 'የማረጋገጫ ኮድ ያስገቡ',
    newPassword: 'አዲስ የይለፍ ቃል',
    confirmPassword: 'አዲሱን የይለፍ ቃል ያረጋግጡ',
    sendCode: 'የማረጋገጫ ኮድ ይላኩ',
    verifyCode: 'ኮዱን ያረጋግጡ',
    resetPassword: 'የይለፍ ቃል ዳግም ያዘጋጁ',
    phoneSubtitle: 'የማረጋገጫ ኮድ ለማግኘት ስልክ ቁጥርዎን ያስገቡ',
    verifySubtitle: 'ወደ ስልክዎ የተላከውን የማረጋገጫ ኮድ ያስገቡ',
    resetSubtitle: 'አዲስ የይለፍ ቃል ይፍጠሩ',
    backToLogin: 'ወደ መግቢያ ይመለሱ',
  },
  signup: {
    title: 'አካውንት ይፍጠሩ',
    subtitle: 'የእኛን ማህበረሰብ ይቀላቀሉ',
    roleSelection: {
      title: 'እርሶ ማንዎት?',
      subtitle: 'በቀለም እንዴት መጠቀም እንደሚፈልጉ ይምረጡ',
      student: {
        title: 'ተማሪ',
        description: 'መማር እና መለማመድ እፈልጋለሁ',
        features: {
          materials: 'የጥናት ቁሳቁሶችን ይድረሱ',
          practice: 'ጥያቄዎችን ይለማመዱ',
          progress: 'የጥናት እድገት ይከታተሉ'
        }
      },
      parent: {
        title: 'ወላጅ',
        description: 'የልጆቼን መማር መከታተል እፈልጋለሁ',
        features: {
          monitor: 'የጥናት እድገት ይከታተሉ',
          manage: 'ልጆችን ይመራሉ',
          updates: 'የዛሬ ዜና ያግኙ'
        }
      }
    },
    childrenSelection: {
      title: 'ልጆችዎን ይጨምሩ',
      subtitle: 'ስንት ልጆች መመዝገብ ይፈልጋሉ?',
      addChild: 'ልጅ ይጨምሩ',
      child1: 'ልጅ 1',
      child2: 'ልጅ 2',
      child3: 'ልጅ 3',
      child4: 'ልጅ 4',
      child5: 'ልጅ 5',
      child: 'ልጅ',
      continue: 'ቀጥል',
      howManyChildren: 'ስንት ልጆች አሉዎት?',
      enterNumberGreaterThanOne: '1 እና ከ1 በላይ የሆነ ቁጥር ያስገቡ'
    },
    fullName: 'ሙሉ ስም',
    username: 'መለያ ስም',
    phoneNumber: '9 አሃዝ ቁጥር',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
    grade: {
      label: 'ክፍልዎን ይምረጡ',
      title: 'ክፍል ይምረጡ'
    },
    terms: {
      prefix: 'የሚከተሉትን ይቀበላሉ ',
      link: 'የአገልግሎት ውሎች እና ሁኔታዎች',
      title: 'የአገልግሎት ውሎች እና ሁኔታዎች',
      content: `1. የውሎች ተቀባይነት\n\nበቀለም አፕሊኬሽን በመጠቀም እና በመጠቀም እነዚህን የአገልግሎት ውሎች እና ሁኔታዎች መገዛትዎ ይስማማሉ።\n\n2. የተጠቃሚ መመዝገቢያ\n\nተጠቃሚዎች በመመዝገቢያ ጊዜ ትክክለኛ እና ሙሉ መረጃ መስጠት አለባቸው። ተጠቃሚዎች የመለያ ማረጋጊያዎቻቸውን ሚስጥራዊነት መጠበቅ ተጠያቂ ናቸው።\n\n3. የግል የግል መረጃ ፖሊሲ\n\nየአፕሊኬሽኑ አጠቃቀምዎ በግል መረጃዎ እንዴት እንደምንሰበስብ፣ እንደምንጠቀም እና እንደምንጠብቅ የሚገልጽ የግል መረጃ ፖሊሲያችን ይጠብቃል።\n\n4. የተጠቃሚ ባህሪ\n\nተጠቃሚዎች ይስማማሉ:\n- አፕሊኬሽኑን ለህጋዊ ዓላማዎች ብቻ ይጠቀሙ\n- የሌሎች ተጠቃሚዎች ግል መረጃ እና መብቶች ያክብሩ\n- ተስማሚ ያልሆነ ወይም ጎጂ ይዘት አያጋሩ\n- የአፕሊኬሽኑ አገልግሎት አይበጥሱ\n\n5. ይዘት\n\nተጠቃሚዎች የይዘታቸው ባለቤትነት ይይዛሉ ነገር ግን አፕሊኬሽኑ አገልግሎት ለመጠቀም ፍቃድ ይሰጡናል።\n\n6. መቋረጥ\n\nእነዚህን ውሎች የሚያልፉ መለያዎችን መቋረጥ ወይም መቆየት መብታችን እንደሚጠብቅ እንደምንወስን እንገልጻለን።\n\n7. ውሎች ላይ የሚደረጉ ለውጦች\n\nእነዚህን ውሎች በየጊዜው ማዘምን እንችላለን። አፕሊኬሽኑን መጠቀም መቀጠል አዲስ ውሎችን መቀበል ነው።`
    },
    createAccount: 'አካውንት ይፍጠሩ',
    alreadyHaveAccount: 'አካውንት አለዎት?',
    signIn: 'ይግቡ',
    errors: {
      fullNameRequired: 'እባክዎ ሙሉ ስምዎን ያስገቡ',
      phoneRequired: 'እባክዎ የስልክ ቁጥርዎን ያስገቡ',
      passwordRequired: 'እባክዎ የይለፍ ቃል ያስገቡ',
      passwordMismatch: 'የይለፍ ቃላት አይመጣጠኑም',
      acceptTerms: 'እባክዎ ውሎችን እና ሁኔታዎችን ይቀበሉ',
      gradeRequired: 'እባክዎ ክፍልዎን ይምረጡ',
      incompleteChildrenData: 'እባክዎ የልጆች መረጃ ሁሉን ይጨምሩ',
      generic: 'በተመዝገበ ጊዜ ስህተት ተከስቷል',
      network: 'የድረ-ገጽ ስህተት። እባክዎ እንደገና ይሞክሩ።',
      networkConnection: 'ወደ አገልግሎት መገናኘት አልተቻለም። የበይነመረብ ግንኙነትዎን ይፈትሹ።',
      timeout: 'ጥያቄው ጊዜው አብቅቷል። እባክዎ እንደገና ይሞክሩ።',
    },
  },
  payment: {
    title: 'የእርስዎን እቅድ ይምረጡ',
    subtitle: 'የመማሪያ ፍላጎትዎን በተሻለ የሚያሟላ እቅድ ይምረጡ',
    plans: {
      freeTrial: {
        title: 'የነፃ ሙከራ',
        features: {
          questions: '20 ጥያቄዎች',
          flashcards: '20 ፍላሽ ካርዶች',
          homework: '20 የቤት ስራ እርዳታዎች'
        },
        price: 'ብር 0',
        getStarted: 'ጀምር'
      },
      oneMonth: {
        title: 'የ1 ወር እቅድ',
        features: {
          questions: 'ያለገደብ ጥያቄዎች',
          flashcards: 'ያለገደብ ፍላሽ ካርዶች',
          homework: 'ያለገደብ የቤት ስራ እርዳታዎች'
        },
        price: 'ብር 199',
        period: '/1 ወር',
        getStarted: 'ጀምር'
      },
      threeMonth: {
        title: 'የ3 ወር እቅድ',
        features: {
          questions: 'ያለገደብ ጥያቄዎች',
          flashcards: 'ያለገደብ ፍላሽ ካርዶች',
          homework: 'ያለገደብ የቤት ስራ እርዳታዎች'
        },
        price: 'ብር 299',
        period: '/3 ወራት',
        getStarted: 'ጀምር'
      },
      sixMonth: {
        title: 'የ6 ወር እቅድ',
        badge: 'በጣም ተወዳጅ',
        features: {
          questions: 'ያለገደብ ጥያቄዎች',
          flashcards: 'ያለገደብ ፍላሽ ካርዶች',
          homework: 'ያለገደብ የቤት ስራ እርዳታዎች'
        },
        price: 'ብር 499',
        period: '/6 ወራት',
        getStarted: 'ጀምር'
      },
      twelveMonth: {
        title: 'የ12 ወር እቅድ',
        badge: 'በጣም ተስማሚ',
        features: {
          questions: 'ያለገደብ ጥያቄዎች',
          flashcards: 'ያለገደብ ፍላሽ ካርዶች',
          homework: 'ያለገደብ የቤት ስራ እርዳታዎች'
        },
        price: 'ብር 799',
        period: '/12 ወራት',
        getStarted: 'ጀምር'
      }
    }
  }
} 