// components/email/EmailImportModal.tsx
'use client';

import React, { useState } from 'react';
import { Mail, Upload, FileText, AlertCircle, CheckCircle2, X, Settings, Zap, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../providers/ToastProvider';
import { EmailTask, EmailParseResult, CreateTodoInput } from '../../types/todo';

interface EmailImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (todo: any) => void;
}

interface ParsedEmailData {
  email: EmailTask;
  parseResult: EmailParseResult;
  isSelected: boolean;
  customData?: Partial<CreateTodoInput>;
}

export function EmailImportModal({ isOpen, onClose, onTaskCreated }: EmailImportModalProps) {
  const [currentStep, setCurrentStep] = useState<'input' | 'parse' | 'review' | 'import'>('input');
  const [emailText, setEmailText] = useState('');
  const [parsedEmails, setParsedEmails] = useState<ParsedEmailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importOptions, setImportOptions] = useState({
    includeOriginalEmail: true,
    autoSetPriority: true,
    autoExtractDueDate: true,
    defaultPriority: 'medium' as const,
    tagPrefix: 'email'
  });
  const { showToast } = useToast();

  const handleClose = () => {
    setCurrentStep('input');
    setEmailText('');
    setParsedEmails([]);
    onClose();
  };

  const parseEmailText = (text: string): EmailTask | null => {
    try {
      // Try to parse as JSON first (for programmatic import)
      const jsonData = JSON.parse(text);
      if (jsonData.subject && jsonData.content && jsonData.sender) {
        return {
          id: jsonData.id || Date.now().toString(),
          subject: jsonData.subject,
          sender: jsonData.sender,
          content: jsonData.content,
          receivedAt: jsonData.receivedAt ? new Date(jsonData.receivedAt) : new Date(),
          attachments: jsonData.attachments || []
        };
      }
    } catch {
      // Not JSON, try to parse as email format
    }

    // Parse email-like format
    const lines = text.split('\n');
    let subject = '';
    let sender = '';
    let content = '';
    let receivedAt = new Date();
    
    // Look for email headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.toLowerCase().startsWith('subject:')) {
        subject = line.substring(8).trim();
      } else if (line.toLowerCase().startsWith('from:')) {
        sender = line.substring(5).trim().replace(/[<>]/g, '');
      } else if (line.toLowerCase().startsWith('date:')) {
        const dateStr = line.substring(5).trim();
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          receivedAt = parsed;
        }
      } else if (line === '' && subject && sender) {
        // Empty line indicates start of body
        content = lines.slice(i + 1).join('\n').trim();
        break;
      }
    }

    // If no headers found, treat entire text as content with default values
    if (!subject && !sender) {
      const firstLine = lines[0]?.trim();
      if (firstLine) {
        subject = firstLine.length > 80 ? firstLine.substring(0, 77) + '...' : firstLine;
        sender = 'unknown@example.com';
        content = text;
      }
    }

    if (subject && sender && content) {
      return {
        id: Date.now().toString(),
        subject,
        sender,
        content,
        receivedAt,
        attachments: []
      };
    }

    return null;
  };

  const handleParseEmail = async () => {
    if (!emailText.trim()) {
      showToast({
        title: 'Error',
        message: 'Please enter email content',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const email = parseEmailText(emailText);
      if (!email) {
        throw new Error('Could not parse email format');
      }

      const response = await fetch('/api/email-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse',
          email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to parse email: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setParsedEmails([{
        email: data.email,
        parseResult: data.parseResult,
        isSelected: true
      }]);
      
      setCurrentStep('review');
      
      showToast({
        title: 'Email Parsed',
        message: `Extracted task with ${Math.round(data.parseResult.confidence * 100)}% confidence`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error parsing email:', error);
      showToast({
        title: 'Parsing Failed',
        message: error instanceof Error ? error.message : 'Failed to parse email',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (emailData: ParsedEmailData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-task',
          email: emailData.email,
          parseOptions: importOptions,
          todoData: emailData.customData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to create task: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      showToast({
        title: 'Task Created',
        message: `"${data.todo.title}" has been created`,
        type: 'success'
      });

      onTaskCreated?.(data.todo);
      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
      showToast({
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Failed to create task',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomData = (index: number, field: string, value: any) => {
    setParsedEmails(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          customData: {
            ...item.customData,
            [field]: value
          }
        };
      }
      return item;
    }));
  };

  const renderInputStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/80 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Import Email as Task
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Paste your email content below and we'll extract task information automatically
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Content
          </label>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder={`Paste email content here. Supported formats:

JSON format:
{
  "subject": "Project Review Meeting",
  "sender": "john@company.com",
  "content": "Please review the project proposal by Friday...",
  "receivedAt": "2024-01-15T10:00:00Z"
}

Email format:
Subject: Project Review Meeting
From: john@company.com
Date: Mon, 15 Jan 2024 10:00:00 GMT

Please review the project proposal by Friday...`}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div className="text-sm">
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                Supported Email Formats
              </p>
              <ul className="text-slate-700 dark:text-slate-300 space-y-1">
                <li>• Standard email with Subject, From, and Date headers</li>
                <li>• JSON format with subject, sender, content, and receivedAt fields</li>
                <li>• Plain text (will use first line as subject)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleParseEmail} disabled={isLoading || !emailText.trim()}>
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Parsing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Parse Email
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const emailData = parsedEmails[0];
    if (!emailData) return null;

    const { email, parseResult } = emailData;
    const confidence = Math.round(parseResult.confidence * 100);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            confidence >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
            confidence >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-red-100 dark:bg-red-900/30'
          }`}>
            <CheckCircle2 className={`w-8 h-8 ${
              confidence >= 80 ? 'text-green-600 dark:text-green-400' :
              confidence >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Review Extracted Task
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Confidence: {confidence}% • Review and edit the extracted information
          </p>
        </div>

        {/* Original Email Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Original Email
          </h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">From:</span> {email.sender}</div>
            <div><span className="font-medium">Subject:</span> {email.subject}</div>
            <div><span className="font-medium">Received:</span> {new Date(email.receivedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Extracted Task Data */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Extracted Task Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <Input
              value={emailData.customData?.title || parseResult.suggestedTitle}
              onChange={(e) => updateCustomData(0, 'title', e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={emailData.customData?.description || parseResult.suggestedDescription}
              onChange={(e) => updateCustomData(0, 'description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={emailData.customData?.priority || parseResult.suggestedPriority}
                onChange={(e) => updateCustomData(0, 'priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={(() => {
                  const date = emailData.customData?.dueDate || parseResult.suggestedDueDate;
                  return date ? new Date(date).toISOString().slice(0, 16) : '';
                })()}
                onChange={(e) => updateCustomData(0, 'dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {parseResult.suggestedTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Suggested Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {parseResult.suggestedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-800/80 text-blue-800 dark:text-blue-100 text-xs rounded-full border border-blue-200 dark:border-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setCurrentStep('input')} disabled={isLoading}>
            Back
          </Button>
          <div className="space-x-3">
            <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={() => handleCreateTask(emailData)} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="min-h-[500px]">
        {currentStep === 'input' && renderInputStep()}
        {currentStep === 'review' && renderReviewStep()}
      </div>
    </Modal>
  );
}
