// components/ui/Toast.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Clock, Bell } from 'lucide-react';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'reminder';
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ 
  id, 
  title, 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-white animate-pulse" />;
      default:
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30';
      case 'error':
        return 'border-red-500 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30';
      case 'warning':
        return 'border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30';
      case 'reminder':
        return 'border-purple-500 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl shadow-purple-500/30 ring-2 ring-purple-400/50';
      default:
        return 'border-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30';
    }
  };

  return (
    <div
      className={`transform transition-all duration-500 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 translate-y-0 opacity-100 scale-100'
          : 'translate-x-full translate-y-2 opacity-0 scale-95'
      }`}
    >
      <div
        className={`max-w-sm w-full shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-white/30 backdrop-blur-sm hover:scale-105 transition-transform duration-200 ${getColorClasses()} ${
          type === 'reminder' ? 'toast-reminder' : ''
        }`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">
                {title}
              </p>
              {message && (
                <p className="mt-1 text-sm text-white/90">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-white/30">
          <button
            onClick={handleClose}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="fixed bottom-4 right-4 flex flex-col items-end space-y-3 pointer-events-none z-40 max-w-sm"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
