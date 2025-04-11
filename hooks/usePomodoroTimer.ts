"use client";

// Custom hook to manage pomodoro timer logic with background tab support

import { useEffect, useRef, useCallback, useState } from "react";
import {
  useTimerStore,
  TimerMode,
  getTimerDuration,
} from "../store/useTimerStore";

// Timer state keys in localStorage
const STORAGE_KEYS = {
  END_TIME: "pomodoroEndTime",
  MODE: "pomodoroMode",
  IS_RUNNING: "pomodoroIsRunning",
  START_TIME: "pomodoroStartTime",
  TIME_LEFT: "pomodoroTimeLeft",
  PAUSED_AT: "pomodoroPausedAt",
};

export function usePomodoroTimer() {
  const {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    startTime,
    pausedTimeLeft,
    setTimeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    incrementCompletedPomodoros,
    setStartTime,
    setPausedTimeLeft,
  } = useTimerStore();

  // Use both setInterval and requestAnimationFrame for better cross-browser support
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Track visibility state for when app goes to background
  const [isVisible, setIsVisible] = useState(true);
  const lastVisibleTimeRef = useRef<number>(Date.now());

  // Flag to track if we've initialized from localStorage
  const hasInitializedRef = useRef(false);

  // Save the current timer state to localStorage
  const persistTimerState = useCallback(() => {
    if (isRunning && startTime) {
      const expectedEndTimestamp = Date.now() + timeLeft * 1000;
      localStorage.setItem(
        STORAGE_KEYS.END_TIME,
        expectedEndTimestamp.toString()
      );
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
      localStorage.setItem(STORAGE_KEYS.IS_RUNNING, "true");
      localStorage.setItem(STORAGE_KEYS.START_TIME, startTime.toString());
      localStorage.setItem(STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
      localStorage.removeItem(STORAGE_KEYS.PAUSED_AT); // Clear paused state when running
    } else if (!isRunning) {
      // When paused, store the time left but clear running state
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
      localStorage.setItem(STORAGE_KEYS.IS_RUNNING, "false");
      localStorage.setItem(STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
      localStorage.setItem(STORAGE_KEYS.PAUSED_AT, timeLeft.toString());

      // Clear dynamic timing values
      localStorage.removeItem(STORAGE_KEYS.END_TIME);
      localStorage.removeItem(STORAGE_KEYS.START_TIME);
    }
  }, [isRunning, mode, startTime, timeLeft]);

  // Handle visibility change events
  useEffect(() => {
    const handleVisibilityChange = () => {
      const nowVisible = !document.hidden;
      const now = Date.now();

      setIsVisible(nowVisible);

      if (nowVisible && isRunning) {
        // Coming back from hidden state - recalculate time based on elapsed time
        const elapsedInBackground = (now - lastVisibleTimeRef.current) / 1000;
        if (elapsedInBackground > 0.5) {
          // Only adjust if significant time passed
          // Calculate new time remaining
          const newTimeLeft = Math.max(
            0,
            timeLeft - Math.floor(elapsedInBackground)
          );
          console.log(
            `App was in background for ${elapsedInBackground.toFixed(
              1
            )}s, adjusting timer`
          );
          setTimeLeft(newTimeLeft);

          // Also update the persisted state
          persistTimerState();
        }
      }

      lastVisibleTimeRef.current = now;
    };

    // Set initial visibility state
    setIsVisible(!document.hidden);
    lastVisibleTimeRef.current = Date.now();

    // Add event listener for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, setTimeLeft, timeLeft, persistTimerState]);

  // Record timer state in localStorage any time timer state changes
  useEffect(() => {
    // Only persist after initial load/restore is complete
    if (hasInitializedRef.current) {
      persistTimerState();
    }
  }, [isRunning, timeLeft, mode, startTime, persistTimerState]);

  // Absolute time-based timer implementation
  useEffect(() => {
    if (!isRunning || !startTime) return;

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);

      // If there was a pausedTimeLeft when we started, we use that as the starting point
      // Otherwise use the full duration
      const originalDuration =
        pausedTimeLeft === null
          ? getTimerDuration(mode)
          : timeLeft + elapsedSeconds; // Reconstruct the original duration

      const newTimeLeft = Math.max(0, originalDuration - elapsedSeconds);

      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft);
      }

      return newTimeLeft;
    };

    // Use both setInterval (for background) and requestAnimationFrame (for foreground)
    const updateTimer = () => {
      const remaining = calculateTimeRemaining();

      if (remaining <= 0) {
        // Timer completed
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
      }

      // Continue the animation loop if visible
      if (isVisible) {
        requestRef.current = requestAnimationFrame(updateTimer);
      }
    };

    // Start both timing mechanisms for better cross-device support
    intervalRef.current = setInterval(() => {
      if (!isVisible) {
        calculateTimeRemaining();
      }
    }, 1000);

    if (isVisible) {
      requestRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [
    isRunning,
    startTime,
    mode,
    timeLeft,
    setTimeLeft,
    isVisible,
    pausedTimeLeft,
  ]);

  // Handle timer completion and mode switching
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      pauseTimer();
      // Play sound notification
      try {
        const audio = new Audio("/notification.mp3");
        audio
          .play()
          .catch((e) => console.error("Error playing notification:", e));
      } catch (e) {
        console.error("Could not play notification sound", e);
      }

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

      // Clear the running state in localStorage
      localStorage.removeItem(STORAGE_KEYS.END_TIME);
      localStorage.removeItem(STORAGE_KEYS.START_TIME);
      localStorage.setItem(STORAGE_KEYS.IS_RUNNING, "false");
      localStorage.removeItem(STORAGE_KEYS.PAUSED_AT);
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

  // Initialize timer state from localStorage on component mount
  useEffect(() => {
    console.log(
      "Initializing timer, hasInitialized:",
      hasInitializedRef.current
    );

    // Only run this once at the beginning
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Get all stored timer state
    const storedEndTime = localStorage.getItem(STORAGE_KEYS.END_TIME);
    const storedMode = localStorage.getItem(
      STORAGE_KEYS.MODE
    ) as TimerMode | null;
    const storedIsRunning =
      localStorage.getItem(STORAGE_KEYS.IS_RUNNING) === "true";
    const storedStartTime = localStorage.getItem(STORAGE_KEYS.START_TIME);
    const storedTimeLeft = localStorage.getItem(STORAGE_KEYS.TIME_LEFT);
    const storedPausedAt = localStorage.getItem(STORAGE_KEYS.PAUSED_AT);

    console.log("Restoring timer from localStorage:", {
      storedMode,
      storedIsRunning,
      storedTimeLeft,
      storedPausedAt,
      storedEndTime,
    });

    // Set the mode first if available
    if (
      storedMode &&
      ["pomodoro", "shortBreak", "longBreak"].includes(storedMode)
    ) {
      setMode(storedMode as TimerMode);
    }

    // Restore a running timer
    if (storedIsRunning && storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();

      // If the end time is in the future, recover the timer
      if (endTime > now) {
        const remainingMs = endTime - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);

        // Only recover if more than 1 second remains
        if (remainingSeconds > 1) {
          console.log(
            `Recovering running timer with ${remainingSeconds}s remaining`
          );

          // Calculate how long the timer has been running
          const originalDuration = getTimerDuration(storedMode as TimerMode);
          const elapsedSeconds = originalDuration - remainingSeconds;

          // Calculate the start time based on the elapsed seconds
          const calculatedStartTime = now - elapsedSeconds * 1000;

          // Set the state directly in the correct order
          setTimeLeft(remainingSeconds);

          // When we restart, we want the timer to know it was previously paused at this time
          setPausedTimeLeft(remainingSeconds);

          // Set the appropriate start time
          setStartTime(calculatedStartTime);

          // Start the timer
          startTimer();

          return; // Exit early, we've restored the timer
        }
      }
    }

    // If we didn't restore a running timer but have paused state
    if (storedPausedAt && !isNaN(Number(storedPausedAt))) {
      const pausedTime = parseInt(storedPausedAt, 10);
      if (
        pausedTime > 0 &&
        pausedTime <= getTimerDuration(storedMode as TimerMode)
      ) {
        console.log(`Recovering paused timer with ${pausedTime}s remaining`);
        setTimeLeft(pausedTime);
        setPausedTimeLeft(pausedTime);
        return;
      }
    }

    // If we have stored time but no paused time
    if (storedTimeLeft && !isNaN(Number(storedTimeLeft))) {
      const savedTimeLeft = parseInt(storedTimeLeft, 10);
      if (
        savedTimeLeft > 0 &&
        savedTimeLeft <= getTimerDuration(storedMode as TimerMode)
      ) {
        console.log(`Recovering timer with ${savedTimeLeft}s remaining`);
        setTimeLeft(savedTimeLeft);

        // Make sure we restore this as a paused time too
        setPausedTimeLeft(savedTimeLeft);
      }
    }
  }, [setMode, setTimeLeft, startTimer, setStartTime, setPausedTimeLeft]);

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
    // Update localStorage with new mode
    localStorage.setItem(STORAGE_KEYS.MODE, newMode);
    localStorage.setItem(
      STORAGE_KEYS.TIME_LEFT,
      getTimerDuration(newMode).toString()
    );

    // Clear running state
    localStorage.removeItem(STORAGE_KEYS.END_TIME);
    localStorage.removeItem(STORAGE_KEYS.START_TIME);
    localStorage.removeItem(STORAGE_KEYS.PAUSED_AT);
    localStorage.setItem(STORAGE_KEYS.IS_RUNNING, "false");
  };

  const handleStartPause = () => {
    if (isRunning) {
      pauseTimer();
      // Update localStorage when pausing
      localStorage.setItem(STORAGE_KEYS.IS_RUNNING, "false");
      localStorage.setItem(STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
      localStorage.setItem(STORAGE_KEYS.PAUSED_AT, timeLeft.toString());
      localStorage.removeItem(STORAGE_KEYS.END_TIME);
      localStorage.removeItem(STORAGE_KEYS.START_TIME);
    } else {
      // Start from the current time left
      startTimer();
    }
  };

  const handleReset = () => {
    resetTimer();
    // Clear timer state in localStorage
    localStorage.removeItem(STORAGE_KEYS.END_TIME);
    localStorage.removeItem(STORAGE_KEYS.START_TIME);
    localStorage.removeItem(STORAGE_KEYS.PAUSED_AT);
    localStorage.setItem(STORAGE_KEYS.IS_RUNNING, "false");
    localStorage.setItem(
      STORAGE_KEYS.TIME_LEFT,
      getTimerDuration(mode).toString()
    );
  };

  // Get estimated timer accuracy (for debugging)
  const timerAccuracy = useRef<"high" | "medium" | "low">("high");
  useEffect(() => {
    // Determine browser timer accuracy based on platform
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) || /Android/.test(ua)) {
      timerAccuracy.current = isVisible ? "medium" : "low";
    } else {
      timerAccuracy.current = "high";
    }
  }, [isVisible]);

  return {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    formattedTime: formatTime(timeLeft),
    handleStartPause,
    handleReset,
    handleModeChange,
    isVisible,
    timerAccuracy: timerAccuracy.current,
  };
}

export {};
