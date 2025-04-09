"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSessionUser } from "@/hooks/useSessionUser";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [guestDataExists, setGuestDataExists] = useState(false);

  // Instead of direct dependency on useGuestSession, use our unified hook
  const { mode } = useSessionUser();

  // Check if the user is already authenticated
  useEffect(() => {
    if (mode === "authenticated") {
      router.push("/");
    }
  }, [mode, router]);

  // Check for local data that would be synced on login
  useEffect(() => {
    const checkLocalData = () => {
      try {
        // Look for any notes or streaks in localStorage
        const guestData = localStorage.getItem("pomodoro-guest-data");
        if (guestData) {
          const parsedData = JSON.parse(guestData);
          const hasNotes = parsedData.notes && parsedData.notes.length > 0;
          const hasStreaks =
            parsedData.streaks && parsedData.streaks.length > 0;
          setGuestDataExists(hasNotes || hasStreaks);
        }
      } catch (error) {
        console.error("Error checking local data:", error);
      }
    };

    checkLocalData();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className='p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg'>
          {error === "CredentialsSignin"
            ? "Invalid credentials"
            : "An error occurred during sign in"}
        </div>
      )}

      {guestDataExists && (
        <div className='p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg'>
          We found your existing timer data. Sign in to sync it to your account!
        </div>
      )}

      <div className='mt-8 space-y-6'>
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className='w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            "Signing in..."
          ) : (
            <>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                width='24'
                height='24'
                className='w-5 h-5'
              >
                <path
                  fill='#EA4335'
                  d='M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z'
                />
                <path
                  fill='#34A853'
                  d='M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z'
                />
                <path
                  fill='#4A90E2'
                  d='M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z'
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </>
  );
}
