"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GuestBanner } from "./GuestBanner";
import { useGuestSession } from "@/hooks/useGuestSession";

export default function NavBar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const { isGuest, syncGuestData, isSyncing } = useGuestSession();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  // Handle syncing guest data after login
  useEffect(() => {
    const handleDataSync = async () => {
      if (isAuthenticated && !syncAttempted && !isSyncing) {
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
  }, [isAuthenticated, syncAttempted, syncGuestData, isSyncing]);

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleLogoutClick = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <Link href='/' className='flex-shrink-0 flex items-center'>
                <span className='text-xl font-bold text-red-500'>Pomodoro</span>
              </Link>
            </div>
            <div className='flex items-center'>
              {syncStatus === "syncing" && (
                <span className='text-xs text-gray-500 mr-4'>
                  Syncing your data...
                </span>
              )}
              {syncStatus === "success" && (
                <span className='text-xs text-green-600 mr-4'>
                  Data synced successfully!
                </span>
              )}
              {isAuthenticated ? (
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center space-x-2'>
                    {session?.user?.image && (
                      <div className='w-8 h-8 rounded-full overflow-hidden'>
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={32}
                          height={32}
                        />
                      </div>
                    )}
                    <span className='text-sm font-medium text-gray-700 hidden sm:inline'>
                      {session?.user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-500 transition-colors'
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className='px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors'
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {isGuest && <GuestBanner />}
    </>
  );
}
