
import { z } from 'zod';

// Todo schema
export const todoSchema = z.object({
  id: z.number(),
  text: z.string(),
  completed: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Todo = z.infer<typeof todoSchema>;

// Input schema for creating todos
export const createTodoInputSchema = z.object({
  text: z.string().min(1, 'Todo text cannot be empty').max(500, 'Todo text too long')
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

// Input schema for updating todo text
export const updateTodoTextInputSchema = z.object({
  id: z.number(),
  text: z.string().min(1, 'Todo text cannot be empty').max(500, 'Todo text too long')
});

export type UpdateTodoTextInput = z.infer<typeof updateTodoTextInputSchema>;

// Input schema for toggling todo completion status
export const toggleTodoCompletionInputSchema = z.object({
  id: z.number(),
  completed: z.boolean()
});

export type ToggleTodoCompletionInput = z.infer<typeof toggleTodoCompletionInputSchema>;

// Input schema for deleting a todo
export const deleteTodoInputSchema = z.object({
  id: z.number()
});

export type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;
