"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Note {
  content: string;
  lastUpdated: string; // ISO string
}

// Notes organized by date and session
export interface NotesState {
  notes: Record<string, Record<number, Note>>;

  // Actions
  saveNote: (date: string, sessionIndex: number, content: string) => void;
  getNote: (date: string, sessionIndex: number) => Note | undefined;
  getNotesForDate: (date: string) => Record<number, Note> | undefined;
}

export const useNoteStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},

      saveNote: (date, sessionIndex, content) => {
        set((state) => {
          const dateNotes = state.notes[date] || {};
          const existingNote = dateNotes[sessionIndex];

          return {
            notes: {
              ...state.notes,
              [date]: {
                ...dateNotes,
                [sessionIndex]: {
                  content,
                  lastUpdated: new Date().toISOString(),
                },
              },
            },
          };
        });
      },

      getNote: (date, sessionIndex) => {
        const state = get();
        return state.notes[date]?.[sessionIndex];
      },

      getNotesForDate: (date) => {
        const state = get();
        return state.notes[date];
      },
    }),
    {
      name: "pomodoro-session-notes",
    }
  )
);
