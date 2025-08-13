// hooks/useEmailIntegration.ts
'use client';

import { useState, useCallback } from 'react';
import { EmailTask, EmailParseResult } from '../types/todo';
import { useToast } from '../providers/ToastProvider';

interface EmailIntegrationOptions {
  includeOriginalEmail?: boolean;
  autoSetPriority?: boolean;
  autoExtractDueDate?: boolean;
  defaultPriority?: 'low' | 'medium' | 'high';
  tagPrefix?: string;
  minConfidence?: number;
}

interface UseEmailIntegrationReturn {
  parseEmail: (email: EmailTask) => Promise<{ email: EmailTask; parseResult: EmailParseResult } | null>;
  createTaskFromEmail: (email: EmailTask, options?: EmailIntegrationOptions, customData?: any) => Promise<any>;
  bulkImportEmails: (emails: EmailTask[], options?: EmailIntegrationOptions) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export function useEmailIntegration(): UseEmailIntegrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const parseEmail = useCallback(async (email: EmailTask) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse',
          email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse email');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse email';
      setError(errorMessage);
      showToast({
        title: 'Parse Error',
        message: errorMessage,
        type: 'error'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const createTaskFromEmail = useCallback(async (
    email: EmailTask,
    options: EmailIntegrationOptions = {},
    customData: any = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-task',
          email,
          parseOptions: options,
          todoData: customData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const data = await response.json();
      
      showToast({
        title: 'Task Created',
        message: `"${data.todo.title}" has been created from email`,
        type: 'success'
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      showToast({
        title: 'Creation Error',
        message: errorMessage,
        type: 'error'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const bulkImportEmails = useCallback(async (
    emails: EmailTask[],
    options: EmailIntegrationOptions = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-import',
          emails,
          parseOptions: options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import emails');
      }

      const data = await response.json();
      
      showToast({
        title: 'Bulk Import Complete',
        message: `Successfully imported ${data.summary.successful} out of ${data.summary.total} emails`,
        type: data.summary.successful > 0 ? 'success' : 'warning'
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import emails';
      setError(errorMessage);
      showToast({
        title: 'Import Error',
        message: errorMessage,
        type: 'error'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  return {
    parseEmail,
    createTaskFromEmail,
    bulkImportEmails,
    isLoading,
    error
  };
}
