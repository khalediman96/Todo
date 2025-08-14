// app/login/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Chrome, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Use simple redirect-based sign-in
      await signIn('google', {
        callbackUrl: '/dashboard',
      });
    } catch (error) {
      console.error('Sign in error:', error);
      alert('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-purple-400/30 rotate-45 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-pink-400/30 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-cyan-400/30 rotate-12 animate-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="login-main-content">
        <div className="login-form-container animate-fade-in">
          {/* Logo and Title */}
          <div className="login-logo-section">
            <div className="login-logo animate-scale-in group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckSquare className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
            </div>
            <h1 className="login-title">
              TodoApp
            </h1>
            <p className="login-subtitle">
              Organize your life, beautifully
            </p>
          </div>

          {/* Main glassmorphism card */}
          <div className="login-card animate-slide-up">
            {/* Enhanced inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/5 via-purple-400/5 to-pink-400/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10 rounded-3xl"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce"></div>
            
            <div className="login-card-header">
              <h2 className="login-card-title">Welcome Back</h2>
              <p className="login-card-subtitle">Sign in to continue your journey</p>
            </div>
            
            {/* Sign In Button */}
            <div className="relative z-10">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="login-button"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 animate-pulse"></div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                ) : (
                  <Chrome className="w-5 h-5 relative z-10 drop-shadow-lg" />
                )}
                <span className="relative z-10">Sign in with Google</span>
              </button>
            </div>
          </div>

          {/* Demo Info */}
          <div className="login-credits animate-slide-up">
            <div className="login-credits-card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse shadow-lg"></div>
              <div className="login-credits-content">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="login-credits-text">Designed & Developed by Khaled Iman</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <div className="login-footer-content">
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>
          
          {/* Enhanced animated border effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse"></div>
          
          <p className="login-footer-text">&copy; 2025 TodoApp. Crafted with ❤️ by imangrphics</p>
        </div>
      </footer>
    </div>
  );
}