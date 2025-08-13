// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../providers/AuthProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { ToastProvider } from '../providers/ToastProvider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TodoApp - Modern Task Management',
  description: 'A modern, feature-rich todo application built with Next.js 15, TypeScript, and Tailwind CSS',
  keywords: ['todo', 'task management', 'productivity', 'nextjs', 'react'],
  authors: [{ name: 'TodoApp Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}