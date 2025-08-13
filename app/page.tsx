// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        
      </div>
    </div>
  );
}