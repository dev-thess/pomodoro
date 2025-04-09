"use client";

import Timer from "../components/Timer";
import NavBar from "../components/auth/NavBar";
import { useSessionUser } from "@/hooks/useSessionUser";

export default function Home() {
  const { isLoading } = useSessionUser();

  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen'>
        <NavBar />
        <div className='flex items-center justify-center flex-grow'>
          <div className='text-xl text-gray-600'>Loading...</div>
        </div>
      </div>
    );
  }

  // Show the timer for both authenticated and guest users
  return (
    <div className='flex flex-col min-h-screen'>
      <NavBar />
      <Timer />
    </div>
  );
}
