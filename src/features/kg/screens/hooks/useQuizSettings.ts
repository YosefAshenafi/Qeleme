import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'kgQuizSettings';

interface QuizSettings {
  soundEnabled: boolean;
  autoAdvanceDelay: number;
}

export function useQuizSettings() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(2000);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setAutoAdvanceDelay(parsed.autoAdvanceDelay ?? 2000);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSoundEnabled: boolean, newDelay: number) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({
        soundEnabled: newSoundEnabled,
        autoAdvanceDelay: newDelay,
      }));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    soundEnabled,
    setSoundEnabled,
    autoAdvanceDelay,
    setAutoAdvanceDelay,
    saveSettings,
  };
}
