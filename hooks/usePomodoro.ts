// hooks/usePomodoro.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../providers/ToastProvider';

export interface PomodoroSession {
  type: 'work' | 'short-break' | 'long-break';
  duration: number; // in seconds
  completed: boolean;
  taskId?: string; // Associated task
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  playAlarmSound: boolean;
}

export interface PomodoroStats {
  completedSessions: number;
  totalWorkSessions: number;
  focusTimeToday: number; // in minutes
  tasksCompleted: number;
  lastSessionDate: string;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  playAlarmSound: true,
};

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [currentSession, setCurrentSession] = useState<PomodoroSession>({
    type: 'work',
    duration: DEFAULT_SETTINGS.workDuration * 60,
    completed: false,
  });
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<PomodoroStats>({
    completedSessions: 0,
    totalWorkSessions: 0,
    focusTimeToday: 0,
    tasksCompleted: 0,
    lastSessionDate: new Date().toDateString(),
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  // Load settings and stats from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('pomodoroSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setCurrentSession({
          type: 'work',
          duration: parsed.workDuration * 60,
          completed: false,
        });
        setTimeLeft(parsed.workDuration * 60);
      }

      const savedStats = localStorage.getItem('pomodoroStats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        const today = new Date().toDateString();
        
        // Reset daily stats if it's a new day
        if (parsedStats.lastSessionDate !== today) {
          setStats({
            ...parsedStats,
            focusTimeToday: 0,
            tasksCompleted: 0,
            lastSessionDate: today,
          });
        } else {
          setStats(parsedStats);
        }
      }
    }
  }, []);

  // Save settings and stats to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
      localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }
  }, [settings, stats]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    
    if (settings.playAlarmSound) {
      // Play notification sound
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(() => {}); // Ignore if audio file doesn't exist
      } catch (error) {
        console.log('Audio playback not available');
      }
    }

    const today = new Date().toDateString();
    setStats(prevStats => {
      const newStats = { ...prevStats };
      newStats.completedSessions += 1;
      newStats.lastSessionDate = today;

      if (currentSession.type === 'work') {
        newStats.totalWorkSessions += 1;
        newStats.focusTimeToday += settings.workDuration;
        
        // Schedule toast for next tick to avoid render cycle issues
        setTimeout(() => {
          showToast({
            title: '🍅 Work Session Complete!',
            message: activeTaskId 
              ? 'Great job! Time for a break. Keep your momentum going!' 
              : 'Well done! Consider selecting a task for your next session.',
            type: 'success',
          });
        }, 0);

        // Determine next session type
        const isLongBreak = newStats.totalWorkSessions % settings.sessionsUntilLongBreak === 0;
        const nextSession: PomodoroSession = {
          type: isLongBreak ? 'long-break' : 'short-break',
          duration: isLongBreak ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60,
          completed: false,
        };
        
        setCurrentSession(nextSession);
        setTimeLeft(nextSession.duration);

        if (settings.autoStartBreaks) {
          setIsRunning(true);
        }
      } else {
        // Schedule toast for next tick to avoid render cycle issues
        setTimeout(() => {
          showToast({
            title: '☕ Break Complete!',
            message: 'Ready to get back to work? Select a task to focus on.',
            type: 'success',
          });
        }, 0);

        const nextSession: PomodoroSession = {
          type: 'work',
          duration: settings.workDuration * 60,
          completed: false,
          taskId: activeTaskId || undefined,
        };
        
        setCurrentSession(nextSession);
        setTimeLeft(nextSession.duration);

        if (settings.autoStartWork) {
          setIsRunning(true);
        }
      }

      return newStats;
    });
  }, [settings, currentSession.type, activeTaskId, showToast]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Use setTimeout to defer the session complete handling
            setTimeout(() => handleSessionComplete(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleSessionComplete]);

  const startSession = (taskId?: string) => {
    setActiveTaskId(taskId || null);
    if (taskId && currentSession.type === 'work') {
      setCurrentSession(prev => ({ ...prev, taskId }));
    }
    setIsRunning(true);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resetSession = () => {
    setIsRunning(false);
    setTimeLeft(currentSession.duration);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Update current session duration if it's a work session and work duration changed
    if (currentSession.type === 'work' && newSettings.workDuration) {
      const newSession = {
        ...currentSession,
        duration: newSettings.workDuration * 60,
      };
      setCurrentSession(newSession);
      setTimeLeft(newSettings.workDuration * 60);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((currentSession.duration - timeLeft) / currentSession.duration) * 100;
  };

  const getTodayFocusTime = () => {
    const today = new Date().toDateString();
    if (stats.lastSessionDate === today) {
      return stats.focusTimeToday;
    }
    return 0;
  };

  const resetDailyStats = () => {
    const today = new Date().toDateString();
    setStats(prev => ({
      ...prev,
      focusTimeToday: 0,
      tasksCompleted: 0,
      lastSessionDate: today,
    }));
  };

  return {
    // State
    settings,
    currentSession,
    timeLeft,
    isRunning,
    stats,
    activeTaskId,
    
    // Actions
    startSession,
    pauseSession,
    resetSession,
    skipSession,
    updateSettings,
    setActiveTaskId,
    resetDailyStats,
    
    // Computed values
    progress: getProgress(),
    formattedTime: formatTime(timeLeft),
    todayFocusTime: getTodayFocusTime(),
  };
}
