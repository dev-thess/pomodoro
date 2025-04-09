"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useGuestSession } from "@/hooks/useGuestSession";

export function GuestBanner() {
  const { isGuest, isSyncing } = useGuestSession();
  const [isVisible, setIsVisible] = useState(true);

  if (!isGuest || !isVisible) {
    return null;
  }

  const handleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className='w-full bg-blue-50 border-t border-b border-blue-100 px-4 py-3'>
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        <div className='flex-1 text-sm text-blue-700'>
          You're using Pomodoro as a guest. Sign in to sync your notes and
          progress across devices.
        </div>
        <div className='flex items-center space-x-2 ml-4'>
          <button
            onClick={handleLogin}
            disabled={isSyncing}
            className='text-xs font-medium px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-70'
          >
            {isSyncing ? "Syncing..." : "Sign in with Google"}
          </button>
          <button
            onClick={handleDismiss}
            className='text-xs text-blue-500 hover:text-blue-700'
            aria-label='Dismiss'
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
