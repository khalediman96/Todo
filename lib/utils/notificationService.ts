// lib/utils/notificationService.ts
'use client';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: true
  };
  private isUserEnabled: boolean = true; // User preference to enable/disable notifications

  private constructor() {
    this.checkPermission();
    this.loadUserPreference();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission(): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = Notification.permission;
      this.permission = {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
      };
    }
  }

  private loadUserPreference(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notifications-enabled');
      this.isUserEnabled = stored !== null ? stored === 'true' : true;
    }
  }

  private saveUserPreference(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications-enabled', this.isUserEnabled.toString());
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission.granted) {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
      };
      
      return this.permission.granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public showNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.permission.granted || !this.isUserEnabled || typeof window === 'undefined') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'todo-reminder',
        requireInteraction: true,
        dir: 'ltr',
        lang: 'en',
        silent: false,
        ...options
      });

      // Auto close after 15 seconds for 5-minute reminders, 10 seconds for others
      const autoCloseTime = options?.body?.includes('5 minutes') ? 15000 : 10000;
      setTimeout(() => {
        notification.close();
      }, autoCloseTime);

      // Add click handler to focus the tab
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  public scheduleReminder(
    todoTitle: string, 
    dueDate: Date, 
    reminderMinutes: number = 15
  ): number | null {
    const now = new Date();
    const reminderTime = new Date(dueDate.getTime() - (reminderMinutes * 60 * 1000));
    
    // Don't schedule if reminder time is in the past
    if (reminderTime <= now) {
      return null;
    }

    const delay = reminderTime.getTime() - now.getTime();
    
    const timeoutId = window.setTimeout(() => {
      // Special handling for 5-minute reminder
      if (reminderMinutes === 5) {
        this.showNotification(`🚨 URGENT: Task Due Soon!`, {
          body: `"${todoTitle}" is due in 5 minutes!\n⏰ Don't forget to complete it!`,
          icon: '/favicon.ico',
          tag: `todo-urgent-${todoTitle}`,
          requireInteraction: true,
          silent: false
        });
      } else {
        this.showNotification(`📝 Todo Reminder: ${todoTitle}`, {
          body: `Your todo "${todoTitle}" is due in ${reminderMinutes} minutes!`,
          icon: '/favicon.ico',
          tag: `todo-${reminderMinutes}min-${todoTitle}`,
          requireInteraction: reminderMinutes <= 10
        });
      }
    }, delay);

    return timeoutId;
  }

  public scheduleMultipleReminders(
    todoTitle: string, 
    dueDate: Date
  ): number[] {
    const timeoutIds: number[] = [];
    
    // Schedule reminders at different intervals
    const reminderIntervals = [60, 30, 15, 5]; // minutes before due
    
    reminderIntervals.forEach(minutes => {
      const timeoutId = this.scheduleReminder(todoTitle, dueDate, minutes);
      if (timeoutId) {
        timeoutIds.push(timeoutId);
      }
    });

    return timeoutIds;
  }

  public cancelReminder(timeoutId: number): void {
    if (typeof window !== 'undefined') {
      window.clearTimeout(timeoutId);
    }
  }

  public cancelMultipleReminders(timeoutIds: number[]): void {
    timeoutIds.forEach(id => this.cancelReminder(id));
  }

  public getPermissionStatus(): NotificationPermission {
    return { ...this.permission };
  }

  public isNotificationsEnabled(): boolean {
    return this.permission.granted && this.isUserEnabled;
  }

  public enableNotifications(): void {
    this.isUserEnabled = true;
    this.saveUserPreference();
  }

  public disableNotifications(): void {
    this.isUserEnabled = false;
    this.saveUserPreference();
  }

  public getUserPreference(): boolean {
    return this.isUserEnabled;
  }

  // Check for tasks due within 5 minutes and show immediate notification
  public checkImminentTasks(todos: any[]): void {
    if (!this.permission.granted || !this.isUserEnabled || typeof window === 'undefined') {
      return;
    }

    const now = new Date();
    
    todos.forEach(todo => {
      if (!todo.dueDate || todo.completed || todo.status === 'completed') {
        return;
      }

      const dueDate = new Date(todo.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const minutesUntilDue = Math.floor(timeDiff / (1000 * 60));

      // Show notification for tasks due within 5 minutes
      if (minutesUntilDue <= 5 && minutesUntilDue > 0) {
        this.showNotification(`🚨 URGENT: Task Due in ${minutesUntilDue} min!`, {
          body: `"${todo.title}" is due in ${minutesUntilDue} minute${minutesUntilDue !== 1 ? 's' : ''}!\n⏰ Complete it now!`,
          icon: '/favicon.ico',
          tag: `todo-imminent-${todo._id}`,
          requireInteraction: true,
          silent: false
        });
      }
      // Show notification for overdue tasks
      else if (minutesUntilDue <= 0) {
        const overdueMinutes = Math.abs(minutesUntilDue);
        this.showNotification(`⚠️ OVERDUE TASK!`, {
          body: `"${todo.title}" was due ${overdueMinutes} minute${overdueMinutes !== 1 ? 's' : ''} ago!\n🔥 Please complete immediately!`,
          icon: '/favicon.ico',
          tag: `todo-overdue-${todo._id}`,
          requireInteraction: true,
          silent: false
        });
      }
    });
  }
}

export const notificationService = NotificationService.getInstance();
