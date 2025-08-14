// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Bell, BellOff } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { KanbanBoard } from '../../components/todo/KanbanBoard';
import { PomodoroTimer } from '../../components/ui/PomodoroTimer';
import { EmailImportButton } from '../../components/email/EmailImportButton';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../providers/ToastProvider';
import { Todo } from '../../types/todo';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { requestPermission, toggleNotifications, getPermissionStatus, getNotificationStatus, notificationService } = useNotifications();
  const { showToast } = useToast();

  // Check notification permission on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isEnabled = getNotificationStatus();
      setNotificationsEnabled(isEnabled);
    }
  }, [getNotificationStatus]);

  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        console.log('🔍 Dashboard: Fetching todos...');
        const response = await fetch('/api/todos');
        console.log('🔍 Dashboard: Fetch response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Dashboard: Todos received:', {
            count: data.length,
            todos: data.map((t: Todo) => ({ id: t._id, title: t.title, status: t.status }))
          });
          setTodos(data);
        } else {
          const errorText = await response.text();
          console.error('❌ Dashboard: Failed to fetch todos:', response.status, errorText);
          showToast({
            title: 'Error',
            message: 'Failed to load todos',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching todos:', error);
        showToast({
          title: 'Error',
          message: 'Failed to load todos',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      console.log('🔍 Dashboard: Session exists, fetching todos for user:', session.user?.email);
      fetchTodos();
    } else {
      console.log('🔍 Dashboard: No session, skipping todo fetch');
    }
  }, [session, showToast]);

  const handleToggleNotifications = async () => {
    try {
      console.log('Notification button clicked');
      const granted = await toggleNotifications();
      setNotificationsEnabled(granted);
      console.log('Notification status updated:', granted);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      showToast({
        title: 'Error',
        message: 'Failed to toggle notifications',
        type: 'error'
      });
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/todos/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completed: true,
          status: 'completed',
          progress: 100
        }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo._id === taskId ? updatedTodo : todo
          )
        );
        
        showToast({
          title: '✅ Task Completed!',
          message: 'Great job finishing your task!',
          type: 'success'
        });
      } else {
        console.error('Failed to update task:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showToast({
        title: 'Error',
        message: 'Failed to update task',
        type: 'error'
      });
    }
  };

  const handleTodosUpdate = (updatedTodos: Todo[]) => {
    setTodos(updatedTodos);
  };

  const handleEmailTaskCreated = (newTodo: Todo) => {
    setTodos(prevTodos => [newTodo, ...prevTodos]);
    showToast({
      title: 'Email Task Created',
      message: `"${newTodo.title}" has been added to your todos`,
      type: 'success'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <Navbar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your tasks and stay productive
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="dashboard-action-buttons">
              {/* Email Import */}
              <EmailImportButton 
                onTaskCreated={handleEmailTaskCreated}
                variant="secondary"
              />
              
              {/* Pomodoro Timer */}
              <PomodoroTimer 
                availableTasks={todos}
                onTaskComplete={handleTaskComplete}
              />
              
              {/* Notification Toggle */}
              <button
                onClick={handleToggleNotifications}
                className={`dashboard-notification-btn ${
                  notificationsEnabled 
                    ? 'dashboard-notification-btn--enabled' 
                    : 'dashboard-notification-btn--disabled'
                }`}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Notifications On</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4" />
                    <span>Enable Notifications</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <KanbanBoard 
            initialTodos={todos}
            onTodosUpdate={handleTodosUpdate}
          />
        </div>
      </main>
    </div>
  );
}