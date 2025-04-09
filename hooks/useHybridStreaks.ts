"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useGuestSession, GuestStreak } from "./useGuestSession";
import { useServerStreaks, Streak } from "./useServerStreaks";

export function useHybridStreaks() {
  const { status } = useSession();
  const { isGuest, saveGuestStreak, getGuestStreak, getAllGuestStreaks } =
    useGuestSession();
  const {
    streaks,
    isLoading: isServerLoading,
    error: serverError,
    fetchStreaks,
    updateStreak,
    getStreakByDate,
  } = useServerStreaks();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format streak for consistent usage
  const formatStreak = (streak: Streak | GuestStreak) => {
    return {
      id: "id" in streak ? streak.id : `guest-${streak.date}`,
      date:
        typeof streak.date === "string"
          ? streak.date
          : new Date(streak.date).toISOString().split("T")[0],
      sessions: streak.sessions,
    };
  };

  // Fetch all streaks (from server or localStorage)
  const fetchAllStreaks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isGuest) {
        // Guest user - get streaks from localStorage
        const guestStreaks = getAllGuestStreaks();
        return guestStreaks.map(formatStreak);
      } else {
        // Authenticated user - get streaks from server
        await fetchStreaks();
        return streaks.map(formatStreak);
      }
    } catch (err) {
      console.error("Error fetching streaks:", err);
      setError("Failed to load your progress. Please try again.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isGuest, getAllGuestStreaks, fetchStreaks, streaks]);

  // Save or update a streak (to server or localStorage)
  const updateStreakHybrid = useCallback(
    async (date: string, sessions: number) => {
      setError(null);

      try {
        if (isGuest) {
          // Guest user - save to localStorage
          const streak: GuestStreak = {
            date,
            sessions,
          };
          saveGuestStreak(streak);
          return formatStreak(streak);
        } else {
          // Authenticated user - save to server
          const savedStreak = await updateStreak(date, sessions);
          return savedStreak ? formatStreak(savedStreak) : null;
        }
      } catch (err) {
        console.error("Error saving streak:", err);
        setError("Failed to update your progress. Please try again.");
        return null;
      }
    },
    [isGuest, saveGuestStreak, updateStreak]
  );

  // Get a streak by date (from server or localStorage)
  const getStreakHybrid = useCallback(
    (date: string) => {
      try {
        if (isGuest) {
          // Guest user - get from localStorage
          const streak = getGuestStreak(date);
          return streak ? formatStreak(streak) : null;
        } else {
          // Authenticated user - get from server
          const streak = getStreakByDate(date);
          return streak ? formatStreak(streak) : null;
        }
      } catch (err) {
        console.error("Error getting streak:", err);
        return null;
      }
    },
    [isGuest, getGuestStreak, getStreakByDate]
  );

  return {
    isLoading: isLoading || isServerLoading,
    error: error || serverError,
    fetchStreaks: fetchAllStreaks,
    updateStreak: updateStreakHybrid,
    getStreakByDate: getStreakHybrid,
    isGuest,
  };
}
