// Zustand store setup

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedPomodoros: number;
  startTime: number | null;
  pausedTimeLeft: number | null; // Track time left when paused
  lastSession: {
    date: string;
    count: number;
  };

  // Actions
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementCompletedPomodoros: () => void;
  setStartTime: (time: number | null) => void;
  setPausedTimeLeft: (time: number | null) => void;
}

const TIMER_DURATION = {
  pomodoro: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes in seconds
  longBreak: 15 * 60, // 15 minutes in seconds
};

// Get today's date in YYYY-MM-DD format for tracking daily pomodoros
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Create the persisted store
export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "pomodoro",
      timeLeft: TIMER_DURATION.pomodoro,
      isRunning: false,
      completedPomodoros: 0,
      startTime: null,
      pausedTimeLeft: null,
      lastSession: {
        date: getTodayDate(),
        count: 0,
      },

      setMode: (mode) =>
        set((state) => ({
          mode,
          timeLeft: TIMER_DURATION[mode],
          isRunning: false,
          startTime: null,
          pausedTimeLeft: null,
        })),

      setTimeLeft: (time) => set({ timeLeft: time }),

      setStartTime: (time) => set({ startTime: time }),

      setPausedTimeLeft: (time) => set({ pausedTimeLeft: time }),

      startTimer: () => {
        const state = get();
        // Determine which time value to use
        const currentTimeLeft =
          state.pausedTimeLeft !== null
            ? state.pausedTimeLeft // Use paused time if available
            : state.timeLeft; // Otherwise use current timeLeft

        set({
          isRunning: true,
          startTime: Date.now(),
          timeLeft: currentTimeLeft,
          pausedTimeLeft: null, // Clear paused time when starting
        });
      },

      pauseTimer: () =>
        set((state) => ({
          isRunning: false,
          pausedTimeLeft: state.timeLeft, // Store the current time left
          startTime: null,
        })),

      resetTimer: () =>
        set((state) => ({
          timeLeft: TIMER_DURATION[state.mode],
          isRunning: false,
          startTime: null,
          pausedTimeLeft: null,
        })),

      incrementCompletedPomodoros: () =>
        set((state) => {
          const today = getTodayDate();
          const newCount =
            state.lastSession.date === today ? state.completedPomodoros + 1 : 1;

          return {
            completedPomodoros: newCount,
            lastSession: {
              date: today,
              count: newCount,
            },
          };
        }),
    }),
    {
      name: "pomodoro-timer-storage",
      // Persist all timer state data to restore properly
      partialize: (state) => ({
        completedPomodoros: state.completedPomodoros,
        lastSession: state.lastSession,
        mode: state.mode,
        timeLeft: state.timeLeft,
        pausedTimeLeft: state.pausedTimeLeft,
        isRunning: state.isRunning,
      }),
    }
  )
);

export const getTimerDuration = (mode: TimerMode) => TIMER_DURATION[mode];
