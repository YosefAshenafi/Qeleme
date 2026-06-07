import { useCallback, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'mcqPracticeSettings';

// Wait time before auto-advancing, 1–5 seconds.
export const AUTO_NEXT_DELAY_OPTIONS = [1000, 2000, 3000, 4000, 5000] as const;

export type PracticeSettings = {
  autoNextEnabled: boolean;
  autoNextDelay: number;
};

// Module-level shared store so every consumer (the in-quiz settings modal and
// the Profile settings page) reads and writes the same value and stays in sync
// live — even though the practice tab stays mounted across navigations.
let snapshot: PracticeSettings = { autoNextEnabled: false, autoNextDelay: 2000 };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      snapshot = {
        autoNextEnabled: typeof parsed.autoNextEnabled === 'boolean' ? parsed.autoNextEnabled : false,
        autoNextDelay: typeof parsed.autoNextDelay === 'number' ? parsed.autoNextDelay : 2000,
      };
      emit();
    }
  } catch {
    // ignore read errors — defaults apply
  }
}

function persist() {
  AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(snapshot)).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void ensureLoaded();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

/**
 * Persisted, app-wide settings for the regular MCQ practice flow.
 * - autoNextEnabled: auto-advance to the next question after an answer is chosen.
 * - autoNextDelay: how long (ms) to wait before auto-advancing.
 * Defaults: disabled, 2s.
 */
export function usePracticeSettings() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setAutoNextEnabled = useCallback((value: boolean) => {
    snapshot = { ...snapshot, autoNextEnabled: value };
    persist();
    emit();
  }, []);

  const setAutoNextDelay = useCallback((ms: number) => {
    snapshot = { ...snapshot, autoNextDelay: ms };
    persist();
    emit();
  }, []);

  return {
    autoNextEnabled: state.autoNextEnabled,
    setAutoNextEnabled,
    autoNextDelay: state.autoNextDelay,
    setAutoNextDelay,
  };
}
