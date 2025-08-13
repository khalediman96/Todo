// components/ui/ThemeToggle.tsx
'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import { Button } from './Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      className="w-12 h-12 p-3 rounded-xl bg-white/80 hover:bg-white/90 dark:bg-gray-900/80 dark:hover:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
      )}
    </Button>
  );
}