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
    (set) => ({
      mode: "pomodoro",
      timeLeft: TIMER_DURATION.pomodoro,
      isRunning: false,
      completedPomodoros: 0,
      startTime: null,
      lastSession: {
        date: getTodayDate(),
        count: 0,
      },

      setMode: (mode) =>
        set((state) => ({
          mode,
          timeLeft: TIMER_DURATION[mode],
          isRunning: false,
        })),

      setTimeLeft: (time) => set({ timeLeft: time }),

      setStartTime: (time) => set({ startTime: time }),

      startTimer: () => set({ isRunning: true, startTime: Date.now() }),

      pauseTimer: () => set({ isRunning: false, startTime: null }),

      resetTimer: () =>
        set((state) => ({
          timeLeft: TIMER_DURATION[state.mode],
          isRunning: false,
          startTime: null,
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
      // Only persist these fields
      partialize: (state) => ({
        completedPomodoros: state.completedPomodoros,
        lastSession: state.lastSession,
        mode: state.mode,
      }),
    }
  )
);

export const getTimerDuration = (mode: TimerMode) => TIMER_DURATION[mode];
