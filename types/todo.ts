// types/todo.ts
export type TodoStatus = 'new' | 'in-progress' | 'completed' | string;

export interface Todo {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  status: TodoStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  parentTodoId?: string;
  progress: number; // 0-100
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  customColumn?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface RecurringConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  nextDueDate?: Date;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status?: TodoStatus;
  dueDate?: Date;
  tags?: string[];
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
  estimatedDuration?: number;
  customColumn?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  status?: TodoStatus;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
  progress?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  customColumn?: string;
}

export interface TodoFilters {
  search?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  sortBy?: 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

// Export interfaces
export interface ExportFormat {
  format: 'csv' | 'json' | 'pdf';
  includeCompleted?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  columns?: string[];
}

export interface ExportData {
  todos: Todo[];
  stats: TodoStats;
  exportDate: Date;
  totalCount: number;
}

// Custom columns interface
export interface CustomColumn {
  id: string;
  name: string;
  color: string;
  description?: string;
  order: number;
  userId: string;
  isDefault: boolean;
  createdAt: Date;
}

// Email integration interfaces
export interface EmailTask {
  id: string;
  subject: string;
  sender: string;
  content: string;
  receivedAt: Date;
  attachments?: EmailAttachment[];
  priority?: 'low' | 'medium' | 'high';
  extractedDueDate?: Date;
  suggestedTags?: string[];
}

export interface EmailAttachment {
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface EmailParseResult {
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedPriority: 'low' | 'medium' | 'high';
  suggestedDueDate?: Date;
  suggestedTags: string[];
  confidence: number; // 0-1 score for parsing accuracy
}

export interface EmailImportOptions {
  includeOriginalEmail: boolean;
  autoSetPriority: boolean;
  autoExtractDueDate: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
  tagPrefix?: string;
}