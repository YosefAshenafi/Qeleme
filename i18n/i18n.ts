import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../src/i18n/locales/en';
import am from '../src/i18n/locales/am';

const LANGUAGES = {
  en: { name: 'English', dir: 'ltr' },
  am: { name: 'አማርኛ', dir: 'ltr' },
};

const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    // If no language is saved, set English as default and save it
    if (!savedLanguage) {
      await AsyncStorage.setItem('user-language', 'en');
      return 'en';
    }
    return savedLanguage;
  } catch {
    // If there's any error, default to English
    return 'en';
  }
};

const saveLanguage = async (lng: string) => {
  try {
    await AsyncStorage.setItem('user-language', lng);
  } catch {
    // Handle error
  }
};

// Initialize i18n
export const initI18n = async () => {
  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          am: { translation: am },
        },
        lng: await loadLanguage(),
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
  }
};

// Initialize i18n immediately
initI18n().catch(console.error);

export default i18n;
export { LANGUAGES, loadLanguage, saveLanguage }; 