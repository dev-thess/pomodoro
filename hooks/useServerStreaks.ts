"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Streak {
  id: string;
  date: string;
  sessions: number;
}

export function useServerStreaks() {
  const { data: session, status } = useSession();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all streaks
  const fetchStreaks = useCallback(async () => {
    if (status !== "authenticated") return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/streak");

      if (!response.ok) {
        throw new Error("Failed to fetch streaks");
      }

      const data = await response.json();
      setStreaks(data);
    } catch (err) {
      console.error("Error fetching streaks:", err);
      setError("Failed to load your progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  // Update a streak for a specific date
  const updateStreak = useCallback(
    async (date: string, sessions: number) => {
      if (status !== "authenticated") return null;

      setError(null);

      try {
        const response = await fetch("/api/streak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date, sessions }),
        });

        if (!response.ok) {
          throw new Error("Failed to update streak");
        }

        const updatedStreak = await response.json();

        // Update local state
        setStreaks((prevStreaks) => {
          const streakIndex = prevStreaks.findIndex(
            (streak) =>
              new Date(streak.date).toDateString() ===
              new Date(date).toDateString()
          );

          if (streakIndex >= 0) {
            // Replace existing streak
            const newStreaks = [...prevStreaks];
            newStreaks[streakIndex] = updatedStreak;
            return newStreaks;
          } else {
            // Add new streak
            return [...prevStreaks, updatedStreak];
          }
        });

        return updatedStreak;
      } catch (err) {
        console.error("Error updating streak:", err);
        setError("Failed to update your progress. Please try again.");
        return null;
      }
    },
    [status]
  );

  // Get today's streak
  const getTodayStreak = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return (
      streaks.find(
        (streak) => new Date(streak.date).toISOString().split("T")[0] === today
      ) || null
    );
  }, [streaks]);

  // Get streak for a specific date
  const getStreakByDate = useCallback(
    (date: string) => {
      const formattedDate = new Date(date).toISOString().split("T")[0];
      return (
        streaks.find(
          (streak) =>
            new Date(streak.date).toISOString().split("T")[0] === formattedDate
        ) || null
      );
    },
    [streaks]
  );

  return {
    streaks,
    isLoading,
    error,
    fetchStreaks,
    updateStreak,
    getTodayStreak,
    getStreakByDate,
  };
}
