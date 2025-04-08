// Zustand store setup

import { create } from "zustand";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedPomodoros: number;
  startTime: number | null;

  // Actions
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementCompletedPomodoros: () => void;
}

const TIMER_DURATION = {
  pomodoro: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes in seconds
  longBreak: 15 * 60, // 15 minutes in seconds
};

export const useTimerStore = create<TimerState>((set) => ({
  mode: "pomodoro",
  timeLeft: TIMER_DURATION.pomodoro,
  isRunning: false,
  completedPomodoros: 0,
  startTime: null,

  setMode: (mode) =>
    set((state) => ({
      mode,
      timeLeft: TIMER_DURATION[mode],
      isRunning: false,
    })),

  setTimeLeft: (time) => set({ timeLeft: time }),

  startTimer: () => set({ isRunning: true, startTime: Date.now() }),

  pauseTimer: () => set({ isRunning: false, startTime: null }),

  resetTimer: () =>
    set((state) => ({
      timeLeft: TIMER_DURATION[state.mode],
      isRunning: false,
      startTime: null,
    })),

  incrementCompletedPomodoros: () =>
    set((state) => ({
      completedPomodoros: state.completedPomodoros + 1,
    })),
}));

export const getTimerDuration = (mode: TimerMode) => TIMER_DURATION[mode];
