"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Note {
  id: string;
  content: string;
  date: string;
  session: number;
}

export function useServerNotes() {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes for a specific date
  const fetchNotes = useCallback(
    async (date: string) => {
      if (status !== "authenticated") return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notes?date=${date}`);

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();
        setNotes(data);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to load your notes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [status]
  );

  // Save a note to the server
  const saveNote = useCallback(
    async (date: string, session: number, content: string) => {
      if (status !== "authenticated") return null;

      setError(null);

      try {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date, session, content }),
        });

        if (!response.ok) {
          throw new Error("Failed to save note");
        }

        const savedNote = await response.json();

        // Update local state
        setNotes((prevNotes) => {
          const noteIndex = prevNotes.findIndex(
            (note) =>
              note.session === session &&
              new Date(note.date).toDateString() ===
                new Date(date).toDateString()
          );

          if (noteIndex >= 0) {
            // Replace existing note
            const updatedNotes = [...prevNotes];
            updatedNotes[noteIndex] = savedNote;
            return updatedNotes;
          } else {
            // Add new note
            return [...prevNotes, savedNote];
          }
        });

        return savedNote;
      } catch (err) {
        console.error("Error saving note:", err);
        setError("Failed to save your note. Please try again.");
        return null;
      }
    },
    [status]
  );

  // Get a specific note
  const getNote = useCallback(
    (session: number) => {
      return notes.find((note) => note.session === session) || null;
    },
    [notes]
  );

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    saveNote,
    getNote,
  };
}
