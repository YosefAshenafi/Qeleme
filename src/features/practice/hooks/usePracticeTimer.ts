import { useState, useRef, useEffect } from 'react';
import { formatPracticeTime, getTimeParts } from '@/features/practice/utils/practiceTime';

// Owns the MCQ session stopwatch. The lifecycle effect mirrors the original
// behavior: the timer runs while a test is in progress and stops once results
// show. The orchestrator still drives manual resets via the returned setters.
export function usePracticeTimer({ showTest, showResult }: { showTest: boolean; showResult: boolean }) {
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const shouldRun = showTest && !showResult;

    if (shouldRun) {
      if (!timerRef.current) startTimer();
      return;
    }

    stopTimer();
  }, [showTest, showResult]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const { hours: timeHours, minutes: timeMinutes, seconds: timeSeconds } = getTimeParts(time);

  return {
    time,
    setTime,
    isTimerRunning,
    setIsTimerRunning,
    timerRef,
    startTimer,
    stopTimer,
    timeHours,
    timeMinutes,
    timeSeconds,
    formattedPracticeTime: formatPracticeTime(time),
  };
}
