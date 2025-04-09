"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useGuestSession, GuestNote } from "./useGuestSession";
import { useServerNotes, Note } from "./useServerNotes";

export function useHybridNotes() {
  const { status } = useSession();
  const { isGuest, saveGuestNote, getGuestNote, getGuestNotesByDate } =
    useGuestSession();
  const {
    notes,
    isLoading: isServerLoading,
    error: serverError,
    fetchNotes,
    saveNote,
    getNote,
  } = useServerNotes();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert server note to the format used in the component
  const formatNote = (note: Note | GuestNote) => {
    return {
      id: "id" in note ? note.id : `guest-${note.date}-${note.session}`,
      date:
        typeof note.date === "string"
          ? note.date
          : new Date(note.date).toISOString().split("T")[0],
      session: note.session,
      content: note.content,
      updatedAt:
        "updatedAt" in note ? note.updatedAt : new Date().toISOString(),
    };
  };

  // Fetch notes for a specific date (from server or localStorage)
  const fetchNotesForDate = useCallback(
    async (date: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isGuest) {
          // Guest user - get notes from localStorage
          const guestNotes = getGuestNotesByDate(date);
          return guestNotes.map(formatNote);
        } else {
          // Authenticated user - get notes from server
          await fetchNotes(date);
          return notes.map(formatNote);
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to load your notes. Please try again.");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isGuest, getGuestNotesByDate, fetchNotes, notes]
  );

  // Save a note (to server or localStorage)
  const saveNoteHybrid = useCallback(
    async (date: string, session: number, content: string) => {
      setError(null);

      try {
        if (isGuest) {
          // Guest user - save to localStorage
          const note: GuestNote = {
            date,
            session,
            content,
            updatedAt: new Date().toISOString(),
          };
          saveGuestNote(note);
          return formatNote(note);
        } else {
          // Authenticated user - save to server
          const savedNote = await saveNote(date, session, content);
          return savedNote ? formatNote(savedNote) : null;
        }
      } catch (err) {
        console.error("Error saving note:", err);
        setError("Failed to save your note. Please try again.");
        return null;
      }
    },
    [isGuest, saveGuestNote, saveNote]
  );

  // Get a note by date and session (from server or localStorage)
  const getNoteHybrid = useCallback(
    (date: string, session: number) => {
      try {
        if (isGuest) {
          // Guest user - get from localStorage
          const note = getGuestNote(date, session);
          return note ? formatNote(note) : null;
        } else {
          // Authenticated user - get from server
          const note = getNote(session);
          return note ? formatNote(note) : null;
        }
      } catch (err) {
        console.error("Error getting note:", err);
        return null;
      }
    },
    [isGuest, getGuestNote, getNote]
  );

  return {
    isLoading: isLoading || isServerLoading,
    error: error || serverError,
    fetchNotes: fetchNotesForDate,
    saveNote: saveNoteHybrid,
    getNote: getNoteHybrid,
    isGuest,
  };
}
