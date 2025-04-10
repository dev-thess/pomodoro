"use client";

import React from "react";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import { TimerMode } from "../store/useTimerStore";
import SessionNote from "./SessionNote";

export function Timer() {
  const {
    mode,
    formattedTime,
    isRunning,
    completedPomodoros,
    handleStartPause,
    handleReset,
    handleModeChange,
    isVisible,
    timerAccuracy,
  } = usePomodoroTimer();

  const modeButtons: { label: string; value: TimerMode }[] = [
    { label: "Pomodoro", value: "pomodoro" },
    { label: "Short Break", value: "shortBreak" },
    { label: "Long Break", value: "longBreak" },
  ];

  // Display completed pomodoros as tomato emojis
  const renderCompletedPomodoros = () => {
    return (
      <div className='text-center text-gray-600'>
        <p className='text-sm'>
          Completed today:{" "}
          <span className='font-semibold'>{completedPomodoros}</span>
          {completedPomodoros > 0 && (
            <span className='ml-2'>
              {Array(Math.min(completedPomodoros, 8)).fill("🍅").join("")}
            </span>
          )}
        </p>
      </div>
    );
  };

  // Display timer accuracy indicator (for debugging)
  const renderTimerStatus = () => {
    return (
      <div className='text-xs opacity-50 absolute bottom-1 right-2'>
        {!isVisible && (
          <span title='App is in background' className='text-yellow-500 mr-2'>
            ⚠️
          </span>
        )}
        {timerAccuracy === "high"
          ? "⚡"
          : timerAccuracy === "medium"
          ? "⚙️"
          : "⏱️"}
      </div>
    );
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8'>
      <div className='w-full max-w-md p-6 bg-white rounded-xl shadow-md mb-6 relative'>
        <h1 className='text-2xl font-bold text-center text-gray-800 mb-6'>
          Pomodoro Timer
        </h1>

        {/* Mode Selection */}
        <div className='flex justify-center mb-6'>
          {modeButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => handleModeChange(btn.value)}
              className={`px-4 py-2 mx-1 rounded-lg transition-all ${
                mode === btn.value
                  ? "bg-red-500 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div
          className={`text-7xl font-bold text-center my-8 font-mono ${
            mode === "pomodoro"
              ? "text-red-500"
              : mode === "shortBreak"
              ? "text-green-500"
              : "text-blue-500"
          }`}
        >
          {formattedTime}
        </div>

        {/* Controls */}
        <div className='flex justify-center space-x-4 mb-6'>
          <button
            onClick={handleStartPause}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              isRunning
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className='px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors'
          >
            Reset
          </button>
        </div>

        {/* Pomodoro Count */}
        {renderCompletedPomodoros()}

        {/* Timer status indicator */}
        {renderTimerStatus()}
      </div>

      {/* Session Notes */}
      {mode === "pomodoro" && <SessionNote className='w-full max-w-md' />}
    </div>
  );
}
