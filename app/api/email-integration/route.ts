// app/api/email-integration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createResponse, createErrorResponse } from '../../../lib/middleware/auth.middleware';
import { EmailParsingService } from '../../../lib/services/emailParsingService';
import { TodoController } from '../../../lib/controllers/todoController';
import { EmailTask, EmailParseResult } from '../../../types/todo';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json();
      const { action, email, parseOptions, todoData } = body;

      switch (action) {
        case 'parse':
          return handleParseEmail(email);
        
        case 'create-task':
          return await handleCreateTask(email, parseOptions, todoData, userId);
        
        case 'bulk-import':
          return await handleBulkImport(body.emails, parseOptions, userId);
        
        default:
          return createErrorResponse('Invalid action', 400);
      }
    } catch (error) {
      console.error('Error in email integration:', error);
      return createErrorResponse('Internal server error', 500);
    }
  });
}

async function handleParseEmail(email: EmailTask) {
  try {
    // Validate email data
    if (!email || !email.subject || !email.content || !email.sender) {
      return createErrorResponse('Invalid email data. Subject, content, and sender are required.', 400);
    }

    // Ensure receivedAt is a valid date
    if (!email.receivedAt) {
      email.receivedAt = new Date();
    } else if (typeof email.receivedAt === 'string') {
      email.receivedAt = new Date(email.receivedAt);
    }

    if (isNaN(email.receivedAt.getTime())) {
      return createErrorResponse('Invalid receivedAt date', 400);
    }

    const parseResult = EmailParsingService.parseEmail(email);
    
    return createResponse({
      parseResult,
      email
    });
  } catch (error) {
    console.error('Error parsing email:', error);
    return createErrorResponse('Failed to parse email', 500);
  }
}

async function handleCreateTask(
  email: EmailTask, 
  parseOptions: any, 
  todoData: any, 
  userId: string
) {
  try {
    console.log('Creating task from email:', {
      subject: email.subject,
      sender: email.sender,
      parseOptions,
      todoData: todoData ? { ...todoData, customDescription: todoData.customDescription?.substring(0, 100) + '...' } : null
    });
    
    // First parse the email
    const parseResult = EmailParsingService.parseEmail(email);
    console.log('Parse result:', {
      suggestedTitle: parseResult.suggestedTitle,
      suggestedPriority: parseResult.suggestedPriority,
      suggestedTags: parseResult.suggestedTags,
      confidence: parseResult.confidence
    });
    
    // Convert to todo input with custom overrides
    const todoInput = EmailParsingService.convertToTodoInput(email, parseResult, {
      includeOriginalEmail: parseOptions?.includeOriginalEmail || false,
      customTitle: todoData?.title,
      customDescription: todoData?.description,
      customPriority: todoData?.priority,
      customDueDate: todoData?.dueDate ? new Date(todoData.dueDate) : undefined,
      customTags: todoData?.tags
    });

    console.log('Todo input:', {
      title: todoInput.title,
      titleLength: todoInput.title.length,
      descriptionLength: todoInput.description?.length || 0,
      priority: todoInput.priority,
      tags: todoInput.tags,
      status: todoInput.status
    });

    // Create the todo using existing controller
    const newTodo = await TodoController.createTodo(userId, todoInput);
    console.log('Todo created successfully:', newTodo._id);
    
    return createResponse({
      todo: newTodo,
      parseResult,
      message: 'Task created successfully from email'
    });
  } catch (error) {
    console.error('Error creating task from email:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return createErrorResponse(`Validation error: ${error.message}`, 400);
      }
      if (error.message.includes('duplicate key')) {
        return createErrorResponse('A task with this information already exists', 409);
      }
    }
    
    return createErrorResponse(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}

async function handleBulkImport(emails: EmailTask[], parseOptions: any, userId: string) {
  try {
    if (!Array.isArray(emails) || emails.length === 0) {
      return createErrorResponse('Invalid emails array', 400);
    }

    if (emails.length > 50) {
      return createErrorResponse('Maximum 50 emails can be processed at once', 400);
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < emails.length; i++) {
      try {
        const email = emails[i];
        
        // Ensure receivedAt is a valid date
        if (!email.receivedAt) {
          email.receivedAt = new Date();
        } else if (typeof email.receivedAt === 'string') {
          email.receivedAt = new Date(email.receivedAt);
        }

        const parseResult = EmailParsingService.parseEmail(email);
        
        // Only create task if confidence is above threshold
        if (parseResult.confidence >= (parseOptions?.minConfidence || 0.3)) {
          const todoInput = EmailParsingService.convertToTodoInput(email, parseResult, {
            includeOriginalEmail: parseOptions?.includeOriginalEmail || false
          });

          const newTodo = await TodoController.createTodo(userId, todoInput);
          
          results.push({
            email: email.subject,
            todo: newTodo,
            parseResult,
            success: true
          });
        } else {
          results.push({
            email: email.subject,
            success: false,
            reason: 'Low confidence score',
            confidence: parseResult.confidence
          });
        }
      } catch (error) {
        errors.push({
          email: emails[i]?.subject || `Email ${i + 1}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return createResponse({
      results,
      errors,
      summary: {
        total: emails.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length + errors.length
      }
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return createErrorResponse('Failed to process bulk import', 500);
  }
}

// GET method for retrieving parsing statistics or configuration
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      // Return some basic information about the email integration feature
      return createResponse({
        features: {
          parsing: true,
          bulkImport: true,
          maxBulkSize: 50,
          supportedFormats: ['plain text', 'html']
        },
        limits: {
          maxEmailLength: 10000,
          maxSubjectLength: 200,
          maxBulkImport: 50
        }
      });
    } catch (error) {
      console.error('Error getting email integration info:', error);
      return createErrorResponse('Failed to get email integration info', 500);
    }
  });
}
