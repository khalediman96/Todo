// hooks/useNotifications.ts
'use client';

import { useEffect, useCallback } from 'react';
import { notificationService } from '../lib/utils/notificationService';
import { useToast } from '../providers/ToastProvider';
import { Todo } from '../types/todo';

export function useNotifications() {
  const { showToast } = useToast();

  const requestPermission = useCallback(async () => {
    const hasPermission = await notificationService.requestPermission();
    
    if (hasPermission) {
      showToast({
        title: 'Notifications Enabled',
        message: 'You will receive reminders for your todos',
        type: 'success'
      });
    } else {
      showToast({
        title: 'Notifications Disabled',
        message: 'You can enable them in your browser settings',
        type: 'warning'
      });
    }
    
    return hasPermission;
  }, [showToast]);

  const getPermissionStatus = useCallback(() => {
    return notificationService.getPermissionStatus();
  }, []);

  const toggleNotifications = useCallback(async () => {
    const currentPermission = notificationService.getPermissionStatus();
    const isEnabled = notificationService.isNotificationsEnabled();
    
    if (currentPermission.granted && isEnabled) {
      // Disable notifications (user preference)
      notificationService.disableNotifications();
      showToast({
        title: 'Notifications Disabled',
        message: 'You will no longer receive todo reminders',
        type: 'info'
      });
      return false;
    } else if (currentPermission.granted && !isEnabled) {
      // Enable notifications (user already granted browser permission)
      notificationService.enableNotifications();
      showToast({
        title: 'Notifications Enabled',
        message: 'You will receive reminders for your todos',
        type: 'success'
      });
      return true;
    } else if (currentPermission.denied) {
      // Browser permission denied, show instructions
      showToast({
        title: 'Notifications Blocked',
        message: 'Please enable notifications in your browser settings and refresh the page',
        type: 'warning',
        duration: 8000
      });
      return false;
    } else {
      // Request browser permission
      const granted = await requestPermission();
      if (granted) {
        notificationService.enableNotifications();
      }
      return granted;
    }
  }, [requestPermission, showToast]);

  const scheduleReminderForTodo = useCallback((todo: Todo) => {
    if (!todo.dueDate) return [];
    
    const dueDate = new Date(todo.dueDate);
    const now = new Date();
    
    // Don't schedule reminders for overdue or completed todos
    if (dueDate <= now || todo.completed || todo.status === 'completed') {
      return [];
    }

    // Schedule multiple browser notifications
    const timeoutIds = notificationService.scheduleMultipleReminders(
      todo.title,
      dueDate
    );

    // Schedule toast notifications for immediate reminders
    const timeDiff = dueDate.getTime() - now.getTime();
    const minutesUntilDue = Math.floor(timeDiff / (1000 * 60));

    // Schedule 5-minute toast reminder if due in more than 5 minutes
    if (minutesUntilDue > 5) {
      const fiveMinuteDelay = (minutesUntilDue - 5) * 60 * 1000;
      const fiveMinTimeoutId = window.setTimeout(() => {
        showToast({
          title: '⏰ 5-Minute Reminder',
          message: `"${todo.title}" is due in 5 minutes!`,
          type: 'warning',
          duration: 10000
        });
      }, fiveMinuteDelay);
      timeoutIds.push(fiveMinTimeoutId);
    }

    // Schedule 1-minute toast reminder if due in more than 1 minute
    if (minutesUntilDue > 1) {
      const oneMinuteDelay = (minutesUntilDue - 1) * 60 * 1000;
      const oneMinTimeoutId = window.setTimeout(() => {
        showToast({
          title: '🚨 1-Minute Warning',
          message: `"${todo.title}" is due in 1 minute!`,
          type: 'error',
          duration: 15000
        });
      }, oneMinuteDelay);
      timeoutIds.push(oneMinTimeoutId);
    }

    // Show immediate notification for tasks due soon
    if (minutesUntilDue <= 10 && minutesUntilDue > 0) {
      showToast({
        title: '⏰ Task Due Soon',
        message: `"${todo.title}" is due in ${minutesUntilDue} minutes`,
        type: 'warning',
        duration: 8000
      });
    }

    return timeoutIds;
  }, [showToast]);

  const scheduleRemindersForTodos = useCallback((todos: Todo[]) => {
    const allTimeoutIds: number[] = [];
    
    todos.forEach(todo => {
      const timeoutIds = scheduleReminderForTodo(todo);
      allTimeoutIds.push(...timeoutIds);
    });

    return allTimeoutIds;
  }, [scheduleReminderForTodo]);

  const cancelReminders = useCallback((timeoutIds: number[]) => {
    notificationService.cancelMultipleReminders(timeoutIds);
  }, []);

  // Check for permissions on mount
  useEffect(() => {
    const permission = notificationService.getPermissionStatus();
    
    if (permission.default) {
      // Show a prompt to enable notifications
      showToast({
        title: 'Enable Notifications',
        message: 'Get reminders for your upcoming todos',
        type: 'warning',
        duration: 10000
      });
    }
  }, [showToast]);

  const getNotificationStatus = useCallback(() => {
    return notificationService.isNotificationsEnabled();
  }, []);

  const checkImminentTasks = useCallback((todos: Todo[]) => {
    notificationService.checkImminentTasks(todos);
  }, []);

  return {
    requestPermission,
    getPermissionStatus,
    getNotificationStatus,
    toggleNotifications,
    scheduleReminderForTodo,
    scheduleRemindersForTodos,
    cancelReminders,
    checkImminentTasks,
    notificationService
  };
}
