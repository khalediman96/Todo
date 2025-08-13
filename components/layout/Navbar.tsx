// components/layout/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  CheckSquare, 
  BarChart3, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X,
  Mail
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({ onMenuToggle, isMobileMenuOpen = false }: NavbarProps) {
  const { data: session } = useSession();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: CheckSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Email Demo', href: '/email-demo', icon: Mail },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden mr-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Khaludi
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8 lg:ml-10">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {session?.user && (
              <div className="flex items-center space-x-3">
                {/* User info */}
                <div className="hidden md:flex md:items-center md:space-x-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.user.name}
                    </p>
                    {/* <p className="text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </p> */}
                  </div>
                </div>

                {/* Sign out button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700"
                onClick={onMenuToggle}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {session?.user && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}