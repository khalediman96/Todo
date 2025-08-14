// lib/models/Todo.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description?: string;
  completed: boolean;
  status: 'new' | 'in-progress' | 'completed' | string; // Allow custom columns
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  userId: string;
  tags: string[];
  isRecurring: boolean;
  recurringConfig?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // every X days/weeks/months/years
    daysOfWeek?: number[]; // for weekly: 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number; // for monthly
    endDate?: Date;
    nextDueDate?: Date;
  };
  parentTodoId?: string; // for recurring task instances
  progress: number; // 0-100
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  customColumn?: string; // For custom workflow stages
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters'],
    minlength: [1, 'Title cannot be empty']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'new',
    validate: {
      validator: function(v: string) {
        return ['new', 'in-progress', 'completed'].includes(v) || typeof v === 'string';
      },
      message: 'Status must be new, in-progress, completed, or a custom string'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  tags: {
    type: [String],
    default: [],
    index: true,
    validate: {
      validator: function(v: string[]) {
        return Array.isArray(v) && v.every(tag => typeof tag === 'string');
      },
      message: 'Tags must be an array of strings'
    }
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringConfig: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
    daysOfWeek: [Number], // 0-6, Sunday = 0
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    endDate: Date,
    nextDueDate: Date,
  },
  parentTodoId: {
    type: String,
    index: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: 0,
  },
  actualDuration: {
    type: Number, // in minutes
    min: 0,
  },
  customColumn: {
    type: String,
    index: true,
  },
}, {
  timestamps: true,
});

TodoSchema.index({ userId: 1, createdAt: -1 });
TodoSchema.index({ userId: 1, completed: 1 });
TodoSchema.index({ userId: 1, priority: 1 });
TodoSchema.index({ userId: 1, tags: 1 });
TodoSchema.index({ userId: 1, isRecurring: 1 });
TodoSchema.index({ parentTodoId: 1 });
TodoSchema.index({ userId: 1, status: 1 });
TodoSchema.index({ userId: 1, customColumn: 1 });

export const Todo = mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);