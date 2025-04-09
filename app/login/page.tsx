import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-800'>
            Welcome to Pomodoro
          </h1>
          <p className='mt-2 text-gray-600'>
            Sign in to track your progress and earn rewards
          </p>
        </div>
        
        <Suspense fallback={<div className="text-center py-4">Loading login options...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
} 