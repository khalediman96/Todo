// lib/utils/recurringTasks.ts
import { RecurringConfig, Todo } from '../../types/todo';

export class RecurringTaskManager {
  /**
   * Calculate the next due date for a recurring task
   */
  static calculateNextDueDate(config: RecurringConfig, currentDueDate: Date): Date {
    const nextDate = new Date(currentDueDate);

    switch (config.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + config.interval);
        break;

      case 'weekly':
        if (config.daysOfWeek && config.daysOfWeek.length > 0) {
          // Find the next occurrence based on selected days
          const sortedDays = [...config.daysOfWeek].sort((a, b) => a - b);
          const currentDay = nextDate.getDay();
          
          let nextDay = sortedDays.find(day => day > currentDay);
          
          if (!nextDay) {
            // If no day found this week, go to first day of next week(s)
            nextDay = sortedDays[0];
            const daysToAdd = (7 - currentDay + nextDay) + (7 * (config.interval - 1));
            nextDate.setDate(nextDate.getDate() + daysToAdd);
          } else {
            nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
          }
        } else {
          // Default to same day next week(s)
          nextDate.setDate(nextDate.getDate() + (7 * config.interval));
        }
        break;

      case 'monthly':
        if (config.dayOfMonth) {
          nextDate.setMonth(nextDate.getMonth() + config.interval);
          nextDate.setDate(config.dayOfMonth);
          
          // Handle cases where the day doesn't exist in the target month
          if (nextDate.getDate() !== config.dayOfMonth) {
            nextDate.setDate(0); // Go to last day of previous month
          }
        } else {
          // Default to same day next month(s)
          nextDate.setMonth(nextDate.getMonth() + config.interval);
        }
        break;

      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + config.interval);
        break;

      default:
        throw new Error(`Unsupported recurring type: ${config.type}`);
    }

    return nextDate;
  }

  /**
   * Check if a recurring task should create a new instance
   */
  static shouldCreateNextInstance(config: RecurringConfig, currentDueDate: Date): boolean {
    if (!config.endDate) {
      return true;
    }

    const nextDueDate = this.calculateNextDueDate(config, currentDueDate);
    return nextDueDate <= config.endDate;
  }

  /**
   * Create the next instance of a recurring task
   */
  static createNextInstance(originalTodo: Todo): Partial<Todo> {
    if (!originalTodo.isRecurring || !originalTodo.recurringConfig || !originalTodo.dueDate) {
      throw new Error('Todo is not properly configured for recurring');
    }

    const nextDueDate = this.calculateNextDueDate(
      originalTodo.recurringConfig,
      new Date(originalTodo.dueDate)
    );

    return {
      title: originalTodo.title,
      description: originalTodo.description,
      priority: originalTodo.priority,
      tags: [...(originalTodo.tags || [])],
      isRecurring: true,
      recurringConfig: originalTodo.recurringConfig,
      parentTodoId: originalTodo._id,
      dueDate: nextDueDate,
      status: 'new',
      completed: false,
      userId: originalTodo.userId,
    };
  }

  /**
   * Get a human-readable description of the recurring pattern
   */
  static getRecurringDescription(config: RecurringConfig): string {
    const { type, interval, daysOfWeek, dayOfMonth, endDate } = config;

    let description = `Repeats every ${interval > 1 ? `${interval} ` : ''}`;

    switch (type) {
      case 'daily':
        description += interval === 1 ? 'day' : 'days';
        break;
      
      case 'weekly':
        description += interval === 1 ? 'week' : 'weeks';
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');
          description += ` on ${selectedDays}`;
        }
        break;
      
      case 'monthly':
        description += interval === 1 ? 'month' : 'months';
        if (dayOfMonth) {
          description += ` on day ${dayOfMonth}`;
        }
        break;
      
      case 'yearly':
        description += interval === 1 ? 'year' : 'years';
        break;
    }

    if (endDate) {
      description += ` until ${new Date(endDate).toLocaleDateString()}`;
    }

    return description;
  }

  /**
   * Validate recurring configuration
   */
  static validateRecurringConfig(config: RecurringConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(config.type)) {
      errors.push('Invalid recurring type');
    }

    if (config.interval < 1 || config.interval > 365) {
      errors.push('Interval must be between 1 and 365');
    }

    if (config.type === 'weekly') {
      if (config.daysOfWeek) {
        if (!Array.isArray(config.daysOfWeek) || config.daysOfWeek.length === 0) {
          errors.push('At least one day must be selected for weekly recurrence');
        }
        const invalidDays = config.daysOfWeek.filter(day => day < 0 || day > 6);
        if (invalidDays.length > 0) {
          errors.push('Invalid day of week values');
        }
      }
    }

    if (config.type === 'monthly' && config.dayOfMonth) {
      if (config.dayOfMonth < 1 || config.dayOfMonth > 31) {
        errors.push('Day of month must be between 1 and 31');
      }
    }

    if (config.endDate) {
      const endDate = new Date(config.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date');
      } else if (endDate < new Date()) {
        errors.push('End date cannot be in the past');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default RecurringTaskManager;
