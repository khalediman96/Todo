// components/ui/DateTimePicker.tsx
'use client';

import React from 'react';

interface DateTimePickerProps {
  dateLabel?: string;
  timeLabel?: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateError?: string;
  timeError?: string;
  timeDisabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  dateLabel = 'Due Date',
  timeLabel = 'Due Time',
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  timeDisabled = false,
  className = '',
}: DateTimePickerProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Date Input */}
      <div className="space-y-1">
        {dateLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {dateLabel}
          </label>
        )}
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm ${
            dateError ? 'border-red-500 focus:ring-red-500' : ''
          }`}
        />
        {dateError && (
          <p className="text-sm text-red-600 dark:text-red-400">{dateError}</p>
        )}
      </div>

      {/* Time Input */}
      <div className="space-y-1">
        {timeLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {timeLabel}
          </label>
        )}
        <input
          type="time"
          value={timeValue}
          onChange={(e) => onTimeChange(e.target.value)}
          disabled={timeDisabled}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
            timeError ? 'border-red-500 focus:ring-red-500' : ''
          } ${
            timeDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        />
        {timeError && (
          <p className="text-sm text-red-600 dark:text-red-400">{timeError}</p>
        )}
      </div>
    </div>
  );
}
