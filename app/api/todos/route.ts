// app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TodoController } from '../../../lib/controllers/todoController';
import { withAuth, createResponse, createErrorResponse } from '../../../lib/middleware/auth.middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const filters = {
        search: searchParams.get('search') || undefined,
        completed: searchParams.get('completed') ? searchParams.get('completed') === 'true' : undefined,
        priority: searchParams.get('priority') as 'low' | 'medium' | 'high' || undefined,
        sortBy: searchParams.get('sortBy') as 'createdAt' | 'dueDate' | 'priority' || 'createdAt',
        sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
      };

      const todos = await TodoController.getTodos(userId, filters);
      return createResponse(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      return createErrorResponse('Failed to fetch todos', 500);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      console.log('🔍 POST /api/todos - Starting request');
      console.log('🔍 User ID:', userId);
      
      const body = await req.json();
      console.log('🔍 Request body:', body);
      console.log('🔍 Request body keys:', Object.keys(body));
      
      // Validate required fields
      if (!body.title?.trim()) {
        console.log('❌ Validation failed: Title is required');
        return createErrorResponse('Title is required', 400);
      }

      // Validate priority
      if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) {
        console.log('❌ Validation failed: Invalid priority value');
        return createErrorResponse('Invalid priority value', 400);
      }

      // Validate status
      if (body.status && !['new', 'in-progress', 'completed'].includes(body.status)) {
        console.log('❌ Validation failed: Invalid status value');
        return createErrorResponse('Invalid status value', 400);
      }

      // Validate tags
      if (body.tags && !Array.isArray(body.tags)) {
        console.log('❌ Validation failed: Tags must be an array');
        return createErrorResponse('Tags must be an array', 400);
      }

      // Validate recurring config
      if (body.isRecurring && body.recurringConfig) {
        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(body.recurringConfig.type)) {
          console.log('❌ Validation failed: Invalid recurring type');
          return createErrorResponse('Invalid recurring type', 400);
        }
        if (body.recurringConfig.interval && body.recurringConfig.interval < 1) {
          console.log('❌ Validation failed: Interval must be at least 1');
          return createErrorResponse('Interval must be at least 1', 400);
        }
      }

      // Validate due date
      if (body.dueDate) {
        const dueDate = new Date(body.dueDate);
        if (isNaN(dueDate.getTime())) {
          console.log('❌ Validation failed: Invalid due date');
          return createErrorResponse('Invalid due date', 400);
        }
        body.dueDate = dueDate;
      }

      console.log('✅ Validation passed, calling TodoController.createTodo');
      const todo = await TodoController.createTodo(userId, body);
      console.log('✅ Todo created successfully:', todo._id);
      return createResponse(todo, 201);
    } catch (error) {
      console.error('❌ Error in POST /api/todos:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return createErrorResponse('Failed to create todo', 500);
    }
  });
}