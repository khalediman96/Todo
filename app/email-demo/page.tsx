// app/email-demo/page.tsx
'use client';

import React, { useState } from 'react';
import { Mail, FileText, Zap } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { EmailImportModal } from '../../components/email/EmailImportModal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../providers/ToastProvider';

export default function EmailDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const sampleEmails = [
    {
      title: "Project Meeting Email",
      content: `Subject: Project Review Meeting
From: john.smith@company.com
Date: Mon, 15 Jan 2024 10:00:00 GMT

Hi team,

Please review the project proposal by Friday and prepare your feedback for our meeting next Monday. This is urgent as we need to submit our response to the client by end of week.

The documents are attached for your review.

Best regards,
John Smith`
    },
    {
      title: "Support Ticket JSON",
      content: `{
  "subject": "Bug Report - User Login Issue",
  "sender": "support@example.com",
  "content": "High priority: Users are unable to login to the system. This needs immediate attention as it's affecting all customers. Please investigate and fix ASAP.",
  "receivedAt": "2024-01-15T14:30:00Z"
}`
    },
    {
      title: "Simple Task Email",
      content: `Subject: Call client about contract
From: manager@company.com

Please call the client today about the new contract terms. The deadline is tomorrow, so this is urgent.`
    }
  ];

  const handleSampleEmail = (email: any) => {
    // Create a text area and copy content to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = email.content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    showToast({
      title: 'Copied to Clipboard',
      message: 'Email content copied! Now paste it in the import modal.',
      type: 'success'
    });
    
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Email Integration Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Test the email-to-task conversion feature with sample emails. Click on any sample email below to copy its content, then use the "Test Import" button to see how it gets parsed into a task.
            </p>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              Test Email Import
            </Button>
          </div>

          {/* Sample Emails */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleEmails.map((email, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSampleEmail(email)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {email.title}
                  </h3>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-hidden line-clamp-6 font-mono bg-gray-50 dark:bg-gray-700 p-3 rounded border">
                  {email.content.length > 200 ? email.content.substring(0, 200) + '...' : email.content}
                </pre>
                <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Click to copy and test
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Features Demonstrated
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Email Parsing
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Extracts subject as task title</li>
                  <li>• Identifies sender and date</li>
                  <li>• Parses both email format and JSON</li>
                  <li>• Handles plain text content</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Smart Analysis
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Auto-detects priority from keywords</li>
                  <li>• Extracts due dates from text</li>
                  <li>• Suggests relevant tags</li>
                  <li>• Confidence scoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EmailImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={(todo) => {
          showToast({
            title: 'Demo Task Created',
            message: `"${todo.title}" - This is a demo, the task won't persist.`,
            type: 'success'
          });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
