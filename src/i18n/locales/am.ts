export default {
  errors: {
    network: {
      title: 'የበይነመረብ ግንኙነት መቋረጥ',
      message: 'ወደ አገልግሎት መገናኘት አልተቻለም። የበይነመረብ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።'
    },
    generic: {
      title: 'ስህተት',
      message: 'የሆነ ነገር ተከስቷል። እባክዎ እንደገና ይሞክሩ።'
    }
  },
  home: {
    welcome: 'እንኳን ደህና መጡ {{name}}!',
    subtitle: 'ዛሬ አዲስ ነገር ለመማር ዝግጁ ኖት?',
    noActivity: 'ምንም የቅርብ እንቅስቃሴ የለም። መማር ይጀምሩ!',
    goto: 'ወደ መግቢያ ይመለሱ',
    quickActions: {
      title: 'ፈጣን እርምጃዎች',
      mcq: {
        title: 'የምርጫ ጥያቄዎች',
        subtitle: 'ዕወቀትዎን ይለኩ!'
      },
      flashcards: {
        title: 'ፍላሽ ካርዶች',
        subtitle: 'ቁልፍ ጽንሰ-ሀሳቦችን ይማሩ!'
      },
      homework: {
        title: 'የቤት ሥራ እገዛ',
        subtitle: 'የቤት ሥራ እገዛ ያግኙ!'
      },
      reports: {
        title: 'የእድገት ሪፖርት',
        subtitle: 'የትምህርትዎን እድገት ይከታተሉ'
      },
      nationalExams: {
        title: 'የብሔራዊ ፈተናዎች',
        subtitle: 'በቀድሞ ፈተናዎች ይለማመዱ',
        yearExam: 'የ{{year}} ብሔራዊ ፈተና',
        grade: 'የ{{grade}} ክፍል'
      }
    },
    reportCards: {
      performance: {
        title: "አፈፃፀም",
        subtitle: "የእርስዎ የትምህርት እድገት",
        stats: {
          quizzesTaken: "የተወሰዱ ፈተናዎች",
          successRate: "የስኬት መጠን"
        }
      },
      studyProgress: {
        title: "የትምህርት እድገት",
        subtitle: "የተወሰደ ጊዜ",
        stats: {
          dailyGoal: "የዕለት ግብ",
          weeklyGoal: "የሳምንት ግብ"
        }
      },
      streak: {
        title: "የትምህርት ተከታታይነት",
        subtitle: "የተከታተለ ቀናት",
        stats: {
          currentStreak: "የአሁኑ ተከታታይነት",
          bestStreak: "ምርጥ ተከታታይነት"
        }
      },
      learningStreak: {
        title: "የትምህርት ተከታታይነት",
        subtitle: "የተከታተለ ቀናት",
        stats: {
          currentStreak: "የአሁኑ ተከታታይነት",
          bestStreak: "ምርጥ ተከታታይነት"
        }
      },
      studyFocus: {
        title: "የትምህርት ያተኩራል",
        subtitle: "የመማሪያ ንድፍዎ",
        stats: {
          topSubject: "የተሻለ መጽሐፍ",
          hoursPerSubject: "በመጽሐፍ ሰዓታት"
        }
      }
    },
    recentActivity: {
      title: "የቅርብ እንቅስቃሴ",
      noActivities: "ምንም የቅርብ እንቅስቃሴዎች የሉም",
      completed: "ተጠናቅቋል",
      inProgress: "በሂደት ላይ"
    },
    activityTypes: {
      mcq: 'ምርጫ ፈተና',
      flashcard: 'ፍላሽ ካርዶች',
      homework: 'የቤት ስራ',
      study: 'የትምህርት ክፍለ ጊዜ'
    },
    seeAll: 'ሁሉንም ይመልከቱ',
    activityDetails: {
      completed: 'ተጠናቅቋል',
      inProgress: 'በሂደት ላይ',
      grade: 'ደረጃ',
      subject: 'የትምህርት ዓይነት',
      chapter: 'ምዕራፍ',
      duration: '{hours}ሰ',
      questions: {
        completed: '5 ጥያቄዎች ተጠናቅቋል',
        reviewed: '3 ጥያቄዎች ተገመግመዋል'
      },
      flashcards: {
        reviewed: '10 ፍላሽ ካርዶች ተገመግመዋል'
      },
      homework: {
        submitted: 'የቤት ሥራ ቀርቧል',
        working: 'በየቤት ሥራ ላይ እየሰራ'
      },
      study: {
        session: 'የትምህርት ክፍለ ጊዜ - {duration}'
      }
    },
    motivationalQuotes: [
      {
        quote: "ታላቅ ሥራ ለማድረግ ብቸኛው መንገድ የሚወዱትን ማድረግ ነው።",
        author: "ስቲቭ ጆብስ"
      },
      {
        quote: "ትምህርት ለህይወት ዝግጅት አይደለም፤ ትምህርት ራሱ ህይወት ነው።",
        author: "ጆን ዱይ"
      },
      {
        quote: "ስለ ትምህርት ያለው ውብ ነገር ማንም ሰው ከእርስዎ ሊወስደው አይችልም።",
        author: "ቢ.ቢ. ኪንግ"
      }
    ]
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
    timer: {
      text: 'የኮዱ ደቂቃ የሚያልቅበት'
    },
    resend: {
      text: 'ኮዱን አላገኙም?',
      button: 'ዳግም ላክ'
    },
    send: {
      text: 'ኮዱን አላገኙም?',
      button: 'ኮድ ላክ'
    }
  },
  login: {
    welcome: 'እንኳን በደህና መጡ',
    subtitle: 'አእምሮዎን በእያንዳንዱ ትምህርት ያበልጽጉ!',
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
    signIn: 'ይግቡ',
    forgotPassword: 'የይለፍ ቃልዎን ረስተዋል?',
    noAccount: 'መለያ የሎትም?',
    signUp: 'ይመዝገቡ'
  },
  signup: {
    title: 'አካውንት ይፍጠሩ',
    subtitle: 'ቀለምን ይቀላቀሉ',
    roleSelection: {
      title: 'ይመዝገቡ',
      subtitle: 'በቀለም እንዴት መጠቀም እንደሚፈልጉ ይምረጡ',
      student: {
        title: 'ተማሪ',
        description: 'መማር እና መለማመድ እፈልጋለሁ',
        features: {
          materials: 'የጥናት አጋዦችን ያግኙ!',
          practice: 'ጥያቄዎችን ይለማመዱ',
          progress: 'የጥናት እድገትዎን ይከታተሉ'
        }
      },
      parent: {
        title: 'ወላጅ',
        description: 'የልጆቼን መማር መከታተል እፈልጋለሁ',
        features: {
          monitor: 'የጥናት እድገታቸውን ይከታተሉ',
          manage: 'ልጆችዎን ይከታተሉ',
          updates: 'አዳዲስ መረጃዎችን ይከታተሉ'
        }
      }
    },
    childrenSelection: {
      title: 'ልጆችዎን ያስመዝግቡ',
      subtitle: 'ስንት ልጆች መመዝገብ ይፈልጋሉ?',
      addChild: 'ልጅ ያስመዝግቡ',
      child1: 'ልጅ 1',
      child2: 'ልጅ 2',
      child3: 'ልጅ 3',
      child4: 'ልጅ 4',
      child5: 'ልጅ 5',
      child: 'ልጅ',
      continue: 'ይቀጥሉ',
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
    region: {
      label: 'ክልልዎን ይምረጡ',
      title: 'ክልል ይምረጡ'
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
      fullNameMinLength: 'ሙሉ ስም ቢያንስ 2 ፊደል መሆን አለበት',
      fullNameInvalid: 'ሙሉ ስም የማይፈቀዱ ፊደሎች ይዟል',
      phoneRequired: 'እባክዎ የስልክ ቁጥርዎን ያስገቡ',
      phoneInvalid: 'እባክዎ ትክክለኛ 9-አሃዝ የስልክ ቁጥር ያስገቡ',
      phoneInvalidPrefix: 'የስልክ ቁጥር በ9 ወይም በ7 ነው መጀመር ያለበት',
      passwordRequired: 'እባክዎ የይለፍ ቃል ያስገቡ',
      passwordMinLength: 'የይለፍ ቃል ቢያንስ 6 ቁምፊ መሆን አለበት',
      passwordMaxLength: 'የይለፍ ቃል 50 ብዛት ያነሰ መሆን አለበት',
      passwordMismatch: 'የይለፍ ቃላቶቹ አንዳይነት አይደሉም',
      confirmPasswordRequired: 'እባክዎ የይለፍ ቃልዎን ያረጋግጡ',
      usernameRequired: 'እባክዎ የተጠቃሚ ስም ያስገቡ',
      usernameMinLength: 'የተጠቃሚ ስም ቢያንስ 5 ብዛት መሆን አለበት',
      usernameMaxLength: 'የተጠቃሚ ስም 20 ብዛት ያነሰ መሆን አለበት',
      usernameInvalid: 'የተጠቃሚ ስም ፊደላት፣ ቁጥሮች፣ የታች መስመር፣ እና ሰረዝ ብቻ ሊይዝ ይችላል',
      usernameTaken: 'የተጠቃሚ ስም አስቀድሞ ተይዟል',
      acceptTerms: 'እባክዎ ውሎችን እና ሁኔታዎችን ይቀበሉ',
      gradeRequired: 'እባክዎ ክፍልዎን ይምረጡ',
      regionRequired: 'እባክዎ ክልልዎን ይምረጡ',
      incompleteChildrenData: 'እባክዎ የልጆች መረጃ ሁሉን ይጨምሩ',
      generic: 'በተመዝገበ ጊዜ ስህተት ተከስቷል',
      validationFailed: 'እባክዎ ከመቀጠል በፊት ከዚህ በታች ያሉትን ስህተቶች ያስተካክሉ',
      navigationFailed: 'መሄድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
      network: 'የድረ-ገጽ ስህተት። እባክዎ እንደገና ይሞክሩ።',
      networkConnection: 'ወደ አገልግሎት መገናኘት አልተቻለም። የበይነመረብ ግንኙነትዎን ይፈትሹ።',
      timeout: 'ጥያቄው ጊዜው አብቅቷል። እባክዎ እንደገና ይሞክሩ።',
    },
  },
  kg: {
    welcome: 'እንኳን ደህና መጡ {{name}}!',
    subtitle: 'ዛሬ አዲስ ነገር ለመማር ዝግጁ ኖት?',
    howToPlay: 'አጠቃቀም',
    letsHaveFun: 'እየተደሰትን እንማር!',
    categories: {
      // Fallback categories
      'Animals': 'እንስሳት',
      'Colors': 'ቀለሞች',
      'Numbers': 'ቁጥሮች',
      'Shapes': 'ምስሎች',
      'Fruits': 'ፍራፍሬዎች',
      'Vegetables': 'አትክልቶች',
      'Family': 'ቤተሰብ',
      'Body Parts': 'የሰውነት ክፍሎች',
      'Clothes': 'ልብሶች',
      'Weather': 'አየር ሁኔታ',
      'Transport': 'መጓጓዣ',
      'Food': 'ምግብ',
      'School': 'ትምህርት ቤት',
      'Toys': 'መጫወቻዎች',
      // API categories
      'Maths': 'ሂሳብ',
      'Domestic Animals': 'የቤት እንስሳት',
      'Wild Animals': 'የዱር እንስሳት',
      'Household Items': 'የቤት እቃዎች',
      'Fruits and Vegetables': 'ፍራፍሬዎች እና አትክልቶች',
      'School Compound': 'የትምህርት ቤት ግቢ',
      'Different Activities': 'የተለያዩ እንቅስቃሴዎች',
      'Foods': 'ምግቦች',
      // UI text
      title: 'የመማሪያ ጉዞዎን ይምረጡ!',
      subtitle: 'ርዕስ ይምረጡ እና የእርስዎን አስደናቂ ጉዞ ይጀምሩ!'
    },
    instructions: {
      subtitle: 'አዲስ ነገር ለመማር ዝግጁ ኖት?',
      look: {
        title: 'በጥንቃቄ ተመልከት',
        description: 'ለምስሎቹ ጊዜ ይውሰዱ እና ምን እንደሚያሳዩ ይረዱ።'
      },
      choose: {
        title: 'በጥንቃቄ ይምረጡ',
        description: 'ከተሰጡት አማራጮች ትክክለኛውን መልስ ይምረጡ።'
      },
      haveFun: {
        title: 'ይደሰቱ!',
        description: 'መማር አስደሳች ነው! ሂደቱን ይደሰቱ እና እድገትዎን ይመልከቱ'
      },
      start: 'መማር ይጀምሩ'
    },
    subcategories: {
      welcome: 'እንኳን ደህና መጡ ወደ {{category}}!',
      subtitle: 'መማር ለመጀመር ርዕስ ይምረጡ',
      title: 'የመማሪያ ጉዞዎን ይምረጡ!',
      '1-10 Numbers': '1-10 ቁጥሮች',
      '11-20 Numbers': '11-20 ቁጥሮች',
      '1-10 Counting': '1-10 መቁጠሪያ',
      '11-20 Counting': '11-20 መቁጠሪያ',
      'Fill in the Blanks': 'ባዶ ቦታዎችን ሙላ',
      'Middle Number 1-10': 'መካከለኛ ቁጥር 1-10',
      'Middle Number 11-20': 'መካከለኛ ቁጥር 11-20'
    }
  },
  reports: {
    title: 'ሪፖርቶች',
    loading: 'የእድገትዎን በማዘዋወር ላይ...',
    progressStats: {
      title: 'የእርስዎ እድገት'
    },
    overallProgress: {
      title: 'ጠቅላላ እድገት',
      topicsCompleted: 'የተጠናቀቁ ርዕሰ ጉዳዮች',
      studyHours: 'የትምህርት ሰዓታት'
    },
    performance: {
      title: 'አፈፃፀም',
      subtitle: 'የትምህርት እድገትዎን ይመልከቱ',
      stats: {
        quizzesTaken: 'የተወሰዱ ፈተናዎች',
        successRate: 'የስኬት መጠን',
        averageScore: 'አማካይ ነጥብ',
        timeSpent: 'የተወሰደ ጊዜ'
      }
    },
    learningStreak: {
      title: 'የትምህርት ተከታታይነት',
      currentStreak: 'የአሁኑ ተከታታይነት',
      bestStreak: 'ምርጥ ተከታታይነት',
      totalDaysActive: 'ጠቅላላ ንቁ ቀናት'
    },
    subjectBreakdown: {
      title: 'የመጽሀፍ ትንታኔ',
      progress: 'እድገት',
      score: 'ነጥብ'
    },
    recentActivity: {
      title: 'የቅርብ እንቅስቃሴ',
      quiz: 'ፈተና',
      study: 'ትምህርት',
      homework: 'የቤት ስራ',
      completed: 'ተጠናቅቋል',
      duration: '{hours} ሰዓታት'
    },
    howCalculated: {
      title: 'ሪፖርቶች እንዴት እንደሚሰሉ',
      overallProgress: {
        title: 'ጠቅላላ እድገት',
        description: 'በተጠናቀቁ ርዕሰ ጉዳዮች እና የትምህርት ሰዓታት ላይ የተመሰረተ'
      },
      performance: {
        title: 'አፈፃፀም',
        description: 'በፈተና ነጥቦች እና የስኬት መጠን ላይ የተመሰረተ'
      },
      studyHours: {
        title: 'የትምህርት ሰዓታት',
        description: 'ከንቁ የትምህርት ክፍለ ጊዜዎች የተመዘገበ'
      }
    },
    activityTypes: {
      quiz: 'ፈተና',
      study: 'ትምህርት',
      homework: 'የቤት ስራ',
      flashcard: 'ፍላሽ ካርዶች',
      mcq: 'ምርጫ ፈተና',
      kg_question: 'ኪጂ ጥያቄ',
      picture_mcq: 'የምስል ፈተና'
    },
    status: {
      completed: 'ተጠናቅቋል'
    },
    duration: '{{hours}}ሰ',
    scoreFormat: '{{score}}%',
    progressFormat: '{{progress}}% ተጠናቅቋል',
    noData: 'የእድገትዎን ለማየት መማር ይጀምሩ!',
    comingSoon: 'ተጨማሪ ሪፖርቶች በመሰራት ላይ!',
    comingSoonDescription: 'ለእርስዎ የትምህርት ጉዞ ተጨማሪ ትንታኔዎችን እና ሪፖርቶችን በቅርቡ ይጠብቁ።'
  },
  common: {
    error: 'ችግር',
    tryAgain: 'እንደገና ይሞክሩ',
    back: 'ተመለስ',
    loading: 'በማዘዋወር ላይ...',
    processing: 'በማዘዋወር ላይ...',
    retry: 'እንደገና ይሞክሩ',
    imageLoadError: 'ምስሉ ለመጫን አልተቻለም',
    grade: 'ክፍል',
  },
  mcq: {
    question: 'ጥያቄ',
    title: 'ምርጫ',
    selectSubject: 'የትምህርት ዓይነት ይምረጡ',
    subject: 'የትምህርት ዓይነት',
    chapter: 'ምዕራፍ',
    selectChapter: 'ምዕራፍ ይምረጡ',
    selectSubjectAndChapter: 'የትምህርት ዓይነት እና ምዕራፍ ይምረጡ',
    selectSubjectPlaceholder: 'የትምህርት ዓይነት ይምረጡ',
    selectChapterPlaceholder: 'ምዕራፍ ይምረጡ',
    selectExamType: 'የፈተና ዓይነት ይምረጡ',
    nationalExam: 'የብሄራዊ ፈተና ጥያቄዎች',
    mcqExam: 'የምርጫ ፈተና ጥያቄዎች',
    nationalExamDescription: 'የቀድሞ ብሔራዊ ፈተናዎች እውነተኛ ጥያቄዎችን ለማስተላለፍ ይረዳዎታል። ለፈተና አዘጋጅት እና ለራስ ግምገማ ተገቢ ነው።',
    mcqExamDescription: 'ለእያንዳንዱ ምዕራፍ በርካታ የተመረጡ ብዙ ጥያቄዎችን ይሞክሩ። ለዕለታዊ ልምምድ እና ለድጋሚ እይታ ተገቢ ነው።',
    startQuiz: 'ፈተና ይጀምሩ',
    previous: 'ቀዳሚ',
    next: 'ቀጣይ',
    finish: 'ያጠናቅቁ',
    correct: 'ትክክል!',
    incorrect: 'ስህተት!',
    explanation: 'ማብራሪያ',
    of: 'ከ',
    pictureQuiz: {
      title: 'የምስል ፈተና',
      subtitle: 'በምስሎች ዕወቀትዎን ይለኩ!',
      startQuiz: 'ፈተና ይጀምሩ',
      goToRegularQuestions: 'ወደ ዋናው ማውጫ ይሂዱ',
      goToInstructions: 'ወደ መመሪያዎች ይሂዱ',
      unauthorizedText: 'ይህን ባህሪ ለመጠቀም ፈቃድ ያስፈልግዎታል።',
      noQuestionsAvailable: 'ለዚህ ክፍል ጥያቄዎች አልተዘጋጁም።',
      instructions: {
        look: {
          title: 'ምስሉን ተመልከት',
          description: 'በጥንቃቄ የቀረበውን ምስል ይመልከቱ።'
        },
        drag: {
          title: 'ጎትት እና አስቀምጥ',
          description: 'ምስሉን ወደ ትክክለኛው መልስ አማራጭ ይጎትቱ።'
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
      score: 'ነጥብ: {{score}}/{{total}}',
      percentage: '{{percentage}}%',
      message: {
        outstanding: 'በጣም ጥሩ! እርስዎ ኮከብ ነዎት!',
        great: 'በጣም ጥሩ! ይቀጥሉ!',
        good: 'ጥሩ ጥረት! የበለጠ ማድረግ ይችላሉ!',
        keepLearning: 'ይለማመዱ! ይሻሻሉ!',
        genius: 'በጣም ጥሩ! እርስዎ ጎበዝ ነዎት!',
        doingWell: 'በጣም ጥሩ! በጣም ደስ ይላል!',
        notBad: 'ጥሩ አይደለም! ይለማመዱ!',
        canDoBetter: 'ይማሩ! የበለጠ ማድረግ ይችላሉ!'
      },
      tryAgain: 'ሌሎች ቀሪ ጥያቄዎችን ይሞክሩ',
      chooseAnotherSubject: 'ሌላ የትምህርት ዓይነት ይምረጡ',
      tryOtherNationalExam: 'ሌሎች ቀሪ የብሄራዊ ፈተናዎችን ይሞክሩ',
      chooseAnotherNationalExamYear: 'ሌላ የብሄራዊ ፈተና ዓመት ይምረጡ'
    },
    selectAnswer: 'እባክዎ ከመቀጠልዎ በፊት መልስ ይምረጡ',
    noSubjectsFound: {
      title: 'ለክፍልዎ የትምህርት ዓይነቶች አልተገኙም',
      description: 'ለ{{gradeName}} ክፍል የትምህርት አይነቶች ማግኘት አልቻልንም። ይህ ሊሆን የቻለው:',
      reasons: {
        accountUpdate: 'መለያዎ በትክክለኛው ክፍል ሊስተካከል ይፈልጋል',
        serverUnavailable: 'አገልግሎቱ በጊዜያዊ ሁኔታ አይገኝም',
        contentBeingAdded: 'ለክፍልዎ ይዘት አሁንም በመጨመር ላይ ነው'
      }
    }
  },
  flashcards: {
    title: "ፍላሽ ካርዶች",
    selectSubjectAndChapter: "የትምህርት ዓይነት እና ምዕራፍ ይምረጡ",
    subject: "የትምህርት ዓይነት",
    selectSubject: "የትምህርት ዓይነት ይምረጡ",
    chapter: "ምዕራፍ",
    selectChapter: "ምዕራፍ ይምረጡ",
    startFlashcards: "ይጀምሩ",
    cardProgress: "ካርድ {{current}} ከ {{total}}",
    previous: "ቀዳሚ",
    next: "ቀጣይ",
    finish: "ያጠናቅቁ",
    loading: "ፍላሽ ካርዶች በመጫን ላይ...",
    error: "ፍላሽ ካርዶች ለመጫን አልተቻለም። እባክዎ የኢንተርኔት ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።",
    noFlashcards: "ለዚህ ክፍል ፍላሽ ካርዶች አልተዘጋጁም።",
    clickToReveal: "መልሱን ለመመልከት ጥያቄውን ክሊክ ያድርጉ!",
    tapToSeeAnswer: "መልሱን ለመመልከት ይንኩ።",
    tapToSeeQuestion: "ጥያቄውን ለመመልከት ካርዱን ይንኩ።",
    grades: {
      "grade-9": "9ኛ ክፍል",
      "grade-10": "10ኛ ክፍል",
      "grade-11": "11ኛ ክፍል",
      "grade-12": "12ኛ ክፍል"
    }
  },
  homework: {
    title: 'የቤት ስራ',
    emptyState: 'ስለ የቤት ስራዎ ማንኛውንም ነገር ጠይቁኝ!',
    inputPlaceholder: 'የቤት ሥራ ጥያቄዎን ያስገቡ...',
    thinking: 'በማሰብ ላይ',
    error: 'ይቅርታ፣ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
    imageButton: 'ምስል ያክሉ',
    sendButton: 'መልእክት ይላኩ',
    removeImage: 'ምስል ያስወግዱ',
    activity: {
      type: 'የቤት ስራ',
      grade: '12ኛ ክፍል',
      subject: 'አጠቃላይ',
      chapter: 'የቤት ሥራ እገዛ',
      details: 'የቤት ሥራ ጥያቄ ተጠይቋል',
      status: 'ተጠናቅቋል'
    }
  },
  navigation: {
    tabs: {
      home: 'ዋና ገጽ',
      mcq: 'ምርጫ',
      flashcards: 'ፍላሽ ካርዶች',
      homework: 'የቤት ስራ',
      profile: 'መገለጫ',
      reports: 'ሪፖርቶች'
    }
  },
  profile: {
    stats: {
      mcqsCompleted: 'የተጠናቀቁ ምርጫዎች',
      flashcardsClicked: 'የተጫኑ ፍላሽ ካርዶች',
      homeworkQuestions: 'የቤት ሥራ ጥያቄዎች',
      studyHours: 'የትምህርት ሰዓታት',
      pictureQuestions: 'የምስል ጥያቄዎች',
      cardGroups: 'የካርድ ቡድኖች'
    },
    myProfile: 'የእኔ መገለጫ',
    editProfile: 'መገለጫ ያርትዑ',
    myQuestions: 'የእኔ ጥያቄዎች',
    myAnswers: 'የእኔ መልሶች',
    settings: 'ቅንብሮች',
    accountSettings: 'የመለያ ቅንብሮች',
    notifications: 'ማሳወቂያዎች',
    language: 'ቋንቋ',
    theme: 'ገጽታ',
    resetApp: 'መተግበሪያውን ዳግም ያስጀምሩ',
    resetConfirmation: 'መተግበሪያውን ዳግም ለመጀመር እርግጠኛ ነዎት? ይህ ወደ የመጀመሪያ ገጽ ይመልሶዎታል።',
    logout: 'ይውጡ',
    role: 'ተማሪ',
    grade: '12ኛ ክፍል',
    school: 'ምሳሌ ሁለተኛ ደረጃ ትምህርት ቤት',
    joinDate: 'ተቀላቅለዋል {date}',
    joinDateValue: 'ጥር 2024',
    englishName: 'ዮሴፍ አሸናፊ',
    email: 'yosefashenafi7@gmail.com',
    accountSettingsLabels: {
      fullName: 'ሙሉ ስም',
      username: 'መለያ ስም',
      role: 'ሚና',
      grade: 'ክፍል',
      joined: 'የተቀላቀሉት',
      paymentPlan: 'የክፍያ እቅድ'
    },
    save: 'አስቀምጥ',
    edit: 'አርትዑ',
    title: 'ቅንብሮች',
    about: 'ስለ ቀለም',
    aboutInfo: 'ቀለም በመስተጣበቅ የተማሪዎችን ትምህርት ለማሻሻል የተቀየረ የትምህርት መድረክ ነው። በመስተጣበቅ የተሞላ ይዘት፣ የተገላገለ ልምዶች እና የተሟላ የሂደት መከታተያ በኩል ትምህርትን ለማሻሻል የተቀየረ ነው።',
    version: 'የመተግበሪያ ሥሪት'
  },
  auth: {
    errors: {
      paymentFailed: 'ክፍያው አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    },
    signIn: 'ይግቡ',
    signUp: 'ይመዝገቡ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    forgotPassword: 'የይለፍ ቃልዎን ረሱ?',
    createAccount: 'መለያ ይፍጠሩ',
    alreadyHaveAccount: 'አስቀድመው መለያ አለዎት?',
    otp: {
      title: 'ስልክዎን ያረጋግጡ',
      subtitle: 'ወደ ስልክዎ የተላከውን 6-አሃዝ ኮድ ያስገቡ',
      error: {
        invalid: 'ልክ ያልሆነ የማረጋገጫ ኮድ',
        incomplete: 'እባክዎ ሁሉንም አሃዞች ያስገቡ',
        invalidData: 'ልክ ያልሆነ የተጠቃሚ ውሂብ። እባክዎ እንደገና ይሞክሩ።',
        verificationFailed: 'OTP ማረጋገጥ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
      },
      send: {
        text: 'ስልክዎን ለማረጋገጥ ዝግጁ ነዎት?',
        button: 'OTP ላክ'
      },
      resend: {
        text: 'ኮዱን አላገኙም?',
        button: 'ዳግም ላክ'
      },
      timer: {
        text: 'የቀረ ጊዜ:'
      },
      verify: 'ያረጋግጡ'
    },
    planSelection: {
      title: 'የእርስዎን እቅድ ይምረጡ',
      subtitleSingle: 'የሚፈልጉትን እቅድ ይምረጡ',
      subtitleMultiple: 'ለሁሉም ልጆች እቅድ ይምረጡ',
      total: 'ጠቅላላ',
      continue: 'ይቀጥሉ',
      finish: 'ያጠናቁ',
      pay: 'ይክፈሉ',
      free: 'ነጻ',
      recommended: 'የሚመከር',
      months: 'ወራት',
      calculation: '{{planPrice}} ብር × {{numberOfChildren}} ልጆች = {{total}} ብር',
      pricePerChild: 'በአንድ ልጅ ዋጋ: {{price}} ብር',
      descriptions: {
        free: 'ነጻ እቅድ ከመሰረታዊ ባህሪያት ጋር የተገደበ መዳረሻ',
        oneMonth: '1 ወር የሙሉ መዳረሻ ወደ ሁሉም የትምህርት ቁሳቁሶች',
        threeMonths: '3 ወራት የሙሉ መዳረሻ ወደ ሁሉም የትምህርት ቁሳቁሶች',
        sixMonths: '6 ወራት የሙሉ መዳረሻ ወደ ሁሉም የትምህርት ቁሳቁሶች',
        twelveMonths: '12 ወራት የሙሉ መዳረሻ ከፕሪሚየም ባህሪያት ጋር',
        fullAccess: 'የሙሉ መዳረሻ ወደ ሁሉም የትምህርት ቁሳቁሶች'
      },
      success: {
        title: 'ምዝገባ ተሳክቷል!',
        message: 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል። የትምህርት ጉዞዎን ለመቀጠል እባክዎ ይግቡ።',
        parentMessage: 'የቤተሰብ መለያዎ በተሳካ ሁኔታ ተፈጥሯል። አሁን እርስዎ እና ልጆችዎ የይለፍ ቃልዎን በመጠቀም መግባት ይችላሉ።',
        button: 'ወደ መግቢያ ይሂዱ'
      },
      error: {
        title: 'ምዝገባ አልተሳካም',
        message: 'ምዝገባዎን ማጠናቀቅ አልቻልንም። እባክዎ እንደገና ይሞክሩ።',
        parentMessage: 'የቤተሰብ ምዝገባዎን ማጠናቀቅ አልቻልንም። እባክዎ እንደገና ይሞክሩ።',
        childrenMessage: 'የአንዳንድ ልጆች መለያዎች መፍጠር አልቻልንም። እባክዎ እንደገና ይሞክሩ።',
        network: 'ከሰርቨሩ ጋር መገናኘት አልቻልንም። እባክዎ የኢንተርኔት ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።',
        button: 'እንደገና ይሞክሩ'
      },
      plans: {
        '0': {
          name: 'ነጻ',
          features: [
            'ወደ መማሪያ ቁሳቁሶች መሰረታዊ መዳረሻ',
            'የተወሰኑ የልምምድ ጥያቄዎች',
            'መሰረታዊ የእድገት ትንታኔ',
            'የማህበረሰብ ድጋፍ'
          ]
        },
        '1': {
          name: '1 ወር',
          features: [
            'ወደ ሁሉም መማሪያ ቁሳቁሶች መዳረሻ',
            'የልምምድ ጥያቄዎች',
            'የእድገት ትንታኔ',
            'መሰረታዊ ድጋፍ'
          ]
        },
        '3': {
          name: '3 ወራት',
          features: [
            'ወደ ሁሉም መማሪያ ቁሳቁሶች መዳረሻ',
            'የልምምድ ጥያቄዎች',
            'የእድገት ትንታኔ',
            'መሰረታዊ ድጋፍ'
          ]
        },
        '6': {
          name: '6 ወራት',
          features: [
            'ወደ ሁሉም መማሪያ ቁሳቁሶች መዳረሻ',
            'የልምምድ ጥያቄዎች',
            'የእድገት ትንታኔ',
            'መሰረታዊ ድጋፍ'
          ]
        },
        '12': {
          name: '12 ወራት',
          features: [
            'በ6 ወራት እቅድ ውስጥ ያለው ሁሉ',
            'ቅድሚያ ድጋፍ',
            'የላቀ ትንታኔ',
            'ልዩ ይዘት'
          ]
        }
      }
    }
  },
  welcome: {
    title: 'እንኳን ወደ ቀለም በደህና መጡ!',
    subtitle: 'አዲስ ከሆኑ እባክዎ ይመዝገቡ። አስቀድመው መለያ ካለዎት እባክዎ በመለያዎ ይግቡ።',
    signIn: 'ይግቡ',
    signUp: 'ይመዝገቡ',
  },
  onboarding: {
    language: {
      title: 'ቋንቋዎን ይምረጡ',
      subtitle: 'የሚፈልጉትን ቋንቋ ይምረጡ'
    },
    welcome: {
      title: 'እንኳን ወደ ቀለም በደህና መጡ!',
      subtitle: 'የግልዎ መማሪያ',
      description: 'በተዋቀሩ የትምህርት እና የጥናት አጋዦች እንዲሁም በምቹ የመልመጃ ጥያቄዎች የዕውቀት ጉዞዎን ያበልጽጉ! '
    },
    mcq: {
      title: 'የምርጫ ጥያቄዎችን ይመለሱ!',
      subtitle: 'ዕወቀትዎን ይለኩ!',
      description: 'ጥያቄዎችን እየመለሱ የዕውቀት እድገትዎን ይከታተሉ! '
    },
    flashcards: {
      title: 'በፍላሽ ካርዶች ይማሩ',
      subtitle: 'ቁልፍ ጽንሰ-ሀሳቦችን ይማሩ!',
      description: 'ዕውቀትን ለማበልጸግ ፍላሽ ካርዶችን ይመልከቱ!'
    },
    homework: {
      title: 'ለቤት ሥራ አጋዥ ይጠቀሙ!',
      subtitle: 'የቤት ሥራ እገዛ! ',
      description: 'የቤት ሥራ ጥያቄዎችን ለመመለስ የሚያግዝ የግል መማሪያ! '
    },
    skip: 'ይዝለሉ',
    next: 'ቀጣይ',
    getStarted: 'ይጀምሩ'
  },
  subjects: {
    mathematics: {
      title: 'ሒሳብ',
      description: 'ቁጥሮችን፣ ቀመሮችን እና የሂሳብ ጽንሰ-ሐሳቦችን ይማሩ',
      topics: {
        algebra: {
          title: 'አልጀብራ',
          description: 'ተለዋዋጮችን፣ እኩልታዎችን እና እኩልነትን ይማሩ',
          subtopics: {
            linearEquations: 'መስመራዊ እኩልታዎች',
            quadraticEquations: 'ኳድራቲክ እኩልታዎች',
            polynomials: 'ፖሊኖሚያሎች',
            inequalities: 'እኩልነቶች'
          }
        },
        geometry: {
          title: 'ጂኦሜትሪ',
          description: 'ስዕሎችን፣ ማዕዘኖችን እና ቦታዎችን ይማሩ',
          subtopics: {
            triangles: 'ሶስት ማዕዘኖች',
            circles: 'ክበቦች',
            polygons: 'ብዙ ጎኖች',
            coordinateGeometry: 'ኮርዲኔት ጂኦሜትሪ'
          }
        },
        calculus: {
          title: 'ካልኩለስ',
          description: 'ለውጦችን እና አካባቢዎችን ይማሩ',
          subtopics: {
            limits: 'ገደቦች',
            derivatives: 'የውጤት ተግባራት',
            integrals: 'ውህደቶች',
            differentialEquations: 'የውጤት እኩልታዎች'
          }
        },
        statistics: {
          title: 'ስታቲስቲክስ',
          description: 'ውሂብን እና እድልን ይማሩ',
          subtopics: {
            probability: 'እድል',
            dataAnalysis: 'የውሂብ ትንታኔ',
            distributions: 'ስርጭቶች',
            hypothesisTesting: 'ሃይፖቴሲስ ፈተና'
          }
        },
        trigonometry: {
          title: 'ትሪጎኖሜትሪ',
          description: 'ሳይኖችን፣ ኮሳይኖችን እና ታንጀንቶችን ይማሩ',
          subtopics: {
            angles: 'ማዕዘኖች',
            identities: 'ማንነቶች',
            graphs: 'ግራፎች',
            applications: 'ተግባራዊ አተገባበሮች'
          }
        }
      },
      difficultyLevels: {
        basic: 'መሰረታዊ',
        intermediate: 'መካከለኛ',
        advanced: 'ላቀ'
      },
      practiceTypes: {
        exercises: 'ልምምዶች',
        problems: 'ችግሮች',
        quizzes: 'ፈተናዎች',
        tests: 'ፈተናዎች'
      },
      resources: {
        formulas: 'ቀመሮች',
        examples: 'ምሳሌዎች',
        tutorials: 'ትምህርቶች',
        worksheets: 'የሥራ ወረቀቶች'
      }
    },
    physics: {
      title: 'ፊዚክስ',
      description: 'ቁስን፣ ኃይልን እና የእነሱን ተጽእኖዎች ይማሩ',
      topics: {
        mechanics: {
          title: 'ሜካኒክስ',
          description: 'እንቅስቃሴን እና ኃይሎችን ይማሩ',
          subtopics: {
            kinematics: 'ኪኔማቲክስ',
            dynamics: 'ዲናሚክስ',
            energy: 'ኃይል እና ስራ',
            momentum: 'ሞመንተም'
          }
        },
        waves: {
          title: 'ሞገዶች',
          description: 'የሞገድ ክስተቶችን እና ባህሪያትን ይማሩ',
          subtopics: {
            soundWaves: 'የድምጽ ሞገዶች',
            lightWaves: 'የብርሃን ሞገዶች',
            interference: 'ጣልቃ ገብነት',
            diffraction: 'ዲፍራክሽን'
          }
        },
        electricity: {
          title: 'ኤሌክትሪክ',
          description: 'የኤሌክትሪክ ክስተቶችን ይማሩ',
          subtopics: {
            charge: 'የኤሌክትሪክ ጭነት',
            current: 'የኤሌክትሪክ ዝርያ',
            circuits: 'የኤሌክትሪክ ሰርኪቶች',
            magnetism: 'ማግኔቲዝም'
          }
        },
        thermodynamics: {
          title: 'ቴርሞዳይናሚክስ',
          description: 'ሙቀትን እና ሙቀት መጠንን ይማሩ',
          subtopics: {
            temperature: 'የሙቀት መጠን',
            heat: 'የሙቀት ሽግግር',
            laws: 'የቴርሞዳይናሚክስ ህጎች',
            entropy: 'ኢንትሮፒ'
          }
        }
      }
    },
    chemistry: {
      title: 'ኬሚስትሪ',
      description: 'ቁስን እና የእሱን ለውጦች ይማሩ',
      topics: {
        inorganic: {
          title: 'ኢኦርጋኒክ ኬሚስትሪ',
          description: 'ካርቦን የሌላቸውን ውህዶች ይማሩ',
          subtopics: {
            periodicTable: 'ፔሪዮዲክ ሰንጠረዥ',
            acids: 'አሲዶች እና በዞች',
            salts: 'ጨዎች',
            metals: 'ብረታ ብረቶች'
          }
        },
        organic: {
          title: 'ኦርጋኒክ ኬሚስትሪ',
          description: 'የካርቦን ውህዶችን ይማሩ',
          subtopics: {
            hydrocarbons: 'ሃይድሮካርቦኖች',
            alcohols: 'አልኮሎች',
            acids: 'ኦርጋኒክ አሲዶች',
            polymers: 'ፖሊመሮች'
          }
        },
        physical: {
          title: 'ፊዚካል ኬሚስትሪ',
          description: 'የኬሚካል ስርዓቶችን ይማሩ',
          subtopics: {
            thermodynamics: 'ቴርሞዳይናሚክስ',
            kinetics: 'የኬሚካል ኪኔቲክስ',
            equilibrium: 'የኬሚካል ሚዛን',
            electrochemistry: 'ኤሌክትሮኬሚስትሪ'
          }
        }
      }
    },
    biology: {
      title: 'ባዮሎጂ',
      description: 'ህይወትን እና ህያዋን ነገሮችን ይማሩ',
      topics: {
        cellBiology: {
          title: 'የሴል ባዮሎጂ',
          description: 'የሴል መዋቅርን እና ተግባርን ይማሩ',
          subtopics: {
            cellStructure: 'የሴል መዋቅር',
            cellDivision: 'የሴል መከፋፈል',
            metabolism: 'ሜታቦሊዝም',
            transport: 'የሴል ማጓጓዣ'
          }
        },
        genetics: {
          title: 'ጄኔቲክስ',
          description: 'ውርስን እና ልዩነትን ይማሩ',
          subtopics: {
            inheritance: 'ውርስ',
            dna: 'ዲ.ኤን.ኤ እና አር.ኤን.ኤ',
            mutation: 'ሙዩቴሽን',
            evolution: 'ኢቮሉሽን'
          }
        },
        ecology: {
          title: 'ኢኮሎጂ',
          description: 'ህያዋን እና አካባቢያቸውን ይማሩ',
          subtopics: {
            ecosystems: 'ኢኮሲስተሞች',
            populations: 'ህዝብ ብዛት',
            biodiversity: 'የህይወት ብዝሃነት',
            conservation: 'እንክብካቤ'
          }
        },
        physiology: {
          title: 'ፊዚዮሎጂ',
          description: 'የሰውነት ስርዓቶችን ይማሩ',
          subtopics: {
            digestive: 'የምግብ መፍጫ ስርዓት',
            respiratory: 'የመተንፈሻ ስርዓት',
            circulatory: 'የደም ዝውውር ስርዓት',
            nervous: 'የነርቭ ስርዓት'
          }
        }
      }
    }
  },
  payment: {
    title: 'ክፍያ',
    subtitle: 'የክፍያ ዝውውር..',
    amount: 'መጠን: {{amount}}',
    paymentMethod: 'የክፍያ መንገድ: {{paymentMethod}}',
    orderId: 'የማዘዣ ቁጥር: {{orderId}}',
  }
}; 