import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-800'>
            Welcome to Pomodoro
          </h1>
          <p className='mt-2 text-gray-600'>
            Sign in to sync your progress across devices
          </p>
        </div>

        <Suspense
          fallback={
            <div className='text-center py-4'>Loading login options...</div>
          }
        >
          <LoginForm />
        </Suspense>

        <div className='pt-4 mt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-600 mb-3'>
            Don't want to sign in? No problem!
          </p>
          <div className='text-sm text-gray-500'>
            You can use Pomodoro as a guest and your data will be saved locally.
            <Link
              href='/'
              className='block mt-2 text-blue-600 hover:text-blue-800 font-medium'
            >
              Continue as Guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
