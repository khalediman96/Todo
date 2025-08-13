# Email Integration Feature

## Overview
The Email Integration feature allows users to convert emails into tasks automatically. It uses intelligent parsing to extract relevant information from email content and creates properly structured tasks.

## Features

### 🤖 Smart Email Parsing
- **Multiple Input Formats**: Supports standard email format, JSON format, and plain text
- **Intelligent Extraction**: Automatically extracts title, description, priority, due dates, and tags
- **Confidence Scoring**: Provides confidence scores (0-100%) for parsing accuracy
- **Flexible Headers**: Handles various email header formats (Subject, From, Date)

### 🎯 Priority Detection
The system automatically detects task priority based on keywords:

**High Priority Keywords:**
- urgent, asap, emergency, critical, important, deadline, rush, priority, immediate, quickly, soon

**Medium Priority Keywords:**
- needed, required, should, would like, please, when possible

**Low Priority:** Default for emails without priority indicators

### 📅 Due Date Extraction
Automatically extracts due dates from natural language:
- "by tomorrow", "by today"
- "by end of week", "by eod"
- "by Friday", "by next week"
- ISO date format (YYYY-MM-DD)
- US date format (MM/DD/YYYY)

### 🏷️ Tag Generation
Automatically generates relevant tags:
- Sender domain (e.g., "company.com")
- Hashtags from content (#project, #meeting)
- Category keywords (meeting, report, review, project, etc.)

## Usage

### From Dashboard
1. Click the "Import from Email" button in the dashboard header or kanban board
2. Paste your email content in the modal
3. Review the extracted information
4. Edit any details as needed
5. Click "Create Task" to add to your todo list

### From Demo Page
Visit `/email-demo` to test the feature with sample emails.

### Supported Email Formats

#### Standard Email Format
```
Subject: Project Review Meeting
From: john@company.com
Date: Mon, 15 Jan 2024 10:00:00 GMT

Please review the project proposal by Friday and prepare your feedback for our meeting next Monday.
```

#### JSON Format
```json
{
  "subject": "Bug Report - User Login Issue",
  "sender": "support@example.com",
  "content": "High priority: Users are unable to login to the system. This needs immediate attention.",
  "receivedAt": "2024-01-15T14:30:00Z"
}
```

#### Plain Text
```
Call client about contract renewal - urgent deadline tomorrow
```

## API Endpoints

### POST `/api/email-integration`

#### Parse Email Action
```json
{
  "action": "parse",
  "email": {
    "id": "unique-id",
    "subject": "Email subject",
    "sender": "sender@domain.com",
    "content": "Email content...",
    "receivedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Response:**
```json
{
  "parseResult": {
    "suggestedTitle": "Extracted title",
    "suggestedDescription": "Extracted description",
    "suggestedPriority": "high|medium|low",
    "suggestedDueDate": "2024-01-16T23:59:59.999Z",
    "suggestedTags": ["tag1", "tag2"],
    "confidence": 0.85
  },
  "email": { /* original email data */ }
}
```

#### Create Task Action
```json
{
  "action": "create-task",
  "email": { /* email object */ },
  "parseOptions": {
    "includeOriginalEmail": true,
    "autoSetPriority": true,
    "autoExtractDueDate": true
  },
  "todoData": {
    "title": "Custom title (optional)",
    "description": "Custom description (optional)",
    "priority": "high|medium|low (optional)",
    "dueDate": "2024-01-16T23:59:59.999Z (optional)",
    "tags": ["custom", "tags"] 
  }
}
```

#### Bulk Import Action
```json
{
  "action": "bulk-import",
  "emails": [/* array of email objects */],
  "parseOptions": {
    "includeOriginalEmail": true,
    "minConfidence": 0.3
  }
}
```

## Components

### EmailImportModal
Main modal component for email import workflow.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Close handler
- `onTaskCreated?: (todo: any) => void` - Callback when task is created

### EmailImportButton
Button component that opens the email import modal.

**Props:**
- `onTaskCreated?: (todo: any) => void` - Callback when task is created
- `variant?: 'primary' | 'secondary'` - Button style variant
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `className?: string` - Additional CSS classes

## Services

### EmailParsingService
Core service for parsing email content and extracting task information.

**Key Methods:**
- `parseEmail(email: EmailTask): EmailParseResult` - Parse email and extract task data
- `convertToTodoInput(email: EmailTask, parseResult: EmailParseResult, options): CreateTodoInput` - Convert to todo format

## Hooks

### useEmailIntegration
React hook for email integration functionality.

**Returns:**
- `parseEmail` - Function to parse an email
- `createTaskFromEmail` - Function to create a task from email
- `bulkImportEmails` - Function to import multiple emails
- `isLoading` - Loading state
- `error` - Error state

## Styling

The email integration components use the same design system as the rest of the application:
- Consistent color schemes with dark/light theme support
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Responsive design for mobile and desktop

## Error Handling

The system includes comprehensive error handling:
- Invalid email format detection
- API error responses with detailed messages
- User-friendly error notifications
- Graceful degradation for partial data

## Security Considerations

- Input validation on both client and server sides
- Email content sanitization
- Rate limiting for bulk imports (max 50 emails)
- Content length limits to prevent abuse

## Future Enhancements

Potential future improvements:
- Email provider integration (Gmail, Outlook)
- Attachment handling
- Email thread parsing
- Machine learning for better priority detection
- Custom parsing rules
- Email template recognition
