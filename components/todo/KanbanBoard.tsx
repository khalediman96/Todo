// components/todo/KanbanBoard.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Droppable, Draggable, DropResult, DragDropContext } from '@hello-pangea/dnd';
import { Plus, ListTodo, Clock, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { SearchBar } from './SearchBar';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters, TodoStatus } from '../../types/todo';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../providers/ToastProvider';

interface KanbanBoardProps {
  initialTodos?: Todo[];
  onTodosUpdate?: (todos: Todo[]) => void;
}

interface KanbanColumn {
  id: TodoStatus;
  title: string;
  icon: React.ReactNode;
  todos: Todo[];
}

export function KanbanBoard({ initialTodos = [], onTodosUpdate }: KanbanBoardProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<TodoFilters>({});
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    todoId: string | null;
    todoTitle: string;
  }>({
    isOpen: false,
    todoId: null,
    todoTitle: '',
  });
  
  // Performance optimization refs
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragUpdateRef = useRef<boolean>(false);
  
  const { scheduleReminderForTodo, scheduleRemindersForTodos, checkImminentTasks } = useNotifications();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    
    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const applyFiltersToTodos = useCallback((todoList: Todo[]) => {
    let filtered = [...todoList];

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

    return filtered;
  }, [searchValue, filters]);

  // Memoized filtered todos for better performance
  const filteredTodos = useMemo(() => {
    return applyFiltersToTodos(todos);
  }, [todos, searchValue, filters, applyFiltersToTodos]);

  // Memoized columns to prevent unnecessary recalculations
  const columns = useMemo(() => {
    const newTodos = filteredTodos.filter(todo => 
      (todo.status === 'new' || (!todo.status && !todo.completed))
    );
    const inProgressTodos = filteredTodos.filter(todo => todo.status === 'in-progress');
    const completedTodos = filteredTodos.filter(todo => 
      todo.status === 'completed' || (todo.completed && todo.status !== 'in-progress')
    );

    return [
      {
        id: 'new' as TodoStatus,
        title: 'New Tasks',
        icon: <ListTodo className="w-5 h-5" />,
        todos: newTodos
      },
      {
        id: 'in-progress' as TodoStatus,
        title: 'In Progress',
        icon: <Clock className="w-5 h-5" />,
        todos: inProgressTodos
      },
      {
        id: 'completed' as TodoStatus,
        title: 'Completed',
        icon: <CheckCircle2 className="w-5 h-5" />,
        todos: completedTodos
      }
    ];
  }, [filteredTodos]);

  // Set up periodic check for imminent tasks (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (todos.length > 0) {
        checkImminentTasks(todos);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [todos, checkImminentTasks]);

  // Convert SearchFilters from SearchBar to TodoFilters
  const handleFilterChange = (searchFilters: any) => {
    const todoFilters: TodoFilters = {
      ...searchFilters,
      completed: undefined, // Remove completed filter for kanban view
    };
    setFilters(todoFilters);
  };

  // Update todos when initialTodos change
  useEffect(() => {
    setTodos(initialTodos);
    
    // Schedule reminders for all todos with due dates
    if (initialTodos.length > 0) {
      scheduleRemindersForTodos(initialTodos);
      
      // Check for tasks that are due within 5 minutes and show immediate notifications
      setTimeout(() => {
        checkImminentTasks(initialTodos);
      }, 1000); // Delay to ensure page is fully loaded
    }
  }, [initialTodos]);

  const handleCreateTodo = async (data: CreateTodoInput) => {
    try {
      setLoading(true);
      const todoData = {
        ...data,
        status: 'new' as TodoStatus,
        completed: false
      };

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });

      if (response.ok) {
        const newTodo = await response.json();
        const updatedTodos = [newTodo, ...todos];
        setTodos(updatedTodos);
        onTodosUpdate?.(updatedTodos);
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
        const updatedTodos = todos.map(todo => 
          todo._id === editingTodo._id ? updatedTodo : todo
        );
        setTodos(updatedTodos);
        onTodosUpdate?.(updatedTodos);
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

  const handleDeleteTodo = (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    
    setConfirmDelete({
      isOpen: true,
      todoId: id,
      todoTitle: todo.title,
    });
  };

  const confirmDeleteTodo = async () => {
    const { todoId } = confirmDelete;
    if (!todoId) return;

    setLoading(true);
    try {
      console.log('Attempting to delete todo:', todoId);
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      console.log('Delete response:', response.status, response.statusText);

      if (response.ok) {
        const updatedTodos = todos.filter(todo => todo._id !== todoId);
        setTodos(updatedTodos);
        onTodosUpdate?.(updatedTodos);
        showToast({
          title: 'Todo Deleted',
          message: 'Todo has been removed from your list',
          type: 'success'
        });
        setConfirmDelete({ isOpen: false, todoId: null, todoTitle: '' });
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete todo. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setConfirmDelete({ isOpen: false, todoId: null, todoTitle: '' });
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TodoStatus;
    const todoId = draggableId;

    // Find the todo that was dragged
    const todo = todos.find(t => t._id === todoId);
    if (!todo) return;

    // Create optimistic update with immediate UI feedback
    const optimisticUpdate = {
      ...todo,
      status: newStatus,
      completed: newStatus === 'completed',
      updatedAt: new Date()
    };

    // Apply optimistic update immediately for instant feedback
    const updatedTodos = todos.map(t => 
      t._id === todoId ? optimisticUpdate : t
    );
    
    setTodos(updatedTodos);
    onTodosUpdate?.(updatedTodos);

    // Show immediate feedback with enhanced animation
    const statusMessages = {
      'new': 'moved to New Tasks',
      'in-progress': 'moved to In Progress',
      'completed': 'marked as completed'
    } as const;

    showToast({
      title: 'Task Updated',
      message: `"${todo.title}" ${statusMessages[newStatus as keyof typeof statusMessages]}`,
      type: 'success'
    });

    // Update database in background with error handling
    try {
      const updateData: UpdateTodoInput = {
        status: newStatus,
        completed: newStatus === 'completed'
      };

      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        // Update with server response to ensure consistency
        const finalTodos = todos.map(t => 
          t._id === todoId ? updatedTodo : t
        );
        setTodos(finalTodos);
        onTodosUpdate?.(finalTodos);
      } else {
        // Revert optimistic update on error
        const revertedTodos = todos.map(t => 
          t._id === todoId ? todo : t
        );
        setTodos(revertedTodos);
        onTodosUpdate?.(revertedTodos);
        
        const errorData = await response.json();
        showToast({
          title: 'Error',
          message: errorData.message || 'Failed to update task status. Changes reverted.',
          type: 'error'
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      const revertedTodos = todos.map(t => 
        t._id === todoId ? todo : t
      );
      setTodos(revertedTodos);
      onTodosUpdate?.(revertedTodos);
      
      showToast({
        title: 'Error',
        message: 'Failed to update task status. Changes reverted.',
        type: 'error'
      });
    }
  }, [todos, onTodosUpdate, showToast]);

  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.status === 'completed' || todo.completed).length;
  const inProgressCount = todos.filter(todo => todo.status === 'in-progress').length;

  return (
    <div className="kanban-container">
      {/* Header */}
      <div className="kanban-header">
        <div>
          <h1 className="kanban-title">
            My Todo Board
          </h1>
          <p className="kanban-subtitle">
            {completedCount} of {totalCount} tasks completed • {inProgressCount} in progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsFormOpen(true)} className="kanban-add-button">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="dashboard-stats-container">
        <div className="dashboard-stat-card dashboard-stat-card--total">
          <div className="dashboard-stat-icon-container">
            <div className="dashboard-stat-icon dashboard-stat-icon--total">
              <ListTodo className="dashboard-stat-icon-svg" />
            </div>
            <span className="dashboard-stat-label dashboard-stat-label--total">
              New Tasks
            </span>
          </div>
          <p className="dashboard-stat-number dashboard-stat-number--total">
            {todos.filter(todo => todo.status === 'new' || (!todo.status && !todo.completed)).length}
          </p>
        </div>

        <div className="dashboard-stat-card dashboard-stat-card--pending">
          <div className="dashboard-stat-icon-container">
            <div className="dashboard-stat-icon dashboard-stat-icon--pending">
              <Clock className="dashboard-stat-icon-svg" />
            </div>
            <span className="dashboard-stat-label dashboard-stat-label--pending">
              In Progress
            </span>
          </div>
          <p className="dashboard-stat-number dashboard-stat-number--pending">
            {inProgressCount}
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
      </div>

      {/* Search and Filters */}
      <div className="kanban-filters">
        <SearchBar
          value={searchValue}
          onSearch={setSearchValue}
          onFilterChange={handleFilterChange}
          hideCompletedFilter={true}
        />
      </div>

      {/* Kanban Board */}
      {mounted && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {columns.map((column) => (
              <div key={column.id} className="kanban-column" data-column={column.id}>
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    {column.icon}
                    <span>{column.title}</span>
                  </div>
                  <div className="kanban-column-count">
                    {column.todos.length}
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-column-content ${
                        snapshot.isDraggingOver ? 'kanban-column-content--dragging' : ''
                      }`}
                    >
                      {column.todos.length === 0 ? (
                        <div className="kanban-empty-state">
                          <p className="kanban-empty-text">
                            {column.id === 'new' && 'No new tasks'}
                            {column.id === 'in-progress' && 'No tasks in progress'}
                            {column.id === 'completed' && 'No completed tasks'}
                          </p>
                        </div>
                      ) : (
                        column.todos.map((todo, index) => (
                          <Draggable
                            key={`${todo._id}-${column.id}`}
                            draggableId={todo._id!}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`kanban-card ${
                                  snapshot.isDragging ? 'kanban-card--dragging' : ''
                                }`}
                              >
                                <TodoItem
                                  todo={todo}
                                  onToggleComplete={() => {}} // Handled by drag and drop
                                  onEdit={handleEditTodo}
                                  onDelete={handleDeleteTodo}
                                  isKanbanMode={true}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

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

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDeleteTodo}
        title="Delete Todo"
        message={`Are you sure you want to delete "${confirmDelete.todoTitle}"? This action cannot be undone.`}
      />
    </div>
  );
}
