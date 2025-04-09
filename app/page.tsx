"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Timer from "../components/Timer";
import NavBar from "../components/auth/NavBar";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isUnauthenticated = status === "unauthenticated";

  useEffect(() => {
    if (!isLoading && isUnauthenticated) {
      router.push("/login");
    }
  }, [isLoading, isUnauthenticated, router]);

  // Show loading state or redirect to login if not authenticated
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

  if (isUnauthenticated) {
    return null; // Will redirect in the useEffect
  }

  // Show the timer if authenticated
  return (
    <div className='flex flex-col min-h-screen'>
      <NavBar />
      <Timer />
    </div>
  );
}
