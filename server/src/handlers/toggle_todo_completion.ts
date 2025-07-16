
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type ToggleTodoCompletionInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export const toggleTodoCompletion = async (input: ToggleTodoCompletionInput): Promise<Todo> => {
  try {
    // Update the todo's completion status and updated_at timestamp
    const result = await db.update(todosTable)
      .set({
        completed: input.completed,
        updated_at: new Date()
      })
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Todo completion toggle failed:', error);
    throw error;
  }
};
