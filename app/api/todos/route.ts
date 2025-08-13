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
      const body = await req.json();
      
      // Validate required fields
      if (!body.title?.trim()) {
        return createErrorResponse('Title is required', 400);
      }

      // Validate priority
      if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) {
        return createErrorResponse('Invalid priority value', 400);
      }

      // Validate status
      if (body.status && !['new', 'in-progress', 'completed'].includes(body.status)) {
        return createErrorResponse('Invalid status value', 400);
      }

      // Validate tags
      if (body.tags && !Array.isArray(body.tags)) {
        return createErrorResponse('Tags must be an array', 400);
      }

      // Validate recurring config
      if (body.isRecurring && body.recurringConfig) {
        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(body.recurringConfig.type)) {
          return createErrorResponse('Invalid recurring type', 400);
        }
        if (body.recurringConfig.interval && body.recurringConfig.interval < 1) {
          return createErrorResponse('Interval must be at least 1', 400);
        }
      }

      // Validate due date
      if (body.dueDate) {
        const dueDate = new Date(body.dueDate);
        if (isNaN(dueDate.getTime())) {
          return createErrorResponse('Invalid due date', 400);
        }
        body.dueDate = dueDate;
      }

      const todo = await TodoController.createTodo(userId, body);
      return createResponse(todo, 201);
    } catch (error) {
      console.error('Error creating todo:', error);
      return createErrorResponse('Failed to create todo', 500);
    }
  });
}