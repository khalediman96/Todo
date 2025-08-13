// app/api/todos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TodoController } from '../../../../lib/controllers/todoController';
import { withAuth, createResponse, createErrorResponse } from '../../../../lib/middleware/auth.middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, userId) => {
    try {
      const { id } = await params;
      const body = await req.json();

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return createErrorResponse('Invalid todo ID format', 400);
      }

      // Validate priority if provided
      if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) {
        return createErrorResponse('Invalid priority value', 400);
      }

      // Validate status if provided
      if (body.status && !['new', 'in-progress', 'completed'].includes(body.status)) {
        return createErrorResponse('Invalid status value', 400);
      }

      // Validate tags if provided
      if (body.tags && !Array.isArray(body.tags)) {
        return createErrorResponse('Tags must be an array', 400);
      }

      // Validate recurring config if provided
      if (body.isRecurring && body.recurringConfig) {
        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(body.recurringConfig.type)) {
          return createErrorResponse('Invalid recurring type', 400);
        }
        if (body.recurringConfig.interval && body.recurringConfig.interval < 1) {
          return createErrorResponse('Interval must be at least 1', 400);
        }
      }

      // Validate due date if provided
      if (body.dueDate) {
        const dueDate = new Date(body.dueDate);
        if (isNaN(dueDate.getTime())) {
          return createErrorResponse('Invalid due date', 400);
        }
        body.dueDate = dueDate;
      }

      const todo = await TodoController.updateTodo(userId, id, body);
      return createResponse(todo);
    } catch (error) {
      console.error('Error updating todo:', error);
      if (error instanceof Error && error.message === 'Todo not found') {
        return createErrorResponse('Todo not found', 404);
      }
      return createErrorResponse('Failed to update todo', 500);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, userId) => {
    try {
      const { id } = await params;

      console.log('DELETE request received:', { id, userId, idLength: id.length, idFormat: typeof id });

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        console.log('Invalid ID format:', id);
        return createErrorResponse('Invalid todo ID format', 400);
      }

      const result = await TodoController.deleteTodo(userId, id);
      return createResponse(result);
    } catch (error) {
      console.error('Error deleting todo:', error);
      if (error instanceof Error && error.message === 'Todo not found') {
        return createErrorResponse('Todo not found', 404);
      }
      return createErrorResponse('Failed to delete todo', 500);
    }
  });
}