"use client";

import Timer from "../components/Timer";
import Todo from "../components/Todo";
import NavBar from "../components/auth/NavBar";
import { useSessionUser } from "@/hooks/useSessionUser";

export default function Home() {
  const { isLoading, mode } = useSessionUser();

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

  const isAuthenticated = mode === "authenticated";

  // Show the timer and todo list if authenticated, otherwise just the timer
  return (
    <div className='flex flex-col min-h-screen'>
      <NavBar />
      <div className='flex flex-col md:flex-row w-full'>
        <div className={isAuthenticated ? "md:w-2/3" : "w-full"}>
          <Timer />
        </div>
        {isAuthenticated && (
          <div className='md:w-1/3 p-6 flex justify-center'>
            <Todo />
          </div>
        )}
      </div>
    </div>
  );
}
