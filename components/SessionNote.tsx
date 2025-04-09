"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNoteStore } from "../store/useNoteStore";
import { useTimerStore } from "../store/useTimerStore";

interface SessionNoteProps {
  className?: string;
}

export default function SessionNote({ className = "" }: SessionNoteProps) {
  const { completedPomodoros } = useTimerStore();
  const { saveNote, getNote, getNotesForDate } = useNoteStore();

  const [noteContent, setNoteContent] = useState("");
  const [previousNotes, setPreviousNotes] = useState<
    { sessionIndex: number; content: string; lastUpdated: string }[]
  >([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];
  const sessionIndex = completedPomodoros + 1; // Current session

  // Load note content when component mounts or session changes
  useEffect(() => {
    const currentNote = getNote(currentDate, sessionIndex);
    setNoteContent(currentNote?.content || "");

    // Load previous notes for today
    const todaysNotes = getNotesForDate(currentDate) || {};
    const notesArray = Object.entries(todaysNotes)
      .filter(([idx, _]) => parseInt(idx) < sessionIndex) // Only show previous sessions
      .map(([idx, note]) => ({
        sessionIndex: parseInt(idx),
        content: note.content,
        lastUpdated: note.lastUpdated,
      }))
      .sort((a, b) => b.sessionIndex - a.sessionIndex); // Most recent first

    setPreviousNotes(notesArray);
  }, [currentDate, sessionIndex, getNote, getNotesForDate]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [noteContent]);

  // Handle note content change with auto-save
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNoteContent(newContent);

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save after 500ms of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(currentDate, sessionIndex, newContent);
    }, 500);
  };

  // Save on blur immediately
  const handleBlur = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveNote(currentDate, sessionIndex, noteContent);
  };

  // Format time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-5 ${className}`}>
      <div className='mb-3 flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800'>
          Session #{sessionIndex} Notes
        </h2>
        {previousNotes.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='text-sm text-blue-500 hover:text-blue-700'
          >
            {isExpanded
              ? "Hide previous"
              : `Show previous (${previousNotes.length})`}
          </button>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={noteContent}
        onChange={handleNoteChange}
        onBlur={handleBlur}
        placeholder='What are you working on in this session? Add your thoughts, ideas, or to-dos here...'
        className='w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none'
      />

      {/* Previous notes section */}
      {isExpanded && previousNotes.length > 0 && (
        <div className='mt-4 space-y-3'>
          <h3 className='text-sm font-medium text-gray-500'>Earlier today:</h3>
          {previousNotes.map((note) => (
            <div key={note.sessionIndex} className='p-3 bg-gray-50 rounded-lg'>
              <div className='flex justify-between items-center mb-1'>
                <span className='text-xs font-semibold text-gray-700'>
                  Session #{note.sessionIndex}
                </span>
                <span className='text-xs text-gray-500'>
                  {formatTime(note.lastUpdated)}
                </span>
              </div>
              <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
