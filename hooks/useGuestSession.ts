"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Define types for guest session data
export interface GuestNote {
  date: string;
  session: number;
  content: string;
  updatedAt: string;
}

export interface GuestStreak {
  date: string;
  sessions: number;
}

interface GuestData {
  notes: GuestNote[];
  streaks: GuestStreak[];
}

// Storage keys
const GUEST_DATA_KEY = "pomodoro-guest-data";
const SYNC_STATUS_KEY = "pomodoro-sync-status";

export function useGuestSession() {
  const { data: session, status } = useSession();
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [hasSyncedData, setHasSyncedData] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Initialize guest status based on auth state
  useEffect(() => {
    if (status === "authenticated") {
      setIsGuest(false);
    } else if (status === "unauthenticated") {
      setIsGuest(true);

      // Check if we've already synced data after login
      const syncStatus = localStorage.getItem(SYNC_STATUS_KEY);
      setHasSyncedData(syncStatus === "synced");
    }
  }, [status]);

  // Save note to localStorage (for guest users)
  const saveGuestNote = (note: GuestNote) => {
    if (!isGuest) return;

    const data = getGuestData();

    // Check if note already exists
    const existingNoteIndex = data.notes.findIndex(
      (n) => n.date === note.date && n.session === note.session
    );

    if (existingNoteIndex >= 0) {
      // Update existing note
      data.notes[existingNoteIndex] = note;
    } else {
      // Add new note
      data.notes.push(note);
    }

    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
  };

  // Save streak to localStorage (for guest users)
  const saveGuestStreak = (streak: GuestStreak) => {
    if (!isGuest) return;

    const data = getGuestData();

    // Check if streak already exists for this date
    const existingStreakIndex = data.streaks.findIndex(
      (s) => s.date === streak.date
    );

    if (existingStreakIndex >= 0) {
      // Update existing streak
      data.streaks[existingStreakIndex] = streak;
    } else {
      // Add new streak
      data.streaks.push(streak);
    }

    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
  };

  // Get guest note by date and session
  const getGuestNote = (
    date: string,
    session: number
  ): GuestNote | undefined => {
    const data = getGuestData();
    return data.notes.find(
      (note) => note.date === date && note.session === session
    );
  };

  // Get all guest notes for a specific date
  const getGuestNotesByDate = (date: string): GuestNote[] => {
    const data = getGuestData();
    return data.notes
      .filter((note) => note.date === date)
      .sort((a, b) => a.session - b.session);
  };

  // Get all guest notes
  const getAllGuestNotes = (): GuestNote[] => {
    return getGuestData().notes;
  };

  // Get guest streak by date
  const getGuestStreak = (date: string): GuestStreak | undefined => {
    const data = getGuestData();
    return data.streaks.find((streak) => streak.date === date);
  };

  // Get all guest streaks
  const getAllGuestStreaks = (): GuestStreak[] => {
    return getGuestData().streaks;
  };

  // Sync guest data to the server when user logs in
  const syncGuestData = async (): Promise<boolean> => {
    if (!session || !session.user || hasSyncedData) return false;

    try {
      setIsSyncing(true);
      const guestData = getGuestData();

      if (guestData.notes.length === 0 && guestData.streaks.length === 0) {
        // No data to sync
        setHasSyncedData(true);
        localStorage.setItem(SYNC_STATUS_KEY, "synced");
        return true;
      }

      // Sync notes
      if (guestData.notes.length > 0) {
        const response = await fetch("/api/sync/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: guestData.notes }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync notes");
        }
      }

      // Sync streaks
      if (guestData.streaks.length > 0) {
        const response = await fetch("/api/sync/streaks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ streaks: guestData.streaks }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync streaks");
        }
      }

      // Mark as synced
      setHasSyncedData(true);
      localStorage.setItem(SYNC_STATUS_KEY, "synced");
      return true;
    } catch (error) {
      console.error("Error syncing guest data:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear guest data (e.g., after successful sync)
  const clearGuestData = () => {
    localStorage.removeItem(GUEST_DATA_KEY);
  };

  // Helper to get guest data from localStorage
  const getGuestData = (): GuestData => {
    const dataStr = localStorage.getItem(GUEST_DATA_KEY);
    if (!dataStr) {
      return { notes: [], streaks: [] };
    }

    try {
      return JSON.parse(dataStr) as GuestData;
    } catch (e) {
      console.error("Error parsing guest data:", e);
      return { notes: [], streaks: [] };
    }
  };

  return {
    isGuest,
    isSyncing,
    hasSyncedData,
    saveGuestNote,
    saveGuestStreak,
    getGuestNote,
    getGuestNotesByDate,
    getAllGuestNotes,
    getGuestStreak,
    getAllGuestStreaks,
    syncGuestData,
    clearGuestData,
  };
}
