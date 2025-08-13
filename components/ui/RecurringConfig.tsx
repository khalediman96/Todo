// components/ui/RecurringConfig.tsx
'use client';

import React from 'react';
import { Calendar, Repeat, Clock } from 'lucide-react';
import { ReactSelect } from './ReactSelect';
import { DateTimePicker } from './DateTimePicker';
import { RecurringConfig } from '../../types/todo';

interface RecurringConfigProps {
  isRecurring: boolean;
  config?: RecurringConfig;
  onChange: (isRecurring: boolean, config?: RecurringConfig) => void;
}

const repeatOptions = [
  { value: 'daily', label: 'Daily', icon: <Calendar className="w-4 h-4" /> },
  { value: 'weekly', label: 'Weekly', icon: <Calendar className="w-4 h-4" /> },
  { value: 'monthly', label: 'Monthly', icon: <Calendar className="w-4 h-4" /> },
  { value: 'yearly', label: 'Yearly', icon: <Calendar className="w-4 h-4" /> },
];

export function RecurringConfigComponent({ 
  isRecurring, 
  config, 
  onChange 
}: RecurringConfigProps) {
  const handleRecurringToggle = () => {
    if (!isRecurring) {
      // Enable recurring with default config
      const defaultConfig: RecurringConfig = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Monday
      };
      onChange(true, defaultConfig);
    } else {
      onChange(false, undefined);
    }
  };

  const updateConfig = (updates: Partial<RecurringConfig>) => {
    if (!config) return;
    const newConfig = { ...config, ...updates };
    onChange(isRecurring, newConfig);
  };

  const getDayName = (dayNum: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayNum];
  };

  const toggleDayOfWeek = (day: number) => {
    if (!config) return;
    const current = config.daysOfWeek || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    updateConfig({ daysOfWeek: updated });
  };

  return (
    <div className="recurring-config-container">
      {/* Toggle recurring */}
      <div className="recurring-toggle">
        <button
          type="button"
          onClick={handleRecurringToggle}
          className={`recurring-toggle-btn ${isRecurring ? 'active' : ''}`}
        >
          <Repeat className="w-4 h-4" />
          <span>Recurring Task</span>
          <div className={`toggle-switch ${isRecurring ? 'on' : 'off'}`}>
            <div className="toggle-handle" />
          </div>
        </button>
      </div>

      {/* Recurring configuration */}
      {isRecurring && config && (
        <div className="recurring-settings">
          {/* Repeat type */}
          <div className="form-group">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Repeat</label>
            <ReactSelect
              value={config.type}
              onSelect={(value: string) => updateConfig({ 
                type: value as RecurringConfig['type'],
                daysOfWeek: value === 'weekly' ? [1] : undefined,
                dayOfMonth: value === 'monthly' ? 1 : undefined
              })}
              options={repeatOptions}
              placeholder="Select repeat frequency"
            />
          </div>

          {/* Interval */}
          <div className="form-group">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Every</label>
            <div className="interval-group">
              <input
                type="number"
                min="1"
                max="365"
                value={config.interval}
                onChange={(e) => updateConfig({ interval: parseInt(e.target.value) })}
                className="interval-input"
              />
              <span className="interval-unit">
                {config.type === 'daily' && (config.interval === 1 ? 'day' : 'days')}
                {config.type === 'weekly' && (config.interval === 1 ? 'week' : 'weeks')}
                {config.type === 'monthly' && (config.interval === 1 ? 'month' : 'months')}
                {config.type === 'yearly' && (config.interval === 1 ? 'year' : 'years')}
              </span>
            </div>
          </div>

          {/* Days of week (for weekly) */}
          {config.type === 'weekly' && (
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Days of Week</label>
              <div className="days-selector">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayOfWeek(day)}
                    className={`day-btn ${config.daysOfWeek?.includes(day) ? 'selected' : ''}`}
                  >
                    {getDayName(day)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of month (for monthly) */}
          {config.type === 'monthly' && (
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={config.dayOfMonth || 1}
                onChange={(e) => updateConfig({ dayOfMonth: parseInt(e.target.value) })}
                className="day-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Preview */}
          <div className="recurring-preview">
            <Clock className="w-4 h-4" />
            <span>
              Repeats every {config.interval} {config.type.replace('ly', '')}
              {config.type === 'weekly' && config.daysOfWeek?.length && 
                ` on ${config.daysOfWeek.map(d => getDayName(d)).join(', ')}`
              }
              {config.type === 'monthly' && config.dayOfMonth &&
                ` on day ${config.dayOfMonth}`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
