// Custom hook to manage pomodoro timer logic

import { useEffect, useRef, useCallback } from "react";
import {
  useTimerStore,
  TimerMode,
  getTimerDuration,
} from "../store/useTimerStore";

export function usePomodoroTimer() {
  const {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    setTimeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    incrementCompletedPomodoros,
  } = useTimerStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timer tick with useCallback to avoid recreating function on each render
  const tick = useCallback(() => {
    setTimeLeft(Math.max(0, timeLeft - 1));
  }, [timeLeft, setTimeLeft]);

  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  // Handle timer completion and mode switching
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      pauseTimer();

      if (mode === "pomodoro") {
        incrementCompletedPomodoros();

        // After 4 pomodoros, take a long break
        if ((completedPomodoros + 1) % 4 === 0) {
          setMode("longBreak");
        } else {
          setMode("shortBreak");
        }
      } else {
        // After a break, go back to pomodoro
        setMode("pomodoro");
      }
    }
  }, [
    timeLeft,
    isRunning,
    mode,
    completedPomodoros,
    pauseTimer,
    incrementCompletedPomodoros,
    setMode,
  ]);

  // Helper function to format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
  };

  const handleStartPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleReset = () => {
    resetTimer();
  };

  return {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    formattedTime: formatTime(timeLeft),
    handleStartPause,
    handleReset,
    handleModeChange,
  };
}

export {};
