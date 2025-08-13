// components/todo/TodoForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ReactSelect } from '../ui/ReactSelect';
import { DateTimePicker } from '../ui/DateTimePicker';
import { Modal } from '../ui/Modal';
import { TagInput } from '../ui/TagInput';
import { RecurringConfigComponent } from '../ui/RecurringConfig';
import { Todo, CreateTodoInput, UpdateTodoInput, RecurringConfig } from '../../types/todo';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => Promise<void>;
  todo?: Todo | null;
  allTodos?: Todo[];
  loading?: boolean;
}

const priorityOptions = [
  { 
    value: 'low', 
    label: 'Low Priority',
    icon: <div className="w-2 h-2 rounded-full bg-green-500"></div>
  },
  { 
    value: 'medium', 
    label: 'Medium Priority',
    icon: <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
  },
  { 
    value: 'high', 
    label: 'High Priority',
    icon: <div className="w-2 h-2 rounded-full bg-red-500"></div>
  },
];

export function TodoForm({ isOpen, onClose, onSubmit, todo, allTodos = [], loading = false }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || 'medium' as 'low' | 'medium' | 'high',
    tags: todo?.tags || [],
    isRecurring: todo?.isRecurring || false,
    recurringConfig: todo?.recurringConfig || undefined,
    estimatedDuration: todo?.estimatedDuration || undefined,
    dueDate: todo?.dueDate ? (() => {
      const date = new Date(todo.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })() : '',
    dueTime: todo?.dueDate ? (() => {
      const date = new Date(todo.dueDate);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    })() : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  // Update form data when todo prop changes
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        priority: todo.priority || 'medium',
        tags: todo.tags || [],
        isRecurring: todo.isRecurring || false,
        recurringConfig: todo.recurringConfig || undefined,
        estimatedDuration: todo.estimatedDuration || undefined,
        dueDate: todo.dueDate ? (() => {
          const date = new Date(todo.dueDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })() : '',
        dueTime: todo.dueDate ? (() => {
          const date = new Date(todo.dueDate);
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        })() : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        tags: [],
        isRecurring: false,
        recurringConfig: undefined,
        estimatedDuration: undefined,
        dueDate: '',
        dueTime: '',
      });
    }
  }, [todo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Validate due date
    if (formData.dueDate) {
      const [year, month, day] = formData.dueDate.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      } else if (formData.dueTime && selectedDate.toDateString() === today.toDateString()) {
        // If due date is today, check if time is in the past
        const [hours, minutes] = formData.dueTime.split(':').map(Number);
        const now = new Date();
        const dueDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
        
        if (dueDateTime <= now) {
          newErrors.dueTime = 'Due time cannot be in the past';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        tags: formData.tags,
        isRecurring: formData.isRecurring,
        recurringConfig: formData.isRecurring ? formData.recurringConfig : undefined,
        estimatedDuration: formData.estimatedDuration,
        dueDate: formData.dueDate ? (() => {
          // Create date in local timezone to prevent date shifting
          const [year, month, day] = formData.dueDate.split('-').map(Number);
          const date = new Date(year, month - 1, day); // month is 0-indexed
          if (formData.dueTime) {
            const [hours, minutes] = formData.dueTime.split(':').map(Number);
            date.setHours(hours, minutes, 0, 0);
          } else {
            date.setHours(23, 59, 59, 999); // End of day if no time specified
          }
          return date;
        })() : undefined,
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error submitting todo:', error);
    }
  };

  const handleClose = () => {
    console.log('TodoForm handleClose called');
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      tags: [],
      isRecurring: false,
      recurringConfig: undefined,
      estimatedDuration: undefined,
      dueDate: '',
      dueTime: '',
    });
    setErrors({});
    setActiveTab('basic');
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleRecurringChange = (isRecurring: boolean, config?: RecurringConfig) => {
    setFormData(prev => ({ 
      ...prev, 
      isRecurring, 
      recurringConfig: config 
    }));
  };

  // Popular tag suggestions
  const tagSuggestions = [
    'work', 'personal', 'urgent', 'meeting', 'project', 'health', 
    'shopping', 'family', 'study', 'travel', 'fitness', 'finance'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={todo ? '✏️ Edit Todo' : '✨ Create New Todo'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="kanban-modal-form">
        {/* Compact layout with better space utilization */}
        <div className="space-y-4">
          {/* Title */}
          <div className="form-group">
            <Input
              label="📝 Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What needs to be done?"
              error={errors.title}
              required
              className='kanban-modal-input'
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="kanban-modal-label">
              📄 Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add a description (optional)..."
              rows={2}
              className="kanban-modal-textarea"
            />
            {errors.description && (
              <p className="kanban-modal-error">{errors.description}</p>
            )}
          </div>

          {/* Priority - Full width */}
          <div className="form-group">
            <label className="kanban-modal-label">
              ⚡ Priority
            </label>
            <div className="priority-select-wrapper">
              <ReactSelect
                value={formData.priority}
                onSelect={(value: string) => handleInputChange('priority', value)}
                options={priorityOptions}
                placeholder="Select priority level"
                className="priority-select-fixed"
              />
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="form-group">
            <label className="kanban-modal-label">
              📅 Due Date & Time
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm"
                    style={{
                      colorScheme: 'light dark',
                    }}
                    onClick={(e) => {
                      // Ensure the date picker opens on click
                      try {
                        e.currentTarget.showPicker?.();
                      } catch (error) {
                        // Fallback for browsers that don't support showPicker
                        console.log('showPicker not supported');
                      }
                    }}
                  />
                </div>
                {errors.dueDate && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.dueDate}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => handleInputChange('dueTime', e.target.value)}
                    disabled={!formData.dueDate}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm ${
                      !formData.dueDate ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{
                      colorScheme: 'light dark',
                    }}
                    onClick={(e) => {
                      // Ensure the time picker opens on click
                      if (!formData.dueDate) return;
                      try {
                        e.currentTarget.showPicker?.();
                      } catch (error) {
                        // Fallback for browsers that don't support showPicker
                        console.log('showPicker not supported');
                      }
                    }}
                  />
                </div>
                {errors.dueTime && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.dueTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Estimated Duration - Full width below date/time */}
          <div className="form-group">
            <Input
              label="⏱️ Estimated Duration (minutes)"
              type="number"
              value={formData.estimatedDuration?.toString() || ''}
              onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
              placeholder="How long will this take?"
              min="1"
              max="10080"
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="kanban-modal-label">
              🏷️ Tags
            </label>
            <TagInput
              tags={formData.tags}
              onChange={handleTagsChange}
              suggestions={tagSuggestions}
              placeholder="Add tags to organize your task..."
              maxTags={8}
            />
          </div>

          {/* Recurring Task */}
          <div className="form-group">
            <label className="kanban-modal-label">
              🔄 Recurring Task
            </label>
            <RecurringConfigComponent
              isRecurring={formData.isRecurring}
              config={formData.recurringConfig}
              onChange={handleRecurringChange}
            />
          </div>
        </div>

        <div className="kanban-modal-actions mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={false}
            className="kanban-modal-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="kanban-modal-submit-btn"
          >
            {loading ? '⏳ Saving...' : (todo ? '✅ Update Todo' : '🚀 Create Todo')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}