// lib/controllers/todoController.ts
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../mongodb';
import { Todo } from '../models/Todo';
import { TodoFilters, TodoStats } from '../../types/todo';
import { RecurringTaskManager } from '../utils/recurringTasks';

export class TodoController {
  static async getTodos(userId: string, filters: TodoFilters = {}) {
    await connectDB();
    
    const {
      search,
      completed,
      priority,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const query: any = { userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (completed !== undefined) {
      query.completed = completed;
    }

    if (priority) {
      query.priority = priority;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const todos = await Todo.find(query).sort(sortOptions).lean();
    return todos;
  }

  static async createTodo(userId: string, todoData: any) {
    console.log('🔍 TodoController.createTodo called with:', {
      userId,
      todoDataKeys: Object.keys(todoData),
      title: todoData.title,
      titleLength: todoData.title?.length
    });

    try {
      console.log('🔗 Attempting database connection...');
      await connectDB();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
    
    try {
      console.log('📝 Creating todo with processed data:', {
        userId,
        title: todoData.title,
        titleLength: todoData.title?.length,
        descriptionLength: todoData.description?.length,
        priority: todoData.priority,
        status: todoData.status,
        tags: todoData.tags,
        isRecurring: todoData.isRecurring,
        dueDate: todoData.dueDate,
        estimatedDuration: todoData.estimatedDuration
      });

      // Validate required fields before creation
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided');
      }

      if (!todoData.title || typeof todoData.title !== 'string' || !todoData.title.trim()) {
        throw new Error('Title is required and must be a non-empty string');
      }

      const todo = await Todo.create({
        ...todoData,
        userId,
      });

      console.log('✅ Todo created successfully:', {
        id: todo._id,
        title: todo.title,
        userId: todo.userId
      });
      
      const todoJson = todo.toJSON();
      console.log('📤 Returning todo JSON:', todoJson);
      return todoJson;
    } catch (error) {
      console.error('❌ Error in TodoController.createTodo:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      
      // Handle MongoDB validation errors
      if (error instanceof Error && error.name === 'ValidationError') {
        const validationErrors = Object.values((error as any).errors).map((err: any) => err.message).join(', ');
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      // Handle duplicate key errors
      if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
        console.error('❌ Duplicate key error:', (error as any).keyPattern);
        throw new Error('Duplicate key error: A todo with this information already exists');
      }

      // Handle MongoDB connection errors
      if (error instanceof Error && (error.message.includes('MongooseError') || error.message.includes('MongoError'))) {
        console.error('❌ MongoDB error:', error.message);
        throw new Error(`Database error: ${error.message}`);
      }
      
      // Re-throw the original error with additional context
      throw new Error(`Failed to create todo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async updateTodo(userId: string, todoId: string, updateData: any) {
    await connectDB();
    
    // Convert string to ObjectId if it's a valid ObjectId format
    let query: any;
    if (/^[0-9a-fA-F]{24}$/.test(todoId)) {
      query = { _id: new mongoose.Types.ObjectId(todoId), userId };
    } else {
      query = { _id: todoId, userId };
    }
    
    // Get the original todo first to check if it's recurring
    const originalTodo = await Todo.findOne(query).lean();
    if (!originalTodo) {
      throw new Error('Todo not found');
    }
    
    // If status is being updated to 'completed', also mark as completed
    if (updateData.status === 'completed') {
      updateData.completed = true;
    } else if (updateData.status === 'new' || updateData.status === 'in-progress') {
      updateData.completed = false;
    }
    
    // If completed is being set to true, update status to 'completed'
    if (updateData.completed === true && !updateData.status) {
      updateData.status = 'completed';
    } else if (updateData.completed === false && !updateData.status) {
      updateData.status = 'new';
    }
    
    const todo = await Todo.findOneAndUpdate(
      query,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!todo) {
      throw new Error('Todo not found');
    }

    // Handle recurring task completion
    if (updateData.completed === true && (originalTodo as any).isRecurring && (originalTodo as any).recurringConfig && (originalTodo as any).dueDate) {
      try {
        const shouldCreateNext = RecurringTaskManager.shouldCreateNextInstance(
          (originalTodo as any).recurringConfig,
          new Date((originalTodo as any).dueDate)
        );

        if (shouldCreateNext) {
          const nextInstance = RecurringTaskManager.createNextInstance(originalTodo as any);
          await Todo.create(nextInstance);
        }
      } catch (error) {
        console.error('Error creating next recurring instance:', error);
        // Don't fail the update if recurring instance creation fails
      }
    }

    return todo;
  }

  static async deleteTodo(userId: string, todoId: string) {
    await connectDB();
    
    console.log('Attempting to delete todo:', { todoId, userId });
    
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId });

    if (!todo) {
      console.log('Todo not found for deletion:', { todoId, userId });
      throw new Error('Todo not found');
    }

    console.log('Todo deleted successfully:', todo._id);
    return { message: 'Todo deleted successfully' };
  }

  static async getTodoStats(userId: string): Promise<TodoStats> {
    await connectDB();
    
    const todos = await Todo.find({ userId }).lean();
    
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    const byPriority = {
      low: todos.filter(todo => todo.priority === 'low').length,
      medium: todos.filter(todo => todo.priority === 'medium').length,
      high: todos.filter(todo => todo.priority === 'high').length,
    };

    return {
      total,
      completed,
      pending,
      completionRate: Math.round(completionRate * 100) / 100,
      byPriority,
    };
  }
}