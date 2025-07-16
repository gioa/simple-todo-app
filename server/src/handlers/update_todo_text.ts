
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoTextInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTodoText = async (input: UpdateTodoTextInput): Promise<Todo> => {
  try {
    // Update the todo text and updated_at timestamp
    const result = await db.update(todosTable)
      .set({
        text: input.text,
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
    console.error('Todo text update failed:', error);
    throw error;
  }
};
