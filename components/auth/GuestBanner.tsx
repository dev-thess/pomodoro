"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSessionUser } from "@/hooks/useSessionUser";

export function GuestBanner() {
  const { mode, isSyncing } = useSessionUser();
  const [isVisible, setIsVisible] = useState(true);

  if (mode !== "guest" || !isVisible) {
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
    // Remember this choice in localStorage so banner doesn't show again today
    try {
      localStorage.setItem(
        "banner-dismissed",
        new Date().toISOString().split("T")[0]
      );
    } catch (error) {
      console.error("Failed to save banner state:", error);
    }
  };

  // Check if already dismissed today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastDismissed = localStorage.getItem("banner-dismissed");

    if (lastDismissed === today) {
      setIsVisible(false);
    }
  }, []);

  return (
    <div className='w-full bg-blue-50 border-t border-b border-blue-100 px-4 py-2'>
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        <div className='flex-1 text-sm text-blue-700'>
          Sign in to sync your notes and progress across devices
        </div>
        <div className='flex items-center space-x-2 ml-4'>
          <button
            onClick={handleLogin}
            disabled={isSyncing}
            className='text-xs font-medium px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-70'
          >
            {isSyncing ? "Syncing..." : "Sign in"}
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
