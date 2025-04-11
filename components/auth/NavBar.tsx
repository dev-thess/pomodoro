"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuestBanner } from "./GuestBanner";
import { useSessionUser } from "@/hooks/useSessionUser";
import { Avatar } from "@/components/ui/Avatar";

export default function NavBar() {
  const router = useRouter();
  const { mode, userName, userImage, syncStatus } = useSessionUser();

  const isAuthenticated = mode === "authenticated";

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
                    <Avatar src={userImage} name={userName} size={32} />
                    <span className='text-sm font-medium text-gray-700 hidden sm:inline'>
                      {userName}
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
      {mode === "guest" && <GuestBanner />}
    </>
  );
}
