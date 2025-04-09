"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useGuestSession } from "./useGuestSession";

export type UserMode = "guest" | "authenticated" | "loading";

export interface SessionUserState {
  mode: UserMode;
  isLoading: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  isSyncing: boolean;
  syncStatus: "idle" | "syncing" | "success" | "error";
  hasSyncedData: boolean;
}

/**
 * A unified hook to handle user session state across guest and authenticated sessions
 */
export function useSessionUser() {
  const { data: authSession, status: authStatus } = useSession();
  const { isGuest, isSyncing, hasSyncedData, syncGuestData } =
    useGuestSession();

  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Determine current user mode
  let mode: UserMode = "loading";
  if (authStatus === "authenticated") {
    mode = "authenticated";
  } else if (authStatus === "unauthenticated") {
    mode = "guest";
  }

  // Handle data syncing for newly authenticated users
  useEffect(() => {
    const handleDataSync = async () => {
      // Only sync if user just authenticated and hasn't attempted a sync yet
      if (mode === "authenticated" && !syncAttempted && !isSyncing) {
        setSyncAttempted(true);
        setSyncStatus("syncing");
        try {
          const syncResult = await syncGuestData();
          setSyncStatus(syncResult ? "success" : "error");
        } catch (error) {
          console.error("Error syncing data:", error);
          setSyncStatus("error");
        }
      }
    };

    handleDataSync();
  }, [mode, syncAttempted, syncGuestData, isSyncing]);

  // Create a unified user state object
  const state: SessionUserState = {
    mode,
    isLoading: authStatus === "loading",
    userId: authSession?.user?.id || null,
    userName: authSession?.user?.name || null,
    userEmail: authSession?.user?.email || null,
    userImage: authSession?.user?.image || null,
    isSyncing,
    syncStatus,
    hasSyncedData,
  };

  return state;
}
