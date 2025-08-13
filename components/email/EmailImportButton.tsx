// components/email/EmailImportButton.tsx
'use client';

import React, { useState } from 'react';
import { Mail, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmailImportModal } from './EmailImportModal';

interface EmailImportButtonProps {
  onTaskCreated?: (todo: any) => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmailImportButton({ 
  onTaskCreated, 
  variant = 'secondary',
  size = 'md',
  className = '' 
}: EmailImportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskCreated = (todo: any) => {
    setIsModalOpen(false);
    onTaskCreated?.(todo);
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setIsModalOpen(true)}
        className={`email-import-button ${className}`}
      >
        <Mail className="w-4 h-4 mr-2" />
        Import from Email
      </Button>

      <EmailImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </>
  );
}
