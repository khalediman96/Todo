// components/todo/TodoItem.tsx
'use client';

import React, { useState, memo, useCallback } from 'react';
import { 
  Check, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Repeat
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Todo } from '../../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  isKanbanMode?: boolean;
  loading?: boolean;
}

export const TodoItem = memo(function TodoItem({ 
  todo, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  isKanbanMode = false,
  loading = false 
}: TodoItemProps) {
  const [showActions, setShowActions] = useState(false);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }, []);

  const getPriorityText = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Unknown';
    }
  }, []);

  const getTagColor = useCallback((tag: string) => {
    const colors = [
      'tag-blue', 'tag-green', 'tag-purple', 'tag-pink', 
      'tag-yellow', 'tag-red', 'tag-indigo', 'tag-orange'
    ];
    const hash = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const isOverdue = todo.dueDate && (() => {
    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    return dueDateOnly < nowDate && !todo.completed;
  })();
  
  const isDueSoon = todo.dueDate && !todo.completed && !isOverdue && (() => {
    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    return timeDiff < 24 * 60 * 60 * 1000 && timeDiff > 0;
  })();

  const formatDueDate = useCallback((date: Date) => {
    const now = new Date();
    const dueDate = new Date(date);
    
    // Get dates without time for accurate day comparison
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    const diffTime = dueDateOnly.getTime() - nowDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays === -1) {
      return 'Due yesterday';
    } else if (diffDays > 1) {
      return `Due in ${diffDays} days`;
    } else {
      return `Overdue by ${Math.abs(diffDays)} days`;
    }
  }, []);

  return (
    <div 
      data-priority={todo.priority}
      className={`group card-modern p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        todo.completed ? 'opacity-75' : ''
      } ${
        isOverdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox - Hidden in kanban mode */}
        {!isKanbanMode && (
          <button
            onClick={() => onToggleComplete(todo._id!, !todo.completed)}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              todo.completed
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500'
            }`}
          >
            {todo.completed && <Check className="w-3 h-3" />}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${
                todo.completed 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {todo.title}
              </h3>
              
              {todo.description && (
                <p className={`mt-1 text-sm ${
                  todo.completed 
                    ? 'line-through text-gray-400 dark:text-gray-500' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {todo.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className={`flex items-center space-x-3 transition-opacity duration-200 ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(todo)}
                className="w-10 h-10 p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 bg-gray-100 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/20 rounded-lg shadow-sm transition-all duration-200"
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDelete(todo._id!)}
                className="w-10 h-10 p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20 rounded-lg shadow-sm transition-all duration-200"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Meta information */}
          <div className="flex items-center space-x-4 mt-3">
            {/* Priority */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(todo.priority)}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getPriorityText(todo.priority)}
              </span>
            </div>

            {/* Due date */}
            {todo.dueDate && (
              <div className={`flex items-center space-x-1 ${
                isOverdue 
                  ? 'text-red-600 dark:text-red-400' 
                  : isDueSoon 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-gray-500 dark:text-gray-400'
              }`}>
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span className="text-xs">
                  {formatDueDate(new Date(todo.dueDate))}
                </span>
              </div>
            )}

            {/* Created date */}
            <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              <span className="text-xs">
                {new Date(todo.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tags and Recurring Indicator */}
          {(todo.tags && todo.tags.length > 0) || todo.isRecurring ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Tags */}
              {todo.tags && todo.tags.length > 0 && (
                <div className="todo-tags">
                  {todo.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className={`todo-tag ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Recurring indicator */}
              {todo.isRecurring && (
                <div className="recurring-indicator">
                  <Repeat className="w-3 h-3" />
                  <span>Recurring</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});