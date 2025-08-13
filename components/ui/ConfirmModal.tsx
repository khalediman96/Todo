// components/ui/ConfirmModal.tsx
'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="confirm-modal-content">
        {/* Icon */}
        <div className={`confirm-modal-icon ${getIconBackground()}`}>
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="confirm-modal-title">
          {title}
        </h3>

        {/* Message */}
        <p className="confirm-modal-message">
          {message}
        </p>

        {/* Actions */}
        <div className="confirm-modal-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="confirm-modal-cancel-btn"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            className="confirm-modal-confirm-btn"
          >
            {loading ? '⏳ Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
