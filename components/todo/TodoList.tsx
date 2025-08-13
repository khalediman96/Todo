// components/todo/TodoList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ListTodo, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { SearchBar } from './SearchBar';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters } from '../../types/todo';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../providers/ToastProvider';

interface TodoListProps {
  initialTodos?: Todo[];
}

export function TodoList({ initialTodos = [] }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>(initialTodos);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<TodoFilters>({});
  const { scheduleReminderForTodo, scheduleRemindersForTodos } = useNotifications();
  const { showToast } = useToast();


  // Convert SearchFilters from SearchBar to TodoFilters
  const handleFilterChange = (searchFilters: any) => {
    const todoFilters: TodoFilters = {
      ...searchFilters,
      completed:
        searchFilters.completed === ''
          ? undefined
          : typeof searchFilters.completed === 'string'
            ? searchFilters.completed === 'true'
            : searchFilters.completed,
    };
    setFilters(todoFilters);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [todos, searchValue, filters]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
        
        // Schedule reminders for all todos with due dates
        scheduleRemindersForTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...todos];

    // Search filter
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(search) ||
        (todo.description && todo.description.toLowerCase().includes(search))
      );
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    // Completion filter
    if (filters.completed !== undefined) {
      filtered = filtered.filter(todo => todo.completed === filters.completed);
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Todo];
      let bValue: any = b[sortBy as keyof Todo];

      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
      } else if (sortBy === 'dueDate') {
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      } else {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredTodos(filtered);
  };

  const handleCreateTodo = async (data: CreateTodoInput) => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos(prev => [newTodo, ...prev]);
        setIsFormOpen(false);
        
        // Schedule reminders for the new todo
        if (newTodo.dueDate) {
          scheduleReminderForTodo(newTodo);
        }
        
        // Show success toast
        showToast({
          title: 'Todo Created',
          message: `"${newTodo.title}" has been added to your list`,
          type: 'success'
        });
      } else {
        throw new Error('Failed to create todo');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      showToast({
        title: 'Error',
        message: 'Failed to create todo. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodo = async (data: UpdateTodoInput) => {
    if (!editingTodo) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/todos/${editingTodo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prev => prev.map(todo => 
          todo._id === editingTodo._id ? updatedTodo : todo
        ));
        setEditingTodo(null);
        
        // Schedule reminders for the updated todo
        if (updatedTodo.dueDate) {
          scheduleReminderForTodo(updatedTodo);
        }
        
        // Show success toast
        showToast({
          title: 'Todo Updated',
          message: `"${updatedTodo.title}" has been updated`,
          type: 'success'
        });
      } else {
        throw new Error('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      showToast({
        title: 'Error',
        message: 'Failed to update todo. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prev => prev.map(todo => 
          todo._id === id ? updatedTodo : todo
        ));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      console.log('Attempting to delete todo:', id);
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      console.log('Delete response:', response.status, response.statusText);

      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo._id !== id));
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert(`Failed to delete todo: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Todos
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="rounded-md">
          <Plus className="w-4 h-4 mr-2" /> Add Todo
        </Button>
      </div>

      {/* Search and Filters */}
      <SearchBar
        value={searchValue}
        onSearch={setSearchValue}
        onFilterChange={handleFilterChange}
      />

      {/* Stats */}
      {totalCount > 0 && (
        <div className="dashboard-stats-container">
          <div className="dashboard-stat-card dashboard-stat-card--total">
            <div className="dashboard-stat-icon-container">
              <div className="dashboard-stat-icon dashboard-stat-icon--total">
                <ListTodo className="dashboard-stat-icon-svg" />
              </div>
              <span className="dashboard-stat-label dashboard-stat-label--total">
                Total Tasks
              </span>
            </div>
            <p className="dashboard-stat-number dashboard-stat-number--total">
              {totalCount}
            </p>
          </div>

          <div className="dashboard-stat-card dashboard-stat-card--completed">
            <div className="dashboard-stat-icon-container">
              <div className="dashboard-stat-icon dashboard-stat-icon--completed">
                <CheckCircle2 className="dashboard-stat-icon-svg" />
              </div>
              <span className="dashboard-stat-label dashboard-stat-label--completed">
                Completed
              </span>
            </div>
            <p className="dashboard-stat-number dashboard-stat-number--completed">
              {completedCount}
            </p>
          </div>

          <div className="dashboard-stat-card dashboard-stat-card--pending">
            <div className="dashboard-stat-icon-container">
              <div className="dashboard-stat-icon dashboard-stat-icon--pending">
                <ListTodo className="dashboard-stat-icon-svg" />
              </div>
              <span className="dashboard-stat-label dashboard-stat-label--pending">
                Pending
              </span>
            </div>
            <p className="dashboard-stat-number dashboard-stat-number--pending">
              {totalCount - completedCount}
            </p>
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {loading && filteredTodos.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading todos...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchValue || Object.values(filters).some(f => f) ? 'No todos match your filters' : 'No todos yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchValue || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first todo item.'
              }
            </p>
            {!searchValue && !Object.values(filters).some(f => f) && (
              <Button onClick={() => setIsFormOpen(true)}>
                Create your first todo
              </Button>
            )}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
            />
          ))
        )}
      </div>

      {/* Todo Form Modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={async (data) => {
          if (editingTodo) {
            await handleUpdateTodo(data as UpdateTodoInput);
          } else {
            await handleCreateTodo(data as CreateTodoInput);
          }
        }}
        todo={editingTodo}
        loading={loading}
      />
    </div>
  );
}