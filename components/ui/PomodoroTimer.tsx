// components/ui/PomodoroTimer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Coffee, Target, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { usePomodoro } from '../../hooks/usePomodoro';
import { Todo } from '../../types/todo';

interface PomodoroTimerProps {
  availableTasks?: Todo[];
  onTaskComplete?: (taskId: string) => void;
}

export function PomodoroTimer({ availableTasks = [], onTaskComplete }: PomodoroTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  
  const {
    settings,
    currentSession,
    timeLeft,
    isRunning,
    stats,
    activeTaskId,
    startSession,
    pauseSession,
    resetSession,
    skipSession,
    updateSettings,
    setActiveTaskId,
    progress,
    formattedTime,
    todayFocusTime,
  } = usePomodoro();

  const getSessionIcon = () => {
    switch (currentSession.type) {
      case 'work':
        return <Target className="w-5 h-5" />;
      case 'short-break':
        return <Coffee className="w-5 h-5" />;
      case 'long-break':
        return <Coffee className="w-5 h-5" />;
    }
  };

  const getSessionTitle = () => {
    switch (currentSession.type) {
      case 'work':
        return 'Focus Time';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
    }
  };

  const getSessionColor = () => {
    switch (currentSession.type) {
      case 'work':
        return '#ef4444'; // Red for work
      case 'short-break':
        return '#10b981'; // Green for break
      case 'long-break':
        return '#3b82f6'; // Blue for long break
    }
  };

  const activeTask = availableTasks.find(task => task._id === activeTaskId);

  const handleStartWithTask = (taskId?: string) => {
    startSession(taskId);
    setShowTaskSelector(false);
  };

  const handleTaskComplete = () => {
    if (activeTaskId && onTaskComplete) {
      onTaskComplete(activeTaskId);
      setActiveTaskId(null);
    }
  };

  const incompleteTasks = availableTasks.filter(task => !task.completed);

  return (
    <>
      {/* Floating Focus Indicator */}
      {isRunning && (
        <div className="pomodoro-focus-mode">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>{getSessionTitle()}: {formattedTime}</span>
          {activeTask && currentSession.type === 'work' && (
            <span className="task-name">• {activeTask.title}</span>
          )}
        </div>
      )}

      {/* Pomodoro Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        className="pomodoro-trigger-btn"
      >
        <Clock className="w-4 h-4" />
        <span>Pomodoro</span>
        {isRunning && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1" />
        )}
      </Button>

      {/* Pomodoro Timer Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🍅 Pomodoro Timer"
        size="md"
      >
        <div className="pomodoro-container" data-session={currentSession.type}>
          {/* Current Session Info */}
          <div className="pomodoro-header">
            <div className="pomodoro-session-info">
              {getSessionIcon()}
              <div>
                <h3 className="pomodoro-session-title">{getSessionTitle()}</h3>
                {activeTask && currentSession.type === 'work' && (
                  <p className="pomodoro-session-subtitle">
                    Working on: {activeTask.title}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="sm"
              className="pomodoro-settings-btn"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Timer Display */}
          <div className="pomodoro-timer">
            <div className="pomodoro-progress-ring">
              <svg className="pomodoro-progress-svg" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="pomodoro-progress-background"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="pomodoro-progress-foreground"
                  style={{
                    stroke: getSessionColor(),
                    strokeDasharray: `${2 * Math.PI * 50}`,
                    strokeDashoffset: `${2 * Math.PI * 50 * (1 - progress / 100)}`,
                  }}
                />
              </svg>
              <div className="pomodoro-time-display">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Current Task Info */}
          {activeTask && currentSession.type === 'work' && (
            <div className="pomodoro-task-info">
              <div className="task-item">
                <div className="task-details">
                  <div className="task-title">{activeTask.title}</div>
                  <div className="task-meta">
                    <span>Priority: {activeTask.priority}</span>
                    <span>•</span>
                    <span>Progress: {activeTask.progress}%</span>
                    {activeTask.dueDate && (
                      <>
                        <span>•</span>
                        <span>Due: {new Date(activeTask.dueDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <Button
                    onClick={handleTaskComplete}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="pomodoro-controls">
            <Button
              onClick={resetSession}
              variant="ghost"
              size="sm"
              className="pomodoro-control-btn"
              disabled={isRunning}
              title="Reset Session"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            {!isRunning && currentSession.type === 'work' && !activeTaskId && incompleteTasks.length > 0 ? (
              <Button
                onClick={() => setShowTaskSelector(true)}
                variant="primary"
                size="lg"
                className="pomodoro-main-btn"
              >
                <Target className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                onClick={isRunning ? pauseSession : () => startSession(activeTaskId || undefined)}
                variant="primary"
                size="lg"
                className="pomodoro-main-btn"
              >
                {isRunning ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
            )}
            
            <Button
              onClick={skipSession}
              variant="ghost"
              size="sm"
              className="pomodoro-control-btn"
              disabled={!isRunning}
            >
              Skip
            </Button>
          </div>

          {/* Stats */}
          <div className="pomodoro-stats">
            <div className="pomodoro-stat">
              <div className="pomodoro-stat-number">{stats.totalWorkSessions}</div>
              <div className="pomodoro-stat-label">Work Sessions</div>
            </div>
            <div className="pomodoro-stat">
              <div className="pomodoro-stat-number">{todayFocusTime}m</div>
              <div className="pomodoro-stat-label">Focus Today</div>
            </div>
            <div className="pomodoro-stat">
              <div className="pomodoro-stat-number">{stats.completedSessions}</div>
              <div className="pomodoro-stat-label">Total Sessions</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Task Selector Modal */}
      <Modal
        isOpen={showTaskSelector}
        onClose={() => setShowTaskSelector(false)}
        title="🎯 Select a Task to Focus On"
        size="md"
      >
        <div className="pomodoro-task-selector-modal">
          <Button
            onClick={() => handleStartWithTask()}
            variant="secondary"
            className="task-selector-item"
          >
            <Clock className="w-4 h-4 mr-2" />
            <div>
              <div className="task-title">Start without a specific task</div>
              <div className="task-meta">General focus session</div>
            </div>
          </Button>
          
          {incompleteTasks.map((task) => (
            <Button
              key={task._id}
              onClick={() => handleStartWithTask(task._id)}
              variant="ghost"
              className="task-selector-item"
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="task-title">{task.title}</div>
                  <span className={`task-priority ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <div className="task-description">
                    {task.description.length > 100 
                      ? `${task.description.substring(0, 100)}...` 
                      : task.description
                    }
                  </div>
                )}
                
                <div className="task-meta">
                  <span>Progress: {task.progress}%</span>
                  {task.dueDate && (
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                  {task.estimatedDuration && (
                    <span>Est: {task.estimatedDuration}min</span>
                  )}
                </div>
              </div>
            </Button>
          ))}
          
          {incompleteTasks.length === 0 && (
            <div className="task-selector-empty-state">
              <div className="empty-icon">
                <Target className="w-12 h-12 mx-auto" />
              </div>
              <div className="empty-text">
                <p>No tasks available</p>
                <p>Create some tasks to use with Pomodoro!</p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="⚙️ Pomodoro Settings"
        size="md"
      >
        <div className="pomodoro-settings">
          <div className="pomodoro-setting-group">
            <label className="pomodoro-setting-label">
              Work Duration (minutes)
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) || 25 })}
                className="pomodoro-setting-input"
              />
            </label>
          </div>

          <div className="pomodoro-setting-group">
            <label className="pomodoro-setting-label">
              Short Break (minutes)
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
                className="pomodoro-setting-input"
              />
            </label>
          </div>

          <div className="pomodoro-setting-group">
            <label className="pomodoro-setting-label">
              Long Break (minutes)
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
                className="pomodoro-setting-input"
              />
            </label>
          </div>

          <div className="pomodoro-setting-group">
            <label className="pomodoro-setting-label">
              Sessions until Long Break
              <input
                type="number"
                min="2"
                max="10"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => updateSettings({ sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                className="pomodoro-setting-input"
              />
            </label>
          </div>

          <div className="pomodoro-setting-group">
            <label className="pomodoro-setting-checkbox">
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
              />
              Auto-start breaks
            </label>
          </div>

          <div className="pomodoro-setting-group">
            <label className="pomodoro-setting-checkbox">
              <input
                type="checkbox"
                checked={settings.autoStartWork}
                onChange={(e) => updateSettings({ autoStartWork: e.target.checked })}
              />
              Auto-start work sessions
            </label>
          </div>

          <div className="pomodoro-setting-group">
            <label className="pomodoro-setting-checkbox">
              <input
                type="checkbox"
                checked={settings.playAlarmSound}
                onChange={(e) => updateSettings({ playAlarmSound: e.target.checked })}
              />
              Play alarm sound
            </label>
          </div>

          <div className="pomodoro-settings-actions">
            <Button
              onClick={() => setShowSettings(false)}
              variant="primary"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
