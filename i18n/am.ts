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
  },
  home: {
    welcome: 'እንኳን በደህና ተመለሱ፣ {name}!',
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
        completed: '{count} ጥያቄዎችን አጠናቅቋል',
        reviewed: '{count} ጥያቄዎችን ገምግሟል'
      },
      flashcards: {
        reviewed: '{count} ፍላሽካርዶችን ገምግሟል'
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
    logout: 'ውጣ',
    role: 'ተማሪ',
    grade: '12ኛ ክፍል',
    school: 'ምሳሌ ሁለተኛ ደረጃ ትምህርት ቤት',
    joinDate: '{date} ተቀላቅለዋል',
    stats: {
      mcqsCompleted: 'የተጠናቀቁ ምርጫዎች',
      flashcardsClicked: 'የታዩ ፍላሽካርዶች',
      homeworkQuestions: 'የቤት ስራ ጥያቄዎች',
      studyHours: 'የጥናት ሰዓታት',
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
} 