// providers/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: any;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
}